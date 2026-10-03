export default defineNuxtRouteMiddleware(async () => {
  try {
    await useStaff().load()
  } catch {
    return navigateTo('/admin/login')
  }
})
