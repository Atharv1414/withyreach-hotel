import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle.js'

export default function NotFound() {
  useTitle('Not found')
  return (
    <div className="page wrap done">
      <h1>This track floods</h1>
      <p>There is no page at this address. It may have moved, or the link may be mistyped.</p>
      <Link className="button" to="/">Back to dry land</Link>
    </div>
  )
}
