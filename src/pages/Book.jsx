import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Calendar from '../components/Calendar.jsx'
import { bySlug, rooms } from '../data/rooms.js'
import { EXTRAS, guestProblems, pounds, quote, stayProblem } from '../lib/booking.js'
import { longDate, shortDate, today } from '../lib/dates.js'
import { useTitle } from '../lib/useTitle.js'

const STEPS = ['Stay', 'Extras', 'You', 'Check']
const DRAFT = 'withyreach-draft'

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT)) ?? {}
  } catch {
    return {}
  }
}

export default function Book({ minDate = today() }) {
  const [params] = useSearchParams()
  const asked = bySlug(params.get('room'))
  const [draft, setDraft] = useState(() => {
    const d = readDraft()
    const stale = d.from && d.from < minDate
    const base = { slug: rooms[0].slug, from: null, to: null, guests: 1, extras: [], guest: {}, ...(stale ? {} : d) }
    return asked && asked.slug !== base.slug ? { ...base, slug: asked.slug, from: null, to: null } : base
  })
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)
  const heading = useRef(null)
  const started = useRef(false)
  const room = bySlug(draft.slug) ?? rooms[0]
  useTitle(done ? 'Booked' : 'Book')

  useEffect(() => {
    try {
      // the guest's details are never stored, only the choice of stay
      const { guest: _guest, ...rest } = draft
      sessionStorage.setItem(DRAFT, JSON.stringify(rest))
    } catch {
      /* private window: the form still works, it just cannot be resumed */
    }
  }, [draft])

  useEffect(() => {
    if (started.current) heading.current?.focus()
    started.current = true
  }, [step, done])

  const set = (patch) => {
    setErrors({})
    setDraft((d) => ({ ...d, ...patch }))
  }
  const price = useMemo(
    () => (draft.from && draft.to ? quote(room, draft.from, draft.to, draft.guests, draft.extras) : null),
    [room, draft],
  )

  const next = (e) => {
    e.preventDefault()
    if (step === 0) {
      const stay = stayProblem(room, draft.from, draft.to, draft.guests)
      if (stay) return setErrors({ stay })
    }
    if (step === 2) {
      const found = guestProblems(draft.guest)
      setErrors(found)
      const firstBad = Object.keys(found)[0]
      if (firstBad) {
        document.getElementById(firstBad)?.focus()
        return undefined
      }
    }
    if (step === 3) {
      setDone({ ref: `WR-${draft.from.replaceAll('-', '').slice(2)}-${room.slug.slice(0, 2).toUpperCase()}`, price, room, ...draft })
      set({ from: null, to: null, extras: [], guest: {} })
      return undefined
    }
    setErrors({})
    return setStep(step + 1)
  }

  if (done) {
    return (
      <div className="page wrap done">
        <h1 ref={heading} tabIndex={-1}>You’re expected</h1>
        <p className="done__ref">{done.ref}</p>
        <p>{done.room.name}, {longDate(done.from)} to {longDate(done.to)}, for {done.guests}. Total {pounds(done.price.total)}.</p>
        <p className="demo">This is a demonstration. No booking was made, no card was asked for, and nothing left your browser.</p>
        <Link className="button" to="/">Back to the marsh</Link>
      </div>
    )
  }

  return (
    <div className="page wrap book">
      <div className="book__main">
        <h1>Book</h1>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined} className={i < step ? 'is-done' : ''}>
              {i < step ? <button type="button" onClick={() => setStep(i)}>{s}</button> : s}
            </li>
          ))}
        </ol>
        <form onSubmit={next} noValidate>
          <h2 ref={heading} tabIndex={-1}>{['Your stay', 'Anything else?', 'Who’s coming', 'Check and confirm'][step]}</h2>

          {step === 0 && (
            <>
              <div className="fields">
                <label htmlFor="room">Room
                  <select id="room" value={room.slug} onChange={(e) => set({ slug: e.target.value, from: null, to: null, guests: Math.min(draft.guests, bySlug(e.target.value).sleeps) })}>
                    {rooms.map((r) => <option key={r.slug} value={r.slug}>{r.name}, sleeps {r.sleeps}</option>)}
                  </select>
                </label>
                <label htmlFor="party">Guests
                  <select id="party" value={draft.guests} onChange={(e) => set({ guests: Number(e.target.value) })}>
                    {Array.from({ length: room.sleeps }, (_, i) => <option key={i}>{i + 1}</option>)}
                  </select>
                </label>
              </div>
              <Calendar key={room.slug} room={room} from={draft.from} to={draft.to} minDate={minDate} onChange={set} />
              {errors.stay && <p className="error" role="alert">{errors.stay}</p>}
            </>
          )}

          {step === 1 && (
            <ul className="extras">
              {EXTRAS.map((x) => (
                <li key={x.id}>
                  <label htmlFor={`x-${x.id}`}>
                    <input id={`x-${x.id}`} type="checkbox" checked={draft.extras.includes(x.id)}
                      onChange={(e) => set({ extras: e.target.checked ? [...draft.extras, x.id] : draft.extras.filter((v) => v !== x.id) })} />
                    <span>{x.name}</span><b>{pounds(x.price)} per {x.per}</b>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {step === 2 && (
            <div className="fields fields--stack">
              {[['name', 'Name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone (optional)', 'tel', 'tel']].map(([id, label, type, auto]) => (
                <label key={id} htmlFor={id}>{label}
                  <input id={id} type={type} autoComplete={auto} value={draft.guest[id] ?? ''}
                    aria-invalid={Boolean(errors[id])} aria-describedby={errors[id] ? `${id}-error` : undefined}
                    onChange={(e) => set({ guest: { ...draft.guest, [id]: e.target.value } })} />
                  {errors[id] && <span className="error" id={`${id}-error`}>{errors[id]}</span>}
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <dl className="spec">
              <div><dt>Room</dt><dd>{room.name}</dd></div>
              <div><dt>Arrive</dt><dd>{longDate(draft.from)}, from 15:00</dd></div>
              <div><dt>Leave</dt><dd>{longDate(draft.to)}, by 11:00</dd></div>
              <div><dt>Guests</dt><dd>{draft.guests}</dd></div>
              <div><dt>Name</dt><dd>{draft.guest.name}</dd></div>
              <div><dt>Email</dt><dd>{draft.guest.email}</dd></div>
            </dl>
          )}

          <div className="actions">
            {step > 0 && <button type="button" className="button button--quiet" onClick={() => setStep(step - 1)}>Back</button>}
            <button type="submit" className="button">{['Choose extras', 'Your details', 'Check booking', 'Confirm (demo)'][step]}</button>
          </div>
        </form>
      </div>

      <aside className="bill" aria-label="Price">
        <h2>{room.name}</h2>
        {price ? (
          <>
            <ul>
              {price.nights.map((n) => <li key={n.date}><span>{shortDate(n.date)}</span><span>{pounds(n.rate)}</span></li>)}
              {price.longStay > 0 && <li><span>Four nights or more, 10% off</span><span>−{pounds(price.longStay)}</span></li>}
              {price.lines.map((l) => <li key={l.id}><span>{l.name}</span><span>{pounds(l.total)}</span></li>)}
            </ul>
            <p className="bill__total"><span>Total</span><b>{pounds(price.total)}</b></p>
            <p className="bill__small">Deposit {pounds(price.deposit)}, the rest when you leave.</p>
          </>
        ) : <p className="bill__small">Choose dates to see the price of each night.</p>}
      </aside>
    </div>
  )
}
