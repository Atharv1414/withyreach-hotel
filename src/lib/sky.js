// Sky colours keyed by the sun's elevation in degrees. Between keys they are interpolated in
// linear light, which keeps dusk from going grey in the middle.
const KEYS = [
  { e: -18, top: '#07121b', mid: '#0d1f2b', low: '#16303a', water: '#0f2630', reed: '#0a161b' },
  { e: -8, top: '#11283a', mid: '#2b4256', low: '#6b5f67', water: '#33475a', reed: '#131f22' },
  { e: -3, top: '#27486a', mid: '#8a7a8c', low: '#e08f62', water: '#8b7680', reed: '#22271f' },
  { e: 2, top: '#3d6a91', mid: '#bfa698', low: '#f4b56f', water: '#b7a597', reed: '#3d3a22' },
  { e: 12, top: '#6aa3c4', mid: '#b4d0d8', low: '#e6e4d2', water: '#a9c3c8', reed: '#5f5a2c' },
  { e: 35, top: '#4c93c4', mid: '#9fcadd', low: '#dfebe8', water: '#93bccb', reed: '#6b6a31' },
]

const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)
const parse = (h) => [1, 3, 5].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255))
const format = (rgb) =>
  `#${rgb.map((c) => Math.round(255 * toSrgb(c)).toString(16).padStart(2, '0')).join('')}`

export function mix(a, b, t) {
  const [x, y] = [parse(a), parse(b)]
  return format(x.map((c, i) => c + (y[i] - c) * t))
}

export function skyAt(elevation) {
  if (elevation <= KEYS[0].e) return KEYS[0]
  const last = KEYS[KEYS.length - 1]
  if (elevation >= last.e) return last
  const i = KEYS.findIndex((k) => k.e > elevation)
  const [a, b] = [KEYS[i - 1], KEYS[i]]
  const t = (elevation - a.e) / (b.e - a.e)
  const out = { e: elevation }
  for (const k of ['top', 'mid', 'low', 'water', 'reed']) out[k] = mix(a[k], b[k], t)
  return out
}

export function luminance(hex) {
  const [r, g, b] = parse(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** Where the sky's gradient stands at `t`, 0 at the top and 1 at the horizon. */
export const STOPS = [0, 0.4, 0.8, 1]
export function skyColours(sky) {
  return [sky.top, mix(sky.top, sky.mid, 0.2), sky.mid, sky.low]
}
export function skyColourAt(sky, t) {
  const c = skyColours(sky)
  const i = Math.min(STOPS.findLastIndex((s) => s <= t), STOPS.length - 2)
  return mix(c[i], c[i + 1], (t - STOPS[i]) / (STOPS[i + 1] - STOPS[i]))
}

const INKS = ['#f4f8f7', '#0f2229', '#ffffff', '#000000']
/** Ink for text over the sky: the softer pair if one of them reads well enough, else pure. */
export function inkOn(hex) {
  const best = (pair) => pair.reduce((a, b) => (contrast(hex, b) > contrast(hex, a) ? b : a))
  const soft = best(INKS.slice(0, 2))
  return contrast(hex, soft) >= 4.5 ? soft : best(INKS.slice(2))
}
