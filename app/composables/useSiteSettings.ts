export const useSiteSettings = () =>
  useFetch('/api/v1/public/settings', { key: 'site-settings' })
