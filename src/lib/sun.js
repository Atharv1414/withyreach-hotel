// Position of the sun over the hotel, from the standard low-precision almanac formulae
// (accurate to about a hundredth of a degree, far better than a background needs).
export const SITE = { lat: 51.07, lon: -2.92 }
const RAD = Math.PI / 180

export function solarElevation(date, { lat, lon } = SITE) {
  const d = date.getTime() / 86_400_000 - 10957.5 // days since J2000
  const g = (357.529 + 0.98560028 * d) * RAD
  const q = 280.459 + 0.98564736 * d
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD
  const e = (23.439 - 0.00000036 * d) * RAD
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const gmst = (18.697374558 + 24.06570982441908 * d) * 15 * RAD
  const h = gmst + lon * RAD - ra
  const s = Math.sin(lat * RAD) * Math.sin(dec) + Math.cos(lat * RAD) * Math.cos(dec) * Math.cos(h)
  return Math.asin(s) / RAD
}

/** Minutes past UTC midnight at which the sun crosses `angle`, or null if it does not. */
export function crossing(date, rising, angle = -0.833, site = SITE) {
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const at = (m) => solarElevation(new Date(day + m * 60_000), site) - angle
  const [from, to] = rising ? [0, 750] : [690, 1440]
  let lo = from
  let hi = to
  if (Math.sign(at(lo)) === Math.sign(at(hi))) return null
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (Math.sign(at(mid)) === Math.sign(at(lo))) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** "16:07" in UK local time. */
export function clock(date, minutes) {
  if (minutes === null) return 'none'
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  }).format(new Date(day + Math.round(minutes) * 60_000))
}

export function sunTimes(date) {
  const rise = crossing(date, true)
  const set = crossing(date, false)
  return { rise: clock(date, rise), set: clock(date, set), riseMin: rise, setMin: set }
}

/** night | dawn | day | dusk. Below -6 degrees is the end of civil twilight. */
export function phase(elevation, rising) {
  if (elevation < -6) return 'night'
  if (elevation < 8) return rising ? 'dawn' : 'dusk'
  return 'day'
}
