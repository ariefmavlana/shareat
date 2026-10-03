<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'staff' })
const { data, refresh } = await useFetch('/api/v1/admin/team')
const { mutate } = useStaff()
const error = ref(''),
  notice = ref(''),
  inviteToken = ref('')
const invite = reactive({
  email: '',
  organizationId: '',
  role: 'partner_editor',
})
const org = reactive({ name: '', slug: '', evidence: '' })
async function sendInvite() {
  try {
    const result = await mutate<{ token: string }>(
      '/api/v1/admin/team/invite',
      'POST',
      {
        email: invite.email,
        organizationId: invite.organizationId,
        roles: [invite.role],
      },
    )
    inviteToken.value = result.token
    notice.value =
      'Sampaikan token lewat kanal privat staff yang sudah diverifikasi. Berlaku 24 jam.'
  } catch (e) {
    error.value = staffError(e)
  }
}
async function proposeOrg() {
  try {
    await mutate('/api/v1/admin/team/organization', 'POST', org)
    notice.value =
      'Usulan mitra disimpan. Admin lain meninjaunya di halaman Kontak / usulan.'
  } catch (e) {
    error.value = staffError(e)
  }
}
async function recover(userId: string) {
  const reason = window.prompt(
    'Catatan verifikasi identitas dan alasan pemulihan (minimum 20 karakter):',
  )
  if (!reason) return
  try {
    await mutate('/api/v1/admin/team/recovery', 'POST', { userId, reason })
    notice.value =
      'Usulan pemulihan disimpan untuk pemeriksa kedua di halaman usulan.'
  } catch (e) {
    error.value = staffError(e)
  }
}
async function suspend(type: string, id: string) {
  const reason = window.prompt('Alasan penangguhan (minimum 5 karakter):')
  if (!reason) return
  try {
    await mutate('/api/v1/admin/team/suspend', 'POST', { type, id, reason })
    await refresh()
    notice.value = 'Akses ditangguhkan dan session dicabut.'
  } catch (e) {
    error.value = staffError(e)
  }
}
</script>
<template>
  <section>
    <span class="eyebrow">Identity & akses</span>
    <h1 class="mb-8 text-3xl">Tim dan mitra.</h1>
    <p v-if="error" role="alert" class="mb-5 error">{{ error }}</p>
    <p v-if="notice" role="status" class="mb-5">{{ notice }}</p>
    <p
      v-if="inviteToken"
      class="mb-7 break-all rounded-xl border bg-white p-5 font-mono text-sm"
    >
      Token privat: {{ inviteToken }}
    </p>
    <div class="grid items-start gap-7 lg:grid-cols-2">
      <form
        class="grid gap-5 rounded-2xl border bg-white p-7"
        @submit.prevent="sendInvite"
      >
        <h2 class="text-xl">Undang staff</h2>
        <label class="field"
          >Email<UiInput v-model="invite.email" type="email" required /></label
        ><label class="field"
          >Organisasi terverifikasi<select
            v-model="invite.organizationId"
            required
          >
            <option value="">Pilih organisasi</option>
            <option
              v-for="o in data?.organizations.filter(
                (o) => o.verified && !o.suspended,
              )"
              :key="o.id"
              :value="o.id"
            >
              {{ o.name }}
            </option>
          </select></label
        ><label class="field"
          >Peran<select v-model="invite.role">
            <option value="partner_editor">Editor mitra</option>
            <option value="editor">Editor tim</option>
            <option value="reviewer">Reviewer tim</option>
            <option value="operator">Operator</option>
            <option value="auditor">Auditor</option>
          </select></label
        ><UiButton type="submit" class="min-h-11">Buat token undangan</UiButton>
      </form>
      <form
        class="grid gap-5 rounded-2xl border bg-white p-7"
        @submit.prevent="proposeOrg"
      >
        <h2 class="text-xl">Ajukan verifikasi mitra</h2>
        <label class="field"
          >Nama organisasi<UiInput
            v-model="org.name"
            minlength="3"
            required /></label
        ><label class="field"
          >Slug<UiInput
            v-model="org.slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required /></label
        ><label class="field"
          >Catatan bukti identitas dan cakupan kerja sama (privat)<UiTextarea
            v-model="org.evidence"
            rows="4"
            minlength="20"
            maxlength="4000"
            required /></label
        ><UiButton type="submit" class="min-h-11"
          >Ajukan kepada admin lain</UiButton
        >
      </form>
    </div>
    <h2 class="mb-5 mt-10 text-2xl">Akun staff</h2>
    <div class="grid gap-4">
      <article
        v-for="u in data?.users"
        :key="u.id"
        class="flex flex-wrap justify-between gap-4 rounded-xl border bg-white p-5"
      >
        <div>
          <p>{{ u.email }}</p>
          <p class="text-xs text-muted-foreground">
            {{ u.roles.join(', ') }} ·
            {{ u.suspended ? 'ditangguhkan' : 'aktif' }}
          </p>
        </div>
        <UiButton variant="outline" class="min-h-11" @click="recover(u.id)"
          >Ajukan pemulihan</UiButton
        ><UiButton
          v-if="!u.suspended"
          variant="outline"
          class="min-h-11"
          @click="suspend('user', u.id)"
          >Tangguhkan akses</UiButton
        >
      </article>
    </div>
    <h2 class="mb-5 mt-10 text-2xl">Organisasi</h2>
    <div class="grid gap-4">
      <article
        v-for="o in data?.organizations"
        :key="o.id"
        class="flex flex-wrap justify-between gap-4 rounded-xl border bg-white p-5"
      >
        <div>
          <p>{{ o.name }}</p>
          <p class="text-xs text-muted-foreground">
            {{
              o.suspended
                ? 'ditangguhkan'
                : o.verified
                  ? 'terverifikasi'
                  : 'belum terverifikasi'
            }}
          </p>
        </div>
        <UiButton
          v-if="!o.suspended"
          variant="outline"
          class="min-h-11"
          @click="suspend('organization', o.id)"
          >Tangguhkan mitra</UiButton
        >
      </article>
    </div>
  </section>
</template>
