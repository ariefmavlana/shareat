<script setup lang="ts">
const route = useRoute()
</script>
<template>
  <ContentDetail
    :key="String(route.params.slug)"
    kind="story"
    :slug="String(route.params.slug)"
  />
</template>
