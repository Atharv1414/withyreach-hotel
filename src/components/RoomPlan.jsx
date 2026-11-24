import { area } from '../data/rooms.js'

export const PLAN_PAD = 0.9
const NAMES = { bed: 'Bed', bath: 'Bath', shower: 'Shower', desk: 'Desk', chair: 'Chair', bench: 'Bench', bunks: 'Bunks', sofa: 'Sofa', stove: 'Stove', daybed: 'Daybed' }

/** A measured plan, drawn to scale from the room's dimensions. */
export default function RoomPlan({ room, labels = false }) {
  const { w, d } = room
  const pad = PLAN_PAD
  const wall = 0.22
  return (
    <svg className="plan" viewBox={`${-pad} ${-pad} ${w + pad * 2} ${d + pad * 2}`} role="img"
      aria-label={`Plan of ${room.name}, ${w} by ${d} metres, ${area(room)} square metres`}>
      <rect className="plan__wall" x={-wall} y={-wall} width={w + wall * 2} height={d + wall * 2} />
      <rect className="plan__floor" x="0" y="0" width={w} height={d} />
      {room.windows.map(([side, at, len]) => {
        const v = side === 'e' || side === 'w'
        const x = side === 'e' ? w : side === 'w' ? -wall : at
        const y = side === 's' ? d : side === 'n' ? -wall : at
        return <rect key={side + at} className="plan__window" x={x} y={y}
          width={v ? wall : len} height={v ? len : wall} />
      })}
      {(room.walls ?? []).map((l) => (
        <line key={l.join()} className="plan__inner" x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
      ))}
      {room.fit.map(([kind, x, y, fw, fh]) => (
        <g key={kind + x} className={`plan__fit plan__fit--${kind}`}>
          <rect x={x} y={y} width={fw} height={fh} rx={kind === 'bath' ? 0.3 : kind === 'chair' ? 0.2 : 0.05} />
          {kind === 'bed' && <path d={`M${x} ${y + 0.55}h${fw}`} />}
          {kind === 'bath' && <circle cx={x + 0.25} cy={y + fh / 2} r="0.06" />}
          {kind === 'shower' && <path d={`M${x} ${y}l${fw} ${fh}M${x + fw} ${y}l${-fw} ${fh}`} />}
          {labels && fw * fh > 0.7 && kind !== 'shower' && (
            <text x={x + fw / 2} y={y + fh / 2 + (kind === 'bed' ? 0.35 : 0.1)}>{NAMES[kind]}</text>
          )}
        </g>
      ))}
      {labels && (
        <g className="plan__dims">
          <path d={`M0 ${d + 0.55}h${w}M0 ${d + 0.45}v0.2M${w} ${d + 0.45}v0.2`} />
          <text x={w / 2} y={d + 0.64}>{w.toFixed(1)} m</text>
          <path d={`M${w + 0.5} 0v${d}M${w + 0.4} 0h0.2M${w + 0.4} ${d}h0.2`} />
          <text transform={`translate(${w + 0.41} ${d / 2}) rotate(90)`}>{d.toFixed(1)} m</text>
        </g>
      )}
    </svg>
  )
}
