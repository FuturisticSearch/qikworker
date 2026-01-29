export async function onRequest(context) {
  const { request, env, params } = context
  const url = new URL(request.url)
  const path = url.pathname + url.search

  const hosts = [
    'https://1.qikseek.eu.org',      // Primary 1
    'https://2.qikseek.eu.org',      // Primary 2
    'https://3.qikseek.eu.org',      // Primary 3
    'https://qikseek.pages.dev',     // First backup
    'https://qikseek.onrender.com',  // Backup 2
    'https://qikseek.netlify.app'    // Backup 3
  ]

  for (const host of hosts) {
    try {
      const res = await fetch(host + path, {
        redirect: 'manual',
        headers: request.headers
      })

      if (res.ok || res.status === 301 || res.status === 302) {
        const headers = new Headers(res.headers)

        // Force HTML, canonical, and CORS
        headers.delete('Location')
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Content-Type', 'text/html; charset=UTF-8')
        headers.set('Link', `<https://qikseek.eu.org${path}>; rel="canonical"`)
        headers.set('X-Served-By', 'qikseek-pages-function')

        return new Response(res.body, {
          status: res.status >= 300 && res.status < 400 ? 200 : res.status,
          headers
        })
      }
    } catch (e) {
      // Try next host
    }
  }

  return new Response(
    'All backends are currently unavailable. Please try again later or contact futuresearchapi@gmail.com',
    { status: 503 }
  )
}
