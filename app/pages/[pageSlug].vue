<script setup lang="ts">
const route = useRoute()
</script>
<template>
  <ContentDetail kind="page" :slug="String(route.params.pageSlug)" />
</template>
