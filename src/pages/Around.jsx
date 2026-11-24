import { useState } from 'react'
import { rhynes, walks } from '../data/place.js'
import { useTitle } from '../lib/useTitle.js'

const line = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')

export default function Around() {
  useTitle('Around')
  const [id, setId] = useState(walks[0].id)
  const walk = walks.find((w) => w.id === id)
  return (
    <div className="page wrap around">
      <div className="around__text">
        <h1>Around</h1>
        <fieldset className="walks">
          <legend>Three walks from the door</legend>
          {walks.map((w) => (
            <label key={w.id} className={w.id === id ? 'is-on' : ''}>
              <input type="radio" name="walk" value={w.id} checked={w.id === id} onChange={() => setId(w.id)} />
              <span className="walks__name">{w.name}</span>
              <span className="walks__meta">{w.km} km, {w.mins} min</span>
            </label>
          ))}
        </fieldset>
        <div className="around__note" aria-live="polite">
          <p><b>Best:</b> {walk.best}.</p>
          <p>{walk.note}</p>
        </div>
      </div>
      <svg className="map" viewBox="0 0 100 70" role="img" aria-label={`Sketch map of the moor with the route of ${walk.name}, ${walk.km} kilometres`}>
        <rect className="map__land" width="100" height="70" />
        {rhynes.map((d) => <path key={d} className="map__rhyne" d={d} />)}
        <path className="map__river" d="M-2 58C14 56 20 44 34 44S48 52 60 56 84 64 102 58" />
        <path className="map__lake" d="M12 22c6-5 14-4 17 1s-2 12-9 12-14-8-8-13z" />
        {[6, 4.2, 2.4].map((r) => <ellipse key={r} className="map__hill" cx="82" cy="52" rx={r * 1.3} ry={r} />)}
        <path key={walk.id} className="map__walk" pathLength="1" d={line(walk.path)} />
        <circle className="map__home" cx="50" cy="40" r="1.6" />
        <g className="map__names">
          <text x="52.5" y="39.5">Withyreach</text><text x="15" y="22.5">Reedbed</text>
          <text x="77" y="43.5">The Mump</text><text x="28" y="49.5">River</text>
        </g>
      </svg>
    </div>
  )
}
