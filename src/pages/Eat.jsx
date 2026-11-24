import { useState } from 'react'
import { menu } from '../data/place.js'
import { pounds } from '../lib/booking.js'
import { useTitle } from '../lib/useTitle.js'
import { useHour } from '../state/hour.jsx'

const DIET = { v: 'vegetarian', vg: 'vegan' }

export default function Eat() {
  useTitle('Eat')
  const { date } = useHour()
  const now = menu.findIndex((m) => m.months.includes(date.getMonth() + 1))
  const [tab, setTab] = useState(now)
  const onKey = (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!d) return
    const n = (tab + d + menu.length) % menu.length
    setTab(n)
    document.getElementById(`tab-${n}`)?.focus()
  }
  return (
    <div className="page wrap eat">
      <div>
        <h1>Eat</h1>
        <p className="eat__lead">Eels and ducks from the moor, cider from the next village, vegetables from the walled yard. The menu has four dishes and changes with the season.</p>
        <div className="tabs" role="tablist" aria-label="Season" onKeyDown={onKey}>
          {menu.map((m, i) => (
            <button key={m.season} type="button" role="tab" id={`tab-${i}`} aria-selected={i === tab}
              aria-controls="menu" tabIndex={i === tab ? 0 : -1} onClick={() => setTab(i)}>
              {m.season}{i === now ? ' (now)' : ''}
            </button>
          ))}
        </div>
      </div>
      <div id="menu" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <ul className="dishes dishes--large">
          {menu[tab].dishes.map(([name, price, diet]) => (
            <li key={name}>
              <span>{name}{diet && <small> {DIET[diet]}</small>}</span><b>{pounds(price)}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
