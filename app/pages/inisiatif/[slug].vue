<script setup lang="ts">
const route = useRoute()
</script>
<template>
  <ContentDetail
    :key="String(route.params.slug)"
    kind="initiative"
    :slug="String(route.params.slug)"
  />
</template>
