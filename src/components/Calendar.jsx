import { useRef, useState } from 'react'
import { isFree, MAX_NIGHTS, nightlyRate, pounds } from '../lib/booking.js'
import { addDays, addMonths, eachNight, longDate, monthGrid, monthName, nightsBetween } from '../lib/dates.js'

const DAYS = [['Mo', 'Monday'], ['Tu', 'Tuesday'], ['We', 'Wednesday'], ['Th', 'Thursday'], ['Fr', 'Friday'], ['Sa', 'Saturday'], ['Su', 'Sunday']]

/**
 * A date-range picker. One tab stop; arrow keys move by day and week, Page Up and Page Down by
 * month. A date cannot be picked as a departure if a night before it is taken.
 */
export default function Calendar({ room, from, to, onChange, minDate }) {
  const [view, setView] = useState((from ?? minDate).slice(0, 7))
  const [focus, setFocus] = useState(from ?? minDate)
  const grid = useRef(null)
  const picking = Boolean(from && !to)
  const lastView = addMonths(minDate.slice(0, 7), 11)

  const blocked = (date) => {
    if (date < minDate) return true
    if (picking && date > from) {
      const n = nightsBetween(from, date)
      return n > MAX_NIGHTS || eachNight(from, date).some((d) => !isFree(room, d))
    }
    return !isFree(room, date)
  }

  const pick = (date) => {
    if (blocked(date)) return
    if (picking && date > from) onChange({ from, to: date })
    else onChange({ from: date, to: null })
  }

  const move = (date) => {
    if (date < minDate || date.slice(0, 7) > lastView) return
    setFocus(date)
    setView(date.slice(0, 7))
    requestAnimationFrame(() => grid.current?.querySelector(`[data-date="${date}"]`)?.focus())
  }

  const shiftMonth = (date, n) => {
    const ym = addMonths(date.slice(0, 7), n)
    const target = `${ym}-${date.slice(8)}`
    const last = addDays(`${addMonths(ym, 1)}-01`, -1)
    return target > last ? last : target
  }

  const onKeyDown = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (step) move(addDays(focus, step))
    else if (e.key === 'PageUp') move(shiftMonth(focus, -1))
    else if (e.key === 'PageDown') move(shiftMonth(focus, 1))
    else return
    e.preventDefault()
  }

  const go = (n) => {
    const ym = addMonths(view, n)
    setView(ym)
    setFocus(`${ym}-01` < minDate ? minDate : `${ym}-01`)
  }

  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" onClick={() => go(-1)} disabled={view <= minDate.slice(0, 7)} aria-label="Previous month">←</button>
        <h3 aria-live="polite">{monthName(view)}</h3>
        <button type="button" onClick={() => go(1)} disabled={view >= lastView} aria-label="Next month">→</button>
      </div>
      <table ref={grid} role="grid" aria-label={monthName(view)} onKeyDown={onKeyDown}>
        <thead>
          <tr>{DAYS.map(([s, l]) => <th key={l} scope="col"><abbr title={l}>{s}</abbr></th>)}</tr>
        </thead>
        <tbody>
          {monthGrid(view).map((week) => (
            <tr key={week.find(Boolean)}>
              {week.map((date, i) => {
                if (!date) return <td key={`x${i}`} />
                const off = blocked(date)
                const edge = date === from || date === to
                const inside = from && to && date > from && date < to
                return (
                  <td key={date} role="gridcell" aria-selected={edge || Boolean(inside)}
                    className={`${edge ? 'is-edge' : ''} ${inside ? 'is-inside' : ''} ${date === from && to ? 'is-from' : ''} ${date === to ? 'is-to' : ''}`}>
                    <button type="button" data-date={date} aria-disabled={off}
                      tabIndex={date === focus ? 0 : -1} onFocus={() => setFocus(date)}
                      onClick={() => pick(date)}>
                      <span className="sr">
                        {longDate(date)}{off ? ', not available' : picking && date > from ? ', departure' : `, ${pounds(nightlyRate(room, date))}`}
                      </span>
                      <span aria-hidden="true">{Number(date.slice(8))}</span>
                      <small aria-hidden="true">{off || edge || inside ? '' : pounds(nightlyRate(room, date))}</small>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cal__hint" role="status">
        {!from && 'Choose your arrival day.'}
        {picking && `Arriving ${longDate(from)}. Now choose your departure day.`}
        {from && to && `${nightsBetween(from, to)} night${nightsBetween(from, to) > 1 ? 's' : ''}: ${longDate(from)} to ${longDate(to)}.`}
      </p>
    </div>
  )
}
