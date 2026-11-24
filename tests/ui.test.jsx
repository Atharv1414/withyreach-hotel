import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.jsx'
import Calendar from '../src/components/Calendar.jsx'
import { rooms } from '../src/data/rooms.js'
import { isFree } from '../src/lib/booking.js'
import { addDays, eachNight, longDate } from '../src/lib/dates.js'
import Book from '../src/pages/Book.jsx'
import { HourProvider } from '../src/state/hour.jsx'

const at = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
const room = rooms[1]
const start = eachNight('2027-04-01', '2027-06-01').find((d) =>
  [0, 1, 2, 3].every((n) => isFree(room, addDays(d, n))))
const gap = eachNight('2027-04-01', '2027-07-01').find((d) => isFree(room, d) && !isFree(room, addDays(d, 1)))
const day = (d) => screen.getByRole('button', { name: new RegExp(`^${longDate(d)}`) })

beforeEach(() => sessionStorage.clear())

function Harness({ min = '2027-04-01' }) {
  const [v, setV] = useState({ from: null, to: null })
  return <><Calendar room={room} {...v} minDate={min} onChange={setV} /><p>{v.from}/{v.to}</p></>
}

describe('calendar', () => {
  it('picks a range', async () => {
    const u = userEvent.setup()
    render(<Harness min={start} />)
    await u.click(day(start))
    await u.click(day(addDays(start, 2)))
    expect(screen.getByText(`${start}/${addDays(start, 2)}`)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('2 nights')
  })
  it('lets a taken night be a departure day but never be slept through', async () => {
    const u = userEvent.setup()
    render(<Harness min={gap} />)
    await u.click(day(gap))
    const departure = day(addDays(gap, 1))
    expect(departure).toHaveAttribute('aria-disabled', 'false')
    if (gap.slice(0, 7) === addDays(gap, 2).slice(0, 7))
      expect(day(addDays(gap, 2))).toHaveAttribute('aria-disabled', 'true')
    await u.click(departure)
    expect(screen.getByText(`${gap}/${addDays(gap, 1)}`)).toBeInTheDocument()
  })
  it('has one tab stop and moves with the arrow keys', async () => {
    const u = userEvent.setup()
    render(<Harness min="2027-04-10" />)
    const grid = screen.getByRole('grid')
    expect(within(grid).getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(1)
    act(() => day('2027-04-10').focus())
    await u.keyboard('{ArrowDown}')
    await act(() => new Promise((r) => setTimeout(r, 40)))
    expect(document.activeElement.dataset.date).toBe('2027-04-17')
    await u.keyboard('{PageDown}')
    await act(() => new Promise((r) => setTimeout(r, 40)))
    expect(document.activeElement.dataset.date).toBe('2027-05-17')
    await u.keyboard('{PageUp}{PageUp}')
    await act(() => new Promise((r) => setTimeout(r, 40)))
    expect(document.activeElement.dataset.date >= '2027-04-10').toBe(true)
  })
})

describe('rooms page', () => {
  it('filters from the address and updates the list', async () => {
    const u = userEvent.setup()
    at('/rooms?guests=3')
    expect(screen.getByText('2 rooms')).toBeInTheDocument()
    await u.selectOptions(screen.getByLabelText('Guests'), '1')
    await u.click(screen.getByLabelText('With a bath'))
    expect(screen.getByText('4 rooms')).toBeInTheDocument()
  })
  it('shows an unknown room as not found', () => {
    at('/rooms/attic')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This track floods')
  })
})

describe('hour', () => {
  const show = (iso) => render(
    <MemoryRouter><HourProvider now={() => new Date(iso)}><p>x</p></HourProvider></MemoryRouter>)
  it('turns the page dark after dusk and light by day', () => {
    show('2026-12-01T23:00Z')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
  it('is light at noon', () => {
    show('2026-12-01T12:00Z')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.dataset.phase).toBe('day')
    expect(document.documentElement.dataset.hour).toBe('live')
  })
})

describe('booking', () => {
  const open = (path = '/book?room=the-eel-room') => render(
    <MemoryRouter initialEntries={[path]}><Book minDate={start} /></MemoryRouter>)

  it('refuses to go on without dates', async () => {
    const u = userEvent.setup()
    open()
    await u.click(screen.getByRole('button', { name: 'Choose extras' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Choose your arrival')
  })
  it('books from start to finish, and stores no personal details', async () => {
    const u = userEvent.setup()
    open()
    await u.click(day(start))
    await u.click(day(addDays(start, 2)))
    await u.click(screen.getByRole('button', { name: 'Choose extras' }))
    await u.click(screen.getByLabelText(/A dog/))
    expect(within(screen.getByLabelText('Price')).getByText('A dog')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Your details' }))
    await u.click(screen.getByRole('button', { name: 'Check booking' }))
    expect(screen.getByText('Enter the name for the booking.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toHaveFocus()
    await u.type(screen.getByLabelText(/^Name/), 'Ada Byron')
    await u.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    expect(sessionStorage.getItem('withyreach-draft')).not.toContain('ada@example.com')
    await u.click(screen.getByRole('button', { name: 'Check booking' }))
    expect(screen.getByText('Ada Byron')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Confirm (demo)' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('You’re expected')
    expect(screen.getByText(/No booking was made/)).toBeInTheDocument()
  })
  it('keeps a draft of the stay across a reload, and drops a stale one', async () => {
    sessionStorage.setItem('withyreach-draft', JSON.stringify({ slug: 'the-eel-room', from: start, to: addDays(start, 2), guests: 2 }))
    const { unmount } = open('/book')
    expect(within(screen.getByLabelText('Price')).getByText('Total')).toBeInTheDocument()
    unmount()
    sessionStorage.setItem('withyreach-draft', JSON.stringify({ slug: 'the-eel-room', from: '2020-01-01', to: '2020-01-03', guests: 2 }))
    open('/book')
    expect(screen.getByText(/Choose dates to see/)).toBeInTheDocument()
  })
})
