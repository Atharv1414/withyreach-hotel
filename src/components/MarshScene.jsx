import { useEffect, useRef } from 'react'
import { useHour } from '../state/hour.jsx'
import { buildScene, drawScene } from './scene.js'

export default function MarshScene() {
  const canvas = useRef(null)
  const hour = useHour()
  const latest = useRef(hour)
  useEffect(() => {
    latest.current = hour
  }, [hour])

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext?.('2d')
    if (!ctx) return undefined
    const scene = buildScene()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let visible = true
    let w = 0
    let h = 0

    const size = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = el.clientHeight
      el.width = w * ratio
      el.height = h * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const paint = (t) => drawScene(ctx, w, h, scene, latest.current, t)
    const loop = (t) => {
      paint(t)
      frame = visible ? requestAnimationFrame(loop) : 0
    }
    const resize = new ResizeObserver(() => {
      size()
      paint(0)
    })
    resize.observe(el)
    // nothing is drawn while the scene is scrolled out of sight
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !still && !frame) frame = requestAnimationFrame(loop)
    })
    seen.observe(el)
    const repaint = still ? setInterval(() => paint(0), 250) : 0
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(repaint)
      resize.disconnect()
      seen.disconnect()
    }
  }, [])

  return <canvas ref={canvas} className="marsh" aria-hidden="true" />
}
