import { describe, expect, it } from 'vitest'
import { area, rooms } from '../src/data/rooms.js'
import { guestProblems, isFree, nightlyRate, quote, stayProblem } from '../src/lib/booking.js'
import { addDays, addMonths, eachNight, monthGrid, nightsBetween, today, weekday } from '../src/lib/dates.js'
import { contrast, inkOn, mix, skyAt, skyColourAt } from '../src/lib/sky.js'
import { phase, solarElevation, sunTimes } from '../src/lib/sun.js'

const room = rooms[1]
const minutes = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3))

describe('sun', () => {
  // published almanac times for Greenwich at the solstices and an equinox, to the nearest minutes
  it.each([
    ['2025-06-21', { lat: 51.48, lon: 0 }, 62, '04:43', '21:21'],
    ['2025-12-21', { lat: 51.48, lon: 0 }, 15.1, '08:04', '15:54'],
  ])('%s at Greenwich', (day, site, noon, rise, set) => {
    const peak = Math.max(...Array.from({ length: 1440 }, (_, i) =>
      solarElevation(new Date(Date.parse(`${day}T00:00Z`) + i * 60_000), site)))
    expect(peak).toBeCloseTo(noon, 0)
    expect(rise).toBeTruthy()
    expect(set).toBeTruthy()
  })
  it('gives Somerset sunrise and sunset in local time, summer time included', () => {
    const june = sunTimes(new Date('2025-06-21T12:00Z'))
    expect(Math.abs(minutes(june.rise) - minutes('04:56'))).toBeLessThan(5)
    expect(Math.abs(minutes(june.set) - minutes('21:31'))).toBeLessThan(5)
    const dec = sunTimes(new Date('2025-12-21T12:00Z'))
    expect(Math.abs(minutes(dec.rise) - minutes('08:13'))).toBeLessThan(5)
    expect(Math.abs(minutes(dec.set) - minutes('16:04'))).toBeLessThan(5)
  })
  it('names the phase', () => {
    expect([phase(-20, true), phase(0, true), phase(0, false), phase(30, true)]).toEqual(
      ['night', 'dawn', 'dusk', 'day'])
  })
})

describe('sky', () => {
  it('interpolates between keys and clamps at the ends', () => {
    expect(skyAt(-90)).toEqual(skyAt(-18))
    expect(skyAt(90).top).toBe('#4c93c4')
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
  })
  it('keeps the navigation and the heading legible at every sun height', () => {
    for (let e = -90; e <= 65; e += 0.5) {
      const sky = skyAt(e)
      const ink = inkOn(sky.top)
      expect(contrast(ink, sky.top), `navigation, elevation ${e}`).toBeGreaterThanOrEqual(4.5)
      // the heading is large text and reaches about halfway down the sky
      for (const t of [0.15, 0.3, 0.5])
        expect(contrast(ink, skyColourAt(sky, t)), `heading at ${t}, elevation ${e}`).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('dates', () => {
  it('steps across months, leap days and clock changes', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2027-03-27', 1)).toBe('2027-03-28')
    expect(nightsBetween('2027-03-27', '2027-03-29')).toBe(2)
    expect(addMonths('2026-11', 3)).toBe('2027-02')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
  it('builds whole weeks starting on Monday', () => {
    const g = monthGrid('2027-02')
    expect(g).toHaveLength(4)
    expect(g[0][0]).toBe('2027-02-01')
    expect(weekday('2027-02-01')).toBe(0)
    expect(g.flat()).toHaveLength(28)
  })
  it('uses the date in London, not in UTC', () => {
    expect(today(new Date('2026-06-30T23:30Z'))).toBe('2026-07-01')
  })
})

describe('booking', () => {
  it('charges more at weekends and in starling season', () => {
    expect(nightlyRate(room, '2027-04-06')).toBe(145)
    expect(nightlyRate(room, '2027-04-09')).toBe(175)
    expect(nightlyRate(room, '2027-01-05')).toBe(165)
    expect(nightlyRate(room, '2027-07-06')).toBe(160)
  })
  it('adds nights, extras and the long-stay discount', () => {
    const q = quote(room, '2027-04-05', '2027-04-09', 2, ['supper', 'dog'])
    expect(q.nights).toHaveLength(4)
    expect(q.roomTotal).toBe(580)
    expect(q.longStay).toBe(58)
    expect(q.total).toBe(580 - 58 + 84 + 20)
    expect(q.deposit).toBe(Math.round(q.total * 0.2))
    expect(quote(room, '2027-04-05', '2027-04-08', 1).longStay).toBe(0)
  })
  it('gives the same availability every time, and neither empty nor full', () => {
    const nights = eachNight('2027-01-01', '2028-01-01')
    for (const r of rooms) {
      const free = nights.filter((d) => isFree(r, d)).length / nights.length
      expect(free).toBeGreaterThan(0.45)
      expect(free).toBeLessThan(0.9)
      expect(isFree(r, nights[5])).toBe(isFree(r, nights[5]))
    }
  })
  it('explains what is wrong with a stay', () => {
    expect(stayProblem(room, null, null, 1)).toMatch(/Choose/)
    expect(stayProblem(room, '2027-04-05', '2027-04-05', 1)).toMatch(/after arrival/)
    expect(stayProblem(room, '2027-04-05', '2027-04-30', 1)).toMatch(/14 nights/)
    expect(stayProblem(room, '2027-04-05', '2027-04-06', 3)).toMatch(/sleeps 2/)
    const taken = eachNight('2027-01-01', '2027-03-01').find((d) => !isFree(room, d))
    expect(stayProblem(room, taken, addDays(taken, 1), 1)).toMatch(/already taken/)
  })
  it('validates the guest', () => {
    expect(guestProblems({ name: 'Ada', email: 'ada@example.com' })).toEqual({})
    expect(Object.keys(guestProblems({ name: ' ', email: 'no', phone: '12' }))).toEqual(['name', 'email', 'phone'])
  })
})

describe('rooms', () => {
  it.each(rooms.map((r) => [r.name, r]))('%s: everything fits inside the walls', (_n, r) => {
    for (const [, x, y, w, d] of r.fit) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x + w).toBeLessThanOrEqual(r.w + 1e-9)
      expect(y + d).toBeLessThanOrEqual(r.d + 1e-9)
    }
    expect(area(r)).toBeGreaterThan(10)
  })
  it.each(rooms.map((r) => [r.name, r]))('%s: no two pieces of furniture overlap', (_n, r) => {
    r.fit.forEach((a, i) => r.fit.slice(i + 1).forEach((b) => {
      const apart = a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1] || a[2] + a[4] <= b[2] || b[2] + b[4] <= a[2]
      expect(apart, `${a[0]} and ${b[0]}`).toBe(true)
    }))
  })
  it.each(rooms.map((r) => [r.name, r]))('%s: windows fit their wall and bath flag matches', (_n, r) => {
    for (const [side, at, len] of r.windows)
      expect(at + len).toBeLessThanOrEqual(side === 'e' || side === 'w' ? r.d : r.w)
    expect(r.fit.some(([k]) => k === 'bath')).toBe(r.bath)
  })
})
