import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Mark from './Mark.jsx'

const LINKS = [['/rooms', 'Rooms'], ['/eat', 'Eat'], ['/around', 'Around']]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={`header ${pathname === '/' ? 'header--over' : ''} ${open ? 'is-open' : ''}`}>
      <div className="header__in">
        <Link className="header__brand" to="/"><Mark />Withyreach</Link>
        <button className="header__toggle" type="button" aria-expanded={open} aria-controls="nav"
          onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="nav" className="header__nav" aria-label="Main">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          <Link className="button button--small" to="/book">Book</Link>
        </nav>
      </div>
    </header>
  )
}
