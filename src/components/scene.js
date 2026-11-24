// The marsh, drawn each frame from the hour. Pure drawing: no React, no DOM beyond the canvas.
import { mix, skyColours, STOPS } from '../lib/sky.js'

function rng(seed) {
  let s = seed
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

export function buildScene(seed = 7) {
  const r = rng(seed)
  const reeds = [0, 1, 2].map((layer) =>
    Array.from({ length: 90 + layer * 45 }, () => ({
      x: r(), h: 0.1 + r() * 0.13 + layer * 0.045, lean: (r() - 0.5) * 0.04, p: r() * 6.28,
      head: r() > 0.45, w: 0.8 + r() * 1.2,
    })))
  const stars = Array.from({ length: 160 }, () => ({ x: r(), y: r() * 0.5, a: 0.25 + r() * 0.75 }))
  const birds = Array.from({ length: 900 }, () => ({ a: r() * 6.28, d: Math.sqrt(r()), p: r() * 6.28, s: 0.7 + r() * 0.8 }))
  const ripples = Array.from({ length: 46 }, () => ({ x: r(), y: r(), w: 0.02 + r() * 0.1, p: r() * 6.28 }))
  return { reeds, stars, birds, ripples }
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function drawScene(ctx, w, h, scene, { sky, elevation, minutes, sun }, t) {
  const horizon = h * 0.62
  const g = ctx.createLinearGradient(0, 0, 0, horizon)
  skyColours(sky).forEach((c, i) => g.addColorStop(STOPS[i], c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, horizon + 1)

  const dark = clamp((-elevation - 4) / 8)
  if (dark > 0) {
    ctx.fillStyle = '#eaf2f5'
    for (const s of scene.stars) {
      ctx.globalAlpha = dark * s.a * (0.75 + 0.25 * Math.sin(t / 900 + s.x * 50))
      ctx.fillRect(s.x * w, s.y * h, 1.4, 1.4)
    }
    ctx.globalAlpha = 1
  }

  // the sun crosses from left to right between its real rising and setting times
  const rise = sun.riseMin ?? 360
  const set = sun.setMin ?? 1080
  const along = (minutes - rise) / (set - rise)
  const sx = w * (0.12 + 0.76 * along)
  const sy = horizon - (elevation / 62) * h * 0.52
  if (elevation > -4) {
    const size = Math.max(16, Math.min(w, h) * 0.035)
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 9)
    glow.addColorStop(0, 'rgb(255 236 190 / 60%)')
    glow.addColorStop(1, 'rgb(255 236 190 / 0%)')
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, w, horizon)
    ctx.clip()
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, horizon)
    ctx.fillStyle = elevation > 10 ? '#fffaf0' : '#ffdca0'
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, 7)
    ctx.fill()
    ctx.restore()
  }

  // far hills, and the tor with its tower
  const far = mix(sky.low, sky.reed, 0.38)
  ctx.fillStyle = far
  ctx.beginPath()
  ctx.moveTo(0, horizon)
  for (let x = 0; x <= w; x += 12) {
    const u = x / w
    const hill = 0.018 + 0.012 * Math.sin(u * 7 + 1) + 0.008 * Math.sin(u * 17)
    const tor = 0.105 * Math.exp(-(((u - 0.78) / 0.055) ** 2))
    ctx.lineTo(x, horizon - h * (hill + tor))
  }
  ctx.lineTo(w, horizon)
  ctx.fill()
  ctx.fillRect(w * 0.776, horizon - h * 0.163, w * 0.008, h * 0.05)

  // water
  const wg = ctx.createLinearGradient(0, horizon, 0, h)
  wg.addColorStop(0, mix(sky.low, sky.water, 0.45))
  wg.addColorStop(1, mix(sky.water, sky.reed, 0.35))
  ctx.fillStyle = wg
  ctx.fillRect(0, horizon, w, h - horizon)
  if (elevation > -4 && elevation < 30) {
    ctx.fillStyle = `rgb(255 226 170 / ${Math.round(34 * clamp((30 - elevation) / 26))}%)`
    for (let i = 0; i < 26; i++) {
      const y = horizon + ((h - horizon) * (i + 1)) / 27
      const spread = 8 + i * 5
      const wob = Math.sin(t / 700 + i * 1.7) * spread * 0.4
      ctx.fillRect(sx - spread + wob, y, spread * 2, 1.6)
    }
  }
  ctx.fillStyle = mix(sky.mid, '#ffffff', 0.25)
  for (const p of scene.ripples) {
    ctx.globalAlpha = 0.16 + 0.12 * Math.sin(t / 1100 + p.p)
    ctx.fillRect(p.x * w + Math.sin(t / 2600 + p.p) * 12, horizon + p.y * (h - horizon), p.w * w, 1)
  }
  ctx.globalAlpha = 1

  // starlings gather in the hour around sunset
  const flock = clamp(1 - Math.abs(elevation - 0.5) / 6.5) * (minutes > 720 ? 1 : 0)
  if (flock > 0.02) {
    const cx = w * (0.46 + 0.16 * Math.sin(t / 5200))
    const cy = horizon * (0.46 + 0.1 * Math.sin(t / 3700))
    const stretch = 1 + 0.6 * Math.sin(t / 2900)
    const tilt = Math.sin(t / 4300) * 0.8
    ctx.fillStyle = mix(sky.reed, '#000000', 0.35)
    const n = Math.floor(scene.birds.length * flock)
    for (let i = 0; i < n; i++) {
      const b = scene.birds[i]
      const a = b.a + Math.sin(t / 2100 + b.d * 4) * 0.9
      const rad = b.d * (1 + 0.28 * Math.sin(a * 3 + t / 1500))
      const ex = Math.cos(a) * rad * w * 0.13 * stretch
      const ey = (Math.sin(a) * rad * h * 0.1) / stretch
      const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt)
      const y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)
      const flap = 1 + 0.5 * Math.sin(t / 60 + b.p)
      ctx.fillRect(x, y, 2.2 * b.s, 1.1 * b.s * flap)
    }
  }

  // reeds, back to front
  scene.reeds.forEach((layer, k) => {
    const base = horizon + (h - horizon) * (0.34 + k * 0.34)
    ctx.strokeStyle = mix(mix(sky.reed, sky.low, 0.42 - k * 0.2), '#000000', k * 0.14)
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineCap = 'round'
    for (const s of layer) {
      const gap = Math.abs(s.x - 0.5) // leave open water in the middle of the near layers
      if (k > 0 && gap < 0.16 - k * 0.02) continue
      const x = s.x * w
      const top = base - s.h * h
      const sway = (Math.sin(t / 1500 + s.p + s.x * 5) * 0.012 + s.lean) * h
      ctx.lineWidth = s.w * (0.8 + k * 0.5)
      ctx.beginPath()
      ctx.moveTo(x, base + 30)
      ctx.quadraticCurveTo(x, (base + top) / 2, x + sway, top)
      ctx.stroke()
      if (s.head) {
        ctx.beginPath()
        ctx.ellipse(x + sway, top - 5, 1.4 + k * 0.7, 7 + k * 3, sway * 0.01, 0, 7)
        ctx.fill()
      }
    }
  })
}
