// Service worker: makes the site installable and lets the app shell open without a network.
// - Hashed build files (/assets/*) and icons are cached on first use (they never change under the same name).
// - Page navigations go to the network first; offline, the cached index.html is served (SPA routing).
// - Supabase and other cross-origin requests are not touched, so progress and notes are always live.

const STATIC_CACHE = 'static-v1'
const SHELL_CACHE = 'shell-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add('/index.html'))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const keep = [STATIC_CACHE, SHELL_CACHE]
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// Daily reminder pushed by /api/remind.
self.addEventListener('push', (event) => {
  let data = { title: 'Road to Big Tech', body: 'Time to study.', url: '/roadmap' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    // Keep the default text when the payload is missing or not JSON.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/roadmap'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => new URL(c.url).pathname.startsWith('/roadmap'))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
