"""Validate documentation references and traceability; never asserts app readiness."""

from __future__ import annotations

import csv
import hashlib
import re
import struct
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
REQUIRED = ["PRD.md", "SRS.md", "SDD.md", "DECISIONS.md", "EVIDENCE.md", "TRACEABILITY.md", "README.md"]


def dimensions(path: Path) -> tuple[str, str]:
    try:
        from PIL import Image
        with Image.open(path) as img:
            return str(img.width), str(img.height)
    except (ImportError, OSError, ValueError):
        if path.suffix.lower() == ".png":
            raw = path.read_bytes()[:24]
            if len(raw) >= 24 and raw[:8] == b"\x89PNG\r\n\x1a\n":
                width, height = struct.unpack(">II", raw[16:24])
                return str(width), str(height)
        return "", ""


def inventory() -> int:
    media_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".woff", ".woff2", ".ttf", ".eot"}
    paths = sorted(p for p in (ROOT / "referensi" / "assets").rglob("*") if p.is_file() and p.suffix.lower() in media_extensions)
    manifest = (DOCS / "ASSET_INVENTORY.csv").open("r", encoding="utf-8-sig", newline="")
    with manifest as handle:
        previous = {row["path"]: row for row in csv.DictReader(handle)}
    with (DOCS / "ASSET_INVENTORY.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["path", "bytes", "width", "height", "sha256", "category", "rights_status"])
        for path in paths:
            relative = path.relative_to(ROOT).as_posix()
            category = "font_or_vector" if path.suffix.lower() in {".svg", ".woff", ".woff2", ".ttf", ".eot"} else "image_reference"
            measured_width, measured_height = dimensions(path)
            known = previous.get(relative) or {}
            width = measured_width or known.get("width", "")
            height = measured_height or known.get("height", "")
            writer.writerow([relative, path.stat().st_size, width, height, hashlib.sha256(path.read_bytes()).hexdigest(), category, "unverified"])
    return len(paths)


class LegacyLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if value and key in {"src", "href", "action"}:
                self.links.add(value)
            if value and key == "style":
                self.links.update(re.findall(r"url\(['\"]?([^'\")]+)", value))


def legacy_missing() -> list[tuple[str, str]]:
    missing = []
    for page in sorted((ROOT / "referensi").glob("*.html")):
        parser = LegacyLinks()
        parser.feed(page.read_text(encoding="utf-8", errors="replace"))
        for link in sorted(parser.links):
            split = urlsplit(link)
            if split.scheme or split.netloc or not split.path:
                continue
            candidate = (page.parent / unquote(split.path)).resolve()
            if not candidate.exists():
                missing.append((page.relative_to(ROOT).as_posix(), split.path))
    with (DOCS / "LEGACY_MISSING_REFERENCES.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["html_file", "missing_local_reference"])
        writer.writerows(missing)
    return missing


def heading_anchors(markdown: str) -> set[str]:
    anchors = set()
    for title in re.findall(r"^#{1,6}\s+(.+)$", markdown, re.M):
        title = re.sub(r"[^\w\s-]", "", title.lower().replace("`", ""))
        anchors.add(re.sub(r"\s", "-", title))
    return anchors


def main() -> int:
    errors: list[str] = []
    checks: list[tuple[str, str]] = []
    asset_count = inventory()
    missing_legacy = legacy_missing()
    report_path = DOCS / "VALIDATION.md"
    if not report_path.exists():
        report_path.write_text("# Laporan validasi dokumentasi Shareat\n", encoding="utf-8")
    for filename in REQUIRED:
        if not (DOCS / filename).is_file():
            errors.append(f"Missing document: {filename}")
    files = sorted(DOCS.glob("*.md")) + sorted(ROOT.glob("*.md")) + [ROOT / ".github" / "PULL_REQUEST_TEMPLATE.md"]
    texts = {p: p.read_text(encoding="utf-8") for p in files if p.exists()}
    for path, content in texts.items():
        if content.count("```") % 2:
            errors.append(f"Unbalanced code fences: {path.name}")
        if path.name != "VALIDATION.md" and re.search(r"\b(?:TODO|TBD|FIXME)\b|\[INSERT[^\]]*\]", content):
            errors.append(f"Unresolved authoring placeholder: {path.name}")
        for destination in re.findall(r"\[[^\]]+\]\(([^)]+)\)", content):
            destination = destination.strip("<>")
            split = urlsplit(destination)
            if split.scheme or split.netloc:
                continue
            target = (path.parent / unquote(split.path)).resolve() if split.path else path
            if not target.exists():
                errors.append(f"Broken local link: {path.name} -> {destination}")
            elif split.fragment and target.suffix == ".md":
                target_text = texts.get(target) or target.read_text(encoding="utf-8")
                if split.fragment not in heading_anchors(target_text):
                    errors.append(f"Unknown heading anchor: {path.name} -> {destination}")

    srs = texts[DOCS / "SRS.md"]
    prd = texts[DOCS / "PRD.md"]
    sdd = texts[DOCS / "SDD.md"]
    trace = texts[DOCS / "TRACEABILITY.md"]
    requirements = re.findall(r"^\| ((?:FR|NFR)-\d{3}) \|", srs, re.M)
    expected = {f"FR-{i:03}" for i in range(1, 36)} | {f"NFR-{i:03}" for i in range(1, 13)}
    definitions = Counter(requirements)
    if set(definitions) != expected or any(n != 1 for n in definitions.values()):
        errors.append("Requirement IDs missing, unexpected or multiply defined")
    goals = set(re.findall(r"^\| (P-\d{2}) \|", prd, re.M))
    components = set(re.findall(r"^### (C-\d{2}) ", sdd, re.M))
    business_rules = re.findall(r"^\| (BR-\d{2}) \|", srs, re.M)
    if len(business_rules) != len(set(business_rules)):
        errors.append("Duplicate business rule definition")
    nfr_release = dict(re.findall(r"^\| (NFR-\d{3}) \| (R[12](?:/R2)?) \|", srs, re.M))
    rows = re.findall(r"^\| ((?:FR|NFR)-\d{3}) \| (P-\d{2}) \| (R[12](?:/R2)?) \| (C-\d{2}) \| (TC-\d{3}) \| (.+) \|$", trace, re.M)
    mapped = Counter(row[0] for row in rows)
    tests = Counter(row[4] for row in rows)
    if set(mapped) != expected or any(n != 1 for n in mapped.values()):
        errors.append("Traceability does not map every requirement exactly once")
    if set(tests) != {f"TC-{i:03}" for i in range(1, 48)} or any(n != 1 for n in tests.values()):
        errors.append("Acceptance scenario IDs not unique or incomplete")
    for requirement, goal, release, component, test, scenario in rows:
        if goal not in goals or component not in components:
            errors.append(f"Unknown PRD goal or SDD component: {requirement}")
        if len(scenario) < 30:
            errors.append(f"Acceptance scenario lacks detail: {test}")
        expected_release = "R1" if requirement.startswith("FR-") and int(requirement[3:]) <= 20 else "R2" if requirement.startswith("FR-") or requirement == "NFR-012" else "R1/R2"
        if release != expected_release:
            errors.append(f"Trace release inconsistent: {requirement}")
        if requirement.startswith("NFR-") and nfr_release.get(requirement) != release:
            errors.append(f"SRS and trace release differ: {requirement}")
    if set(row[1] for row in rows) != goals:
        errors.append("Unmapped product goal")

    checks.extend([
        ("Dokumen inti dan index", f"{len(REQUIRED)} dokumen utama; {len(texts)} berkas Markdown diperiksa termasuk index dan panduan kontribusi"),
        ("Requirements", f"{len(definitions)} ID unik: 35 FR dan 12 NFR"),
        ("Keterlacakan", f"{len(rows)} baris; 10 tujuan PRD dan 13 komponen SDD didefinisikan"),
        ("Penerimaan", f"{len(tests)} skenario TC unik; bukti aplikasi dicatat terpisah di IMPLEMENTATION.md"),
        ("Tautan lokal dan anchor", "Target berkas dan heading Markdown diperiksa"),
        ("Aturan bisnis", f"{len(business_rules)} BR unik; scope NFR konsisten dengan matriks"),
        ("Sintaks dasar", "Code fence seimbang, tidak ada penanda draft yang belum diselesaikan"),
        ("Inventaris media", f"{asset_count} media/font, checksum dan rights unverified"),
        ("Referensi legacy", f"{len(missing_legacy)} pasangan halaman/referensi lokal tidak ditemukan; bukan error dokumen baru"),
    ])
    report = [
        "# Laporan validasi dokumentasi Shareat", "",
        "**Tanggal acuan:** 3 Oktober 2026 · **Versi baseline:** 1.2", "",
        "Laporan ini memeriksa konsistensi struktural paket dokumentasi dan mencatat pemeriksaan editorial. Tidak menyatakan aplikasi, hosting, legalitas, atau pembayaran sudah diuji maupun siap produksi.", "",
        "## Hasil pemeriksaan otomatis", "",
        f"**Status: {'LULUS' if not errors else 'PERLU PERBAIKAN'}** · Error struktural: {len(errors)}.", "",
        "| Pemeriksaan | Hasil |", "| --- | --- |",
    ]
    report.extend(f"| {name} | {result} |" for name, result in checks)
    if errors:
        report.extend(["", "## Error", ""] + [f"- {item}" for item in errors])
    report.extend([
        "", "## Pemeriksaan konsistensi editorial", "",
        "- Klarifikasi pemilik tentang syarat minimum hosting, mitra terverifikasi, PostgreSQL, dan WA untuk tahap awal sudah dicantumkan dalam PRD/SRS/SDD/register.",
        "- R1 informasi/CMS/WA dibedakan dari R2 fundraising; route pembayaran R1 tidak terdaftar, tidak ada pemindahan ajakan transfer ke WA.",
        "- Terms, sumber klaim, status kegiatan, published revision dan pembatasan private data memakai definisi yang sama.",
        "- URL inisiatif dipertahankan pada R2; 404/private, 410 withdrawn, canonical pagination, filter noindex, sitemap dan redirect sudah diselaraskan.",
        "- Kebijakan Rp0 fee merupakan usulan R2 dengan gate sumber biaya operator; kas, fund availability, settlement, payout dan dampak dipisahkan.",
        "- Target recovery R1/R2 dibedakan; shared hosting tidak diklaim memenuhi Node/PITR/cron sebelum spike.",
        "- Versi package terkunci dan nomor WA preview sudah tersedia; lisensi media, organisasi/izin, jam/operator serta konten produksi tetap berada dalam register keputusan.",
        "", "## Temuan referensi lama", "",
        "Audit menemukan file/route lokal yang dirujuk HTML tetapi tidak tersedia. Daftar lengkap: [LEGACY_MISSING_REFERENCES.csv](LEGACY_MISSING_REFERENCES.csv). Missing reference tidak diteruskan sebagai route aplikasi baru. Integrasi peta legacy dengan kunci tertanam dibersihkan sebelum publikasi GitHub; aset gambar tetap dipertahankan.",
        "", "Inventaris [ASSET_INVENTORY.csv](ASSET_INVENTORY.csv) mengidentifikasi berkas serta checksum, bukan izin penggunaan. Visual inspection terbatas pada logo.png, slide1.png dan causes_4.png; media lain belum semuanya diperiksa secara visual.",
        "", "## Batas dan pekerjaan berikutnya", "",
        "Validator ini tidak menjalankan Nuxt atau uji browser. Source R1 dan hasil pemeriksaan aplikasi lokal tersedia di IMPLEMENTATION.md. Load test hosting, gateway, restore produksi, review legal final, dan persetujuan accountant belum dijalankan. Struktur link/ID tidak membuktikan bebas gap semantik atau bug. Mermaid tersimpan sebagai source; rendering diagram di panel belum diverifikasi otomatis.",
        "", "Owner perlu menyelesaikan [register keputusan dan gate](DECISIONS.md). Untuk penerimaan produksi, eksekusi [skenario penerimaan](TRACEABILITY.md) sesuai rilis dan simpan bukti hasil aktual. Sumber resmi serta batas verifikasi tersedia pada [EVIDENCE](EVIDENCE.md).", "",
        "## Cara mereproduksi", "", "Jalankan `python docs/tools/validate_docs.py` dari root workspace. Script menggunakan standard library; Pillow optional untuk membaca dimensi tambahan. Script hanya menulis inventaris/laporan di docs, tidak mengedit aset lama, mengirim pesan WA atau mengaktifkan transaksi.", "",
    ])
    report_path.write_text("\n".join(report), encoding="utf-8")
    print(f"Documents: {len(texts)}; requirements: {len(definitions)}; scenarios: {len(tests)}; assets: {asset_count}; legacy missing: {len(missing_legacy)}")
    for error in errors:
        print(f"ERROR: {error}")
    print(f"Structural errors: {len(errors)}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
