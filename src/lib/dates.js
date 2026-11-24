// Calendar dates as 'YYYY-MM-DD' strings. They compare correctly as text and cannot drift by a
// day when the clocks change, which Date objects in local time can.
export const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const utc = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const back = (ms) => new Date(ms).toISOString().slice(0, 10)

export const addDays = (s, n) => back(utc(s) + n * 86_400_000)
export const nightsBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86_400_000)
export const weekday = (s) => (new Date(utc(s)).getUTCDay() + 6) % 7 // Monday = 0
export const month = (s) => Number(s.slice(5, 7))

export function eachNight(from, to) {
  const out = []
  for (let d = from; d < to; d = addDays(d, 1)) out.push(d)
  return out
}

export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(now)
}

export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const k = y * 12 + (m - 1) + n
  return `${Math.floor(k / 12)}-${String((k % 12) + 1).padStart(2, '0')}`
}

/** Weeks of a month, Monday first, padded with nulls. */
export function monthGrid(ym) {
  const first = `${ym}-01`
  const days = nightsBetween(first, `${addMonths(ym, 1)}-01`)
  const cells = [
    ...Array(weekday(first)).fill(null),
    ...Array.from({ length: days }, (_, i) => addDays(first, i)),
  ]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
}

const fmt = (opts) => (s) =>
  new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'UTC' }).format(new Date(utc(s)))
export const longDate = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const shortDate = fmt({ weekday: 'short', day: 'numeric', month: 'short' })
export const monthName = (ym) => fmt({ month: 'long', year: 'numeric' })(`${ym}-01`)
