import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { generateSecret, generateURI } from 'otplib'
import { database, closeDatabase } from '../server/db/client'
import { users, organizations, settings, entities } from '../server/db/schema'
import { hashPassword, encrypt } from '../server/modules/identity/crypto'
import { ContentService } from '../server/modules/content/service'
import { mysqlContentRepository } from '../server/modules/content/mysql-repository'
import type {
  ContentBody,
  ContentKind,
  Actor,
} from '../shared/contracts/content'
if (process.env.NUXT_APP_MODE !== 'demo')
  throw new Error('Demo seed hanya diizinkan pada mode demo')
const password = process.env.DEMO_STAFF_PASSWORD
if (!password || password.length < 16)
  throw new Error('Set DEMO_STAFF_PASSWORD minimum 16 karakter di .env')
const db = database()
try {
  await db
    .update(organizations)
    .set({ type: 'team' })
    .where((await import('drizzle-orm')).eq(organizations.slug, 'shareat-demo'))
  const existing = await db.select().from(entities).limit(1)
  if (existing.length) {
    console.log(
      'Database sudah berisi konten; seed tidak menimpa perubahan CMS.',
    )
    process.exitCode = 0
  } else {
    const existingOrgs = await db.select().from(organizations)
    const existingUsers = await db.select().from(users)
    const team =
        existingOrgs.find((x) => x.slug === 'shareat-demo')?.id ?? randomUUID(),
      partner =
        existingOrgs.find((x) => x.slug === 'mitra-demo')?.id ?? randomUUID(),
      editorId =
        existingUsers.find((x) => x.email === 'editor@shareat.example')?.id ??
        randomUUID(),
      reviewerId =
        existingUsers.find((x) => x.email === 'reviewer@shareat.example')?.id ??
        randomUUID(),
      partnerId =
        existingUsers.find((x) => x.email === 'mitra@shareat.example')?.id ??
        randomUUID()
    await db
      .insert(organizations)
      .values([
        {
          id: team,
          type: 'team' as const,
          name: 'Tim demo Shareat',
          slug: 'shareat-demo',
          verified: true,
          evidence: 'Identitas demo; bukan organisasi terverifikasi nyata.',
        },
        {
          id: partner,
          name: 'Komunitas demo',
          slug: 'mitra-demo',
          verified: true,
          evidence: 'Contoh ruang akses mitra; bukan mitra Shareat nyata.',
        },
      ])
      .onDuplicateKeyUpdate({ set: { verified: true } })
    const credentials = []
    for (const info of [
      {
        id: editorId,
        email: 'editor@shareat.example',
        roles: ['editor', 'admin', 'operator'],
        organizationId: team,
      },
      {
        id: reviewerId,
        email: 'reviewer@shareat.example',
        roles: ['reviewer', 'admin', 'auditor'],
        organizationId: team,
      },
      {
        id: partnerId,
        email: 'mitra@shareat.example',
        roles: ['partner_editor'],
        organizationId: partner,
      },
    ]) {
      if (existingUsers.some((x) => x.email === info.email)) continue
      const secret = generateSecret()
      await db.insert(users).values({
        ...info,
        passwordHash: await hashPassword(password),
        mfaCipher: encrypt(secret),
        createdAt: new Date(),
      })
      credentials.push({
        email: info.email,
        password,
        totpSecret: secret,
        enrollmentUri: generateURI({
          issuer: 'Shareat Demo',
          label: info.email,
          secret,
        }),
      })
    }
    await mkdir('.data', { recursive: true })
    if (credentials.length)
      await writeFile(
        '.data/demo-access.json',
        JSON.stringify(credentials, null, 2),
        { mode: 0o600 },
      )
    await db
      .insert(settings)
      .values({
        key: 'contact',
        value: {
          phone: '6287776734038',
          hours: 'Contoh jam layanan: Senin–Jumat, 09.00–17.00 WIB',
          ownershipVerified: true,
        },
      })
      .onDuplicateKeyUpdate({ set: { key: 'contact' } })
    const service = new ContentService(mysqlContentRepository())
    const editor: Actor = {
      id: editorId,
      roles: ['editor'],
      organizationId: team,
      verified: true,
    }
    const reviewer: Actor = {
      id: reviewerId,
      roles: ['reviewer'],
      organizationId: team,
      verified: true,
    }
    async function publish(
      kind: ContentKind,
      slug: string,
      input: Partial<ContentBody> &
        Pick<ContentBody, 'title' | 'summary' | 'paragraphs'>,
    ) {
      const { slug: _slug, ...cleanInput } = input as typeof input & {
        slug?: string
      }
      const body = {
        activityStatus: 'planning' as const,
        demo: true,
        sortOrder: 0,
        ...cleanInput,
      }
      const item = await service.create(editor, kind, body, slug)
      await service.transition(editor, item.id, 1, 'submit')
      await service.transition(reviewer, item.id, 2, 'review', {
        claims: true,
        media: true,
        privacy: true,
        seo: true,
        contact: true,
      })
      await service.transition(reviewer, item.id, 3, 'publish')
    }
    const programs = [
      {
        slug: 'share-eat',
        title: 'Share Eat',
        summary:
          'Berbagi makanan, membuka ruang kebersamaan. Kepedulian dimulai dari kebutuhan yang paling dekat.',
        paragraphs: [
          'Share Eat adalah konsep program akses pangan dan kegiatan berbagi makanan. Contoh di situs ini membantu memperlihatkan cara informasi kegiatan disajikan.',
          'Kolaborasi dapat dibicarakan bersama tim: waktu, pengetahuan, dan jejaring. Rencana kegiatan aktual akan diterbitkan setelah penanggung jawab dan informasi pendukung disetujui.',
        ],
      },
      {
        slug: 'share-knowledge',
        title: 'Share Knowledge',
        summary:
          'Pengetahuan tumbuh saat dibagikan. Membuka kesempatan belajar bersama untuk lebih banyak orang.',
        paragraphs: [
          'Share Knowledge adalah konsep kegiatan belajar, berbagi keterampilan, dan bertukar pengalaman. Agenda dan fasilitator pada preview merupakan contoh.',
          'Bentuk kolaborasi dapat berupa diskusi topik, pendampingan, dan pengenalan jejaring. Jadwal aktual akan dijelaskan pada pembaruan yang ditinjau tim.',
        ],
      },
      {
        slug: 'share-book',
        title: 'Share Book',
        summary:
          'Satu buku membuka banyak kemungkinan. Menghubungkan rasa ingin tahu dengan ruang untuk membaca.',
        paragraphs: [
          'Share Book adalah konsep program literasi dan akses buku. Preview ini menggambarkan bentuk penjelasan kebutuhan komunitas tanpa mengklaim distribusi yang sudah terjadi.',
          'Tim dapat membicarakan kebutuhan literasi dan ide kegiatan bersama komunitas. Penerimaan serta pengiriman barang belum menjadi layanan platform R1.',
        ],
      },
    ]
    for (const [index, p] of programs.entries())
      await publish('program', p.slug, { ...p, sortOrder: index })
    const initiatives = [
      {
        slug: 'dapur-berbagi',
        title: 'Dapur berbagi akhir pekan',
        summary:
          'Contoh rencana ruang berbagi makanan dan cerita bersama warga. Mari mengenal kebutuhan dan peluang kolaborasinya.',
        programSlug: 'share-eat',
        location: 'Bandung',
        schedule: 'Jadwal contoh — belum ditetapkan',
      },
      {
        slug: 'kelas-keterampilan',
        title: 'Ruang belajar keterampilan',
        summary:
          'Contoh rencana sesi belajar bersama tentang keterampilan sehari-hari, dengan materi yang mudah dipahami.',
        programSlug: 'share-knowledge',
        location: 'Jakarta',
        schedule: 'Jadwal contoh — belum ditetapkan',
      },
      {
        slug: 'pojok-baca',
        title: 'Pojok baca untuk bertumbuh',
        summary:
          'Contoh rencana ruang membaca yang dekat dengan komunitas, untuk memulai kebiasaan baik dari satu halaman.',
        programSlug: 'share-book',
        location: 'Yogyakarta',
        schedule: 'Jadwal contoh — belum ditetapkan',
      },
    ]
    for (const i of initiatives)
      await publish('initiative', i.slug, {
        ...i,
        responsible: 'Tim demo Shareat',
        paragraphs: [
          'Ini adalah data demo untuk meninjau tampilan dan alur platform. Kegiatan, lokasi, jadwal, dan penanggung jawab di halaman ini belum menyatakan kegiatan nyata.',
          'Tujuan contoh ini adalah memperkenalkan cara sebuah inisiatif menjelaskan kebutuhan dengan sederhana, menyampaikan rencana dengan jujur, dan membuka percakapan kolaborasi.',
          'Hubungi tim untuk mengenal arah program. WhatsApp adalah kanal percakapan eksternal; platform tidak otomatis mengirim pesan atau menerima pembayaran.',
        ],
      })
    for (const story of [
      {
        slug: 'berbagi-dari-hal-kecil',
        title: 'Berbagi bisa dimulai dari hal kecil',
        programSlug: 'share-eat',
      },
      {
        slug: 'belajar-bersama',
        title: 'Ketika pengetahuan menjadi jembatan',
        programSlug: 'share-knowledge',
      },
      {
        slug: 'cerita-satu-buku',
        title: 'Cerita yang berawal dari satu buku',
        programSlug: 'share-book',
      },
    ])
      await publish('story', story.slug, {
        ...story,
        summary:
          'Cerita contoh untuk memperlihatkan cara pembaruan dan konteks kegiatan dibaca di Shareat.',
        author: 'Tim editorial demo',
        paragraphs: [
          'Narasi ini adalah contoh, bukan laporan kegiatan atau dampak Shareat. Setiap cerita aktual perlu ditinjau bersama bukti dan izin publikasinya.',
          'Di ruang ini, tim nantinya dapat menjelaskan proses kegiatan, pembelajaran, dan pembaruan dengan bahasa yang jelas. Tidak ada angka dampak yang disimpulkan dari rencana atau perkiraan.',
        ],
      })
    const pages = [
      {
        slug: 'tentang',
        title: 'Ruang untuk berbagi, bersama.',
        summary:
          'Shareat dirancang sebagai ruang informasi dan kolaborasi untuk misi kemanusiaan di Indonesia.',
        paragraphs: [
          'Shareat adalah nama kerja platform yang berfokus pada berbagi pangan, pengetahuan, buku, dan peluang kemanusiaan lainnya. Identitas tim pada preview masih merupakan contoh.',
          'Kami ingin informasi mudah ditemukan, rencana mudah dipahami, dan pertanggungjawaban mudah diperiksa. Profil organisasi dan tim aktual akan diterbitkan setelah verifikasi.',
        ],
      },
      {
        slug: 'transparansi',
        title: 'Kepercayaan dibangun dari keterbukaan.',
        summary:
          'Kenali cara konten ditinjau, rencana dijelaskan, dan informasi diperbarui sebelum dipublikasikan.',
        paragraphs: [
          'Status platform saat ini: preview informasi dan kontak. Badan hukum, izin penggalangan dana, serta payment gateway belum tersedia. Platform tidak menerima pembayaran atau meminta transfer melalui WhatsApp.',
          'Konten aktual akan melewati pemeriksaan klaim, hak media, privasi, SEO, dan kanal kontak. Penulis dan penyetuju publikasi harus berbeda identitas.',
          'Belum ada laporan kegiatan atau statistik dampak nyata. Konten pada preview adalah contoh, dan dapat diubah melalui CMS.',
        ],
      },
      {
        slug: 'privasi',
        title: 'Kebijakan privasi — contoh untuk ditinjau',
        summary:
          'Contoh kebijakan yang harus disesuaikan dan disetujui sebelum platform diluncurkan untuk publik.',
        paragraphs: [
          'Dokumen ini adalah draft demo, bukan kebijakan final. Website tidak membaca isi chat WhatsApp. Saat Anda membuka tautan WhatsApp, layanan dan kebijakan pihak tersebut berlaku.',
          'CMS menyimpan data akun staff, autentikasi MFA, session, revisi konten, dan audit untuk mengendalikan akses. Preview tidak mengaktifkan tracker analytics non-esensial.',
          'Permintaan koreksi informasi dapat dibicarakan melalui kanal kontak. Identitas pengendali data, dasar pemrosesan, retensi, dan prosedur hak subjek perlu dilengkapi serta diperiksa sebelum peluncuran.',
        ],
      },
      {
        slug: 'ketentuan',
        title: 'Ketentuan penggunaan — contoh untuk ditinjau',
        summary:
          'Contoh ketentuan penggunaan ruang informasi dan kontak Shareat pada tahap R1.',
        paragraphs: [
          'Dokumen ini adalah draft demo untuk review. Informasi kegiatan contoh tidak merupakan penawaran atau bukti kegiatan yang sudah terlaksana.',
          'R1 menyediakan informasi dan kanal percakapan. Tidak ada checkout, rekening, QR pembayaran, penerimaan barang, booking, atau bukti donasi.',
          'WhatsApp memerlukan tindakan pengguna untuk mengirim pesan. Kanal kontak bukan layanan darurat, dan klik tautan tidak memastikan tim telah menerima atau membalas pesan.',
        ],
      },
    ]
    for (const p of pages)
      await publish('page', p.slug, { ...p, effectiveDate: '2026-10-03' })
    for (const [index, f] of [
      {
        slug: 'cara-berpartisipasi',
        title: 'Bagaimana saya bisa ikut berbagi?',
        summary:
          'Mulai dari mengenal program lalu hubungi tim untuk membicarakan waktu, pengetahuan, atau jejaring yang dapat dibagikan.',
      },
      {
        slug: 'pembayaran',
        title: 'Apakah saya bisa berdonasi di sini?',
        summary:
          'Tahap ini menyediakan informasi dan kontak. Platform belum menerima pembayaran atau mengarahkan transfer melalui WhatsApp.',
      },
      {
        slug: 'informasi-kegiatan',
        title: 'Apakah kegiatan pada preview sudah berlangsung?',
        summary:
          'Belum. Semua kegiatan, cerita, identitas, dan jadwal pada preview adalah contoh untuk meninjau tampilan dan alur CMS.',
      },
      {
        slug: 'koreksi-informasi',
        title: 'Bagaimana melaporkan informasi yang perlu dikoreksi?',
        summary:
          'Hubungi tim dengan judul halaman atau tautannya. Hindari mengirim data pribadi penerima manfaat di percakapan awal.',
      },
    ].entries())
      await publish('faq', f.slug, {
        ...f,
        paragraphs: [f.summary],
        sortOrder: index,
      })
    console.log(
      'Demo tersimpan di MySQL; kredensial dan enrollment lokal: .data/demo-access.json (tidak dilacak Git).',
    )
  }
} finally {
  await closeDatabase()
}
