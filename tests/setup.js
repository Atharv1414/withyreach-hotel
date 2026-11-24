import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)
window.scrollTo = vi.fn()
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
globalThis.ResizeObserver = class { observe() {} disconnect() {} }
globalThis.IntersectionObserver = class { observe() {} disconnect() {} }
HTMLCanvasElement.prototype.getContext = () => null
