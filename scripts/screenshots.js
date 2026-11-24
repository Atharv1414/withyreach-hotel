// Usage: npm run build, then vite preview on port 4173, then node scripts/screenshots.js <folder>
import process from 'node:process'
import { chromium } from '@playwright/test'
const b = await chromium.launch({ channel: process.env.PW_CHANNEL })
const H = { day: '2027-04-06T11:00:00Z', dusk: '2027-01-12T16:24:00Z', night: '2027-01-12T22:00:00Z' }
async function go(name, path, hour, vp, full = false) {
  const c = await b.newContext({ viewport: vp, reducedMotion: 'reduce' }); const p = await c.newPage()
  await p.clock.setFixedTime(new Date(H[hour])); await p.goto('http://localhost:4173' + path); await p.waitForTimeout(700)
  await p.screenshot({ path: `${process.argv[2]}/${name}.png`, fullPage: full }); await c.close()
}
const D = { width: 1280, height: 800 }, M = { width: 390, height: 844 }
await go('home-dusk', '/', 'dusk', D, true); await go('home-day', '/', 'day', D); await go('home-night', '/', 'night', M, true)
await go('rooms', '/rooms', 'day', D); await go('room', '/rooms/abbots-reach', 'day', D); await go('book', '/book?room=the-eel-room', 'day', D)
await go('around', '/around', 'day', D); await go('eat', '/eat', 'night', D); await go('book-m', '/book', 'day', M, true)
await b.close()
