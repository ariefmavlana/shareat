<script setup lang="ts">
import type { ContentRecord } from '~~/shared/contracts/content'
definePageMeta({ layout: 'admin', middleware: 'staff' })
const route = useRoute()
const { data, error } = await useFetch<ContentRecord>(
  '/api/v1/admin/content/' + String(route.params.id),
)
if (error.value)
  throw createError({
    statusCode: error.value.statusCode ?? 503,
    statusMessage: 'Preview tidak tersedia',
  })
const body = computed(() => data.value?.revisions.at(-1)?.body)
useSeoMeta({ title: 'Preview privat | Shareat', robots: 'noindex, nofollow' })
</script>
<template>
  <article v-if="body" class="max-w-4xl rounded-2xl border bg-white p-8">
    <span class="eyebrow">Preview privat — bukan snapshot publik</span>
    <h1 class="text-4xl">{{ body.title }}</h1>
    <p class="my-7 text-xl text-muted-foreground">{{ body.summary }}</p>
    <div class="prose">
      <p v-for="(paragraph, index) in body.paragraphs" :key="index">
        {{ paragraph }}
      </p>
    </div>
  </article>
</template>
