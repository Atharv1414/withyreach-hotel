import { Link, useSearchParams } from 'react-router-dom'
import RoomPlan from '../components/RoomPlan.jsx'
import { area, rooms } from '../data/rooms.js'
import { pounds } from '../lib/booking.js'
import { useTitle } from '../lib/useTitle.js'

const SORTS = {
  price: ['Price', (a, b) => a.rate - b.rate],
  size: ['Size', (a, b) => area(b) - area(a)],
}

export default function Rooms() {
  useTitle('Rooms')
  // filters live in the address, so a filtered list can be shared and Back works
  const [params, setParams] = useSearchParams()
  const guests = Number(params.get('guests') ?? 1)
  const bath = params.get('bath') === '1'
  const sort = params.get('sort') in SORTS ? params.get('sort') : 'price'
  const shown = rooms.filter((r) => r.sleeps >= guests && (!bath || r.bath)).sort(SORTS[sort][1])

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="page wrap">
      <h1>Rooms</h1>
      <form className="filters" onSubmit={(e) => e.preventDefault()} aria-label="Filter rooms">
        <label htmlFor="guests">Guests
          <select id="guests" value={guests} onChange={(e) => set('guests', e.target.value === '1' ? '' : e.target.value)}>
            {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label htmlFor="sort">Order by
          <select id="sort" value={sort} onChange={(e) => set('sort', e.target.value)}>
            {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
          </select>
        </label>
        <label className="check" htmlFor="bath">
          <input id="bath" type="checkbox" checked={bath} onChange={(e) => set('bath', e.target.checked ? '1' : '')} />
          With a bath
        </label>
        <p role="status">{shown.length} {shown.length === 1 ? 'room' : 'rooms'}</p>
      </form>
      <ul className="room-list">
        {shown.map((r) => (
          <li key={r.slug} className="room-row">
            <Link to={`/rooms/${r.slug}`} className="room-row__plan" tabIndex={-1} aria-hidden="true">
              <RoomPlan room={r} />
            </Link>
            <div className="room-row__text">
              <h2><Link to={`/rooms/${r.slug}`}>{r.name}</Link></h2>
              <p>{r.line}</p>
              <ul className="facts">
                <li>Sleeps {r.sleeps}</li><li>{area(r)} m²</li><li>{r.floor}</li><li>Faces {r.facing}</li>
              </ul>
            </div>
            <p className="room-row__price"><b>{pounds(r.rate)}</b> a night, from</p>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="empty">No room has all of that. <button type="button" className="link" onClick={() => setParams({})}>Clear the filters</button></p>
      )}
    </div>
  )
}
