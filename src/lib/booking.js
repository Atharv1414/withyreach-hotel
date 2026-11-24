// Prices and availability. Availability is generated from a hash of room and date, so the demo
// needs no server, every visitor sees the same calendar, and the tests can rely on it.
import { eachNight, month, nightsBetween, weekday } from './dates.js'

export const MAX_NIGHTS = 14
const MURMURATION = [11, 12, 1, 2] // starling season: the busy time here, unlike most hotels
const SUMMER = [6, 7, 8]

export function nightlyRate(room, date) {
  let rate = room.rate
  if (MURMURATION.includes(month(date))) rate *= 1.15
  else if (SUMMER.includes(month(date))) rate *= 1.1
  if (weekday(date) === 4 || weekday(date) === 5) rate *= 1.2 // Friday and Saturday nights
  return Math.round(rate / 5) * 5
}

function hash(text) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  h ^= h >>> 15
  h = Math.imul(h, 2246822507)
  return ((h ^ (h >>> 13)) >>> 0) / 2 ** 32
}

export function isFree(room, date) {
  // stays run in blocks of three days, so gaps look like real bookings and not confetti
  const block = Math.floor(nightsBetween('2020-01-01', date) / 3)
  const busy = weekday(date) >= 4 && weekday(date) <= 5 ? 0.42 : 0.24
  return hash(`${room.slug}:${block}`) > busy
}

export function stayProblem(room, from, to, guests) {
  if (!from || !to) return 'Choose your arrival and departure dates.'
  const nights = nightsBetween(from, to)
  if (nights < 1) return 'Departure must be after arrival.'
  if (nights > MAX_NIGHTS) return `The longest stay we book online is ${MAX_NIGHTS} nights.`
  if (guests > room.sleeps) return `${room.name} sleeps ${room.sleeps}.`
  const taken = eachNight(from, to).find((d) => !isFree(room, d))
  if (taken) return 'One of those nights is already taken.'
  return null
}

export const EXTRAS = [
  { id: 'supper', name: 'Supper on arrival', price: 42, per: 'guest' },
  { id: 'hide', name: 'Dawn at the bird hide, with a guide', price: 28, per: 'guest' },
  { id: 'dog', name: 'A dog', price: 20, per: 'stay' },
]

export function quote(room, from, to, guests, extras = []) {
  const nights = eachNight(from, to).map((date) => ({ date, rate: nightlyRate(room, date) }))
  const roomTotal = nights.reduce((s, n) => s + n.rate, 0)
  const longStay = nights.length >= 4 ? Math.round(roomTotal * 0.1) : 0
  const lines = EXTRAS.filter((e) => extras.includes(e.id)).map((e) => ({
    ...e, total: e.per === 'guest' ? e.price * guests : e.price,
  }))
  const total = roomTotal - longStay + lines.reduce((s, l) => s + l.total, 0)
  return { nights, roomTotal, longStay, lines, total, deposit: Math.round(total * 0.2) }
}

export const pounds = (n) => `£${n.toLocaleString('en-GB')}`

export function guestProblems({ name = '', email = '', phone = '' }) {
  const out = {}
  if (name.trim().length < 2) out.name = 'Enter the name for the booking.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    out.email = 'Enter an email address, like ada@example.com.'
  if (phone.trim() && phone.replace(/\D/g, '').length < 10)
    out.phone = 'Enter at least 10 digits, or leave this empty.'
  return out
}
