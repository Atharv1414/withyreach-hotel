import { clock } from '../lib/sun.js'
import { useHour } from '../state/hour.jsx'

const WORDS = { night: 'night', dawn: 'dawn', day: 'daylight', dusk: 'dusk' }

export default function HourDial() {
  const { date, minutes, phase, elevation, live, sun, setMinutes, follow } = useHour()
  const now = clock(date, minutes)
  return (
    <div className="dial">
      <label className="dial__label" htmlFor="hour">
        <span className="dial__time">{now}</span>
        <span>{live ? 'on the marsh now' : 'on the marsh'}, {WORDS[phase]}</span>
      </label>
      <div className="dial__track" style={{
        '--rise': `${((sun.riseMin ?? 0) / 14.39).toFixed(1)}%`,
        '--set': `${((sun.setMin ?? 1439) / 14.39).toFixed(1)}%` }}>
        <input id="hour" type="range" min="0" max="1439" step="5" value={minutes}
          aria-valuetext={`${now}, ${WORDS[phase]}, sun ${Math.round(elevation)} degrees`}
          onChange={(e) => setMinutes(Number(e.target.value))} />
      </div>
      <p className="dial__foot">
        {live ? 'Move the sun. The whole site follows it.' : (
          <button type="button" className="link" onClick={follow}>Back to the real time</button>
        )}
      </p>
    </div>
  )
}
