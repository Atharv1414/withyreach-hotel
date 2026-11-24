import { Link, useParams } from 'react-router-dom'
import RoomPlan from '../components/RoomPlan.jsx'
import { area, bySlug, rooms } from '../data/rooms.js'
import { pounds } from '../lib/booking.js'
import { useTitle } from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

export default function Room() {
  const room = bySlug(useParams().slug)
  useTitle(room?.name ?? 'Not found')
  if (!room) return <NotFound />
  const i = rooms.indexOf(room)
  const next = rooms[(i + 1) % rooms.length]
  return (
    <article className="page wrap room">
      <div className="room__plan"><RoomPlan room={room} labels /></div>
      <div className="room__text">
        <h1>{room.name}</h1>
        <p className="room__line">{room.line}</p>
        <p>{room.detail}</p>
        <dl className="spec">
          <div><dt>Sleeps</dt><dd>{room.sleeps}</dd></div>
          <div><dt>Size</dt><dd>{area(room)} m²</dd></div>
          <div><dt>Floor</dt><dd>{room.floor}</dd></div>
          <div><dt>Faces</dt><dd>{room.facing}</dd></div>
        </dl>
        <ul className="ticks">{room.features.map((f) => <li key={f}>{f}</li>)}</ul>
        <p className="room__book">
          <span><b>{pounds(room.rate)}</b> a night, from</span>
          <Link className="button" to={`/book?room=${room.slug}`}>Book this room</Link>
        </p>
        <p className="room__next">Next: <Link className="link" to={`/rooms/${next.slug}`}>{next.name}</Link></p>
      </div>
    </article>
  )
}
