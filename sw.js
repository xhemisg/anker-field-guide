// Hält den ANKER Field Guide nach dem ersten Aufruf offline verfügbar, wenn er über HTTPS bereitgestellt wird.
const CACHE = 'anker-field-guide-v2'
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './anker-icon-192.png', './anker-icon-512.png', './anker-icon-180.png']

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches
      .open(CACHE)
      .then((speicher) => speicher.addAll(DATEIEN))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

// Netz zuerst, damit neue Versionen ankommen. Ohne Netz antwortet der Zwischenspeicher.
self.addEventListener('fetch', (ereignis) => {
  if (ereignis.request.method !== 'GET') return
  ereignis.respondWith(
    fetch(ereignis.request)
      .then((antwort) => {
        const kopie = antwort.clone()
        caches.open(CACHE).then((speicher) => speicher.put(ereignis.request, kopie))
        return antwort
      })
      .catch(() => caches.match(ereignis.request).then((treffer) => treffer ?? caches.match('./index.html'))),
  )
})
