import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import { HourProvider } from './state/hour.jsx'
import Around from './pages/Around.jsx'
import Book from './pages/Book.jsx'
import Eat from './pages/Eat.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Room from './pages/Room.jsx'
import Rooms from './pages/Rooms.jsx'

export default function App() {
  const { pathname } = useLocation()
  const main = useRef(null)
  const first = useRef(true)

  // A client-side route change is silent to a screen reader unless focus moves.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <HourProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<Room />} />
          <Route path="/eat" element={<Eat />} />
          <Route path="/around" element={<Around />} />
          <Route path="/book" element={<Book />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </HourProvider>
  )
}
