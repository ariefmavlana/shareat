<script setup lang="ts">
const route = useRoute()
</script>
<template>
  <PolicyVersion :id="String(route.params.id)" slug="privasi" />
</template>
