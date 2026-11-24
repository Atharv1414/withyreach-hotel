import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { inkOn, skyAt } from '../lib/sky.js'
import { phase, solarElevation, sunTimes } from '../lib/sun.js'

const HourContext = createContext(null)
export const useHour = () => useContext(HourContext)

const midnight = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
const minuteOf = (d) => Math.floor((d.getTime() - midnight(d)) / 60_000)

/**
 * The hour the site is showing. It follows the real clock until the visitor moves the slider.
 * The whole page takes its colours from the sun's height at that hour.
 */
export function HourProvider({ children, now = () => new Date() }) {
  const [clock, setClock] = useState(now)
  const [chosen, setChosen] = useState(null)

  useEffect(() => {
    const id = setInterval(() => setClock(now()), 60_000)
    return () => clearInterval(id)
  }, [now])

  const value = useMemo(() => {
    const minutes = chosen ?? minuteOf(clock)
    const at = new Date(midnight(clock) + minutes * 60_000)
    const elevation = solarElevation(at)
    const rising = solarElevation(new Date(at.getTime() + 60_000)) > elevation
    const sky = skyAt(elevation)
    return {
      date: clock, minutes, at, elevation, rising, sky,
      phase: phase(elevation, rising), live: chosen === null, sun: sunTimes(clock),
      setMinutes: setChosen, follow: () => setChosen(null),
    }
  }, [clock, chosen])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = value.elevation > -3 ? 'light' : 'dark'
    root.dataset.phase = value.phase
    root.style.setProperty('--sky-top', value.sky.top)
    root.style.setProperty('--sky-low', value.sky.low)
    root.style.setProperty('--sky-ink', inkOn(value.sky.top))
  }, [value])

  return <HourContext.Provider value={value}>{children}</HourContext.Provider>
}
