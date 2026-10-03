export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    event.context.startedAt = performance.now()
  })
  nitro.hooks.hook('afterResponse', (event) => {
    console.info(
      JSON.stringify({
        level: event.node.res.statusCode >= 500 ? 'error' : 'info',
        event: 'http_completed',
        requestId: event.context.requestId,
        method: event.method,
        status: event.node.res.statusCode,
        durationMs: Math.round(
          performance.now() -
            Number(event.context.startedAt ?? performance.now()),
        ),
        area: event.path.startsWith('/api/v1/admin')
          ? 'cms'
          : event.path.startsWith('/api/v1/auth')
            ? 'identity'
            : event.path.startsWith('/api')
              ? 'api'
              : 'public',
      }),
    )
  })
})
