// GitHub Pages serves files, not routes. Give every known route its own index.html so deep links
// return 200, and use the app's own not-found page as 404.html.
import { copyFileSync, mkdirSync } from 'node:fs'
import { rooms } from '../src/data/rooms.js'

const routes = ['rooms', 'eat', 'around', 'book', ...rooms.map((r) => `rooms/${r.slug}`)]
for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${route}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html')
console.log(`${routes.length} routes written`)
