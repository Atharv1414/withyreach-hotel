import { Link } from 'react-router-dom'
import HourDial from '../components/HourDial.jsx'
import MarshScene from '../components/MarshScene.jsx'
import RoomPlan, { PLAN_PAD } from '../components/RoomPlan.jsx'
import { menu } from '../data/place.js'
import { bySlug } from '../data/rooms.js'
import { pounds } from '../lib/booking.js'
import { useTitle } from '../lib/useTitle.js'
import { useHour } from '../state/hour.jsx'

const FEATURED = ['abbots-reach', 'withy-boiler', 'peat-cutters'].map(bySlug)

export default function Home() {
  useTitle('')
  const { date, sun } = useHour()
  const season = menu.find((m) => m.months.includes(date.getMonth() + 1))
  return (
    <>
      <section className="hero">
        <MarshScene />
        <div className="hero__in">
          <h1>Six rooms at the edge of the water</h1>
          <HourDial />
        </div>
      </section>

      <section className="lead wrap">
        <p className="lead__text">
          Withyreach was a willow works. Baskets left here by flat-bottomed boat until 1931. Now it
          is a small hotel on the Somerset Levels, where the fields lie lower than a spring
          tide and the evenings belong to the starlings.
        </p>
        <dl className="almanac">
          <div><dt>Sunrise today</dt><dd>{sun.rise}</dd></div>
          <div><dt>Sunset today</dt><dd>{sun.set}</dd></div>
          <div><dt>Height above sea</dt><dd>3.1 m</dd></div>
          <div><dt>Flood line, 2014</dt><dd>1.42 m</dd></div>
        </dl>
      </section>

      <section className="rooms-strip wrap">
        <div className="section-head">
          <h2>Rooms, drawn to scale</h2>
          <Link className="link" to="/rooms">All six rooms</Link>
        </div>
        <ul className="strip">
          {FEATURED.map((r) => (
            <li key={r.slug} className="strip__item" style={{ '--span': r.w + PLAN_PAD * 2 }}>
              <Link to={`/rooms/${r.slug}`}>
                <RoomPlan room={r} />
                <span className="strip__name">{r.name}</span>
                <span className="strip__meta">Sleeps {r.sleeps}, from {pounds(r.rate)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="table-band">
        <div className="wrap table-band__in">
          <div>
            <h2>{season.season} at the long table</h2>
            <p>One table, sixteen chairs, whatever is ready. Supper is at half past seven, or half an hour after sunset in winter, when everyone comes in from the hide at once.</p>
            <Link className="button" to="/eat">See the year’s menus</Link>
          </div>
          <ul className="dishes">
            {season.dishes.map(([name, price]) => (
              <li key={name}><span>{name}</span><b>{pounds(price)}</b></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="closing wrap">
        <h2>Come for the evening. Stay for the morning after.</h2>
        <Link className="button button--large" to="/book">Check dates</Link>
      </section>
    </>
  )
}
