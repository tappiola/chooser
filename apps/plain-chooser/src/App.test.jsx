import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, expect, test, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  Object.defineProperty(window, 'visualViewport', {
    value: { width: 300, height: 600, offsetLeft: 0, offsetTop: 0 },
    configurable: true,
  })
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 5,
    configurable: true,
  })
})

test('shows initial instruction', () => {
  render(<App />)
  expect(screen.getByText('Touch and hold to choose')).toBeTruthy()
})

test('selects a winner after multiple touches', async () => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)

  const { container } = render(<App />)
  const wrapper = container.firstChild

  const touch1 = { identifier: 1, clientX: 100, clientY: 100 }
  const touch2 = { identifier: 2, clientX: 200, clientY: 200 }

  fireEvent.touchStart(wrapper, {
    touches: [touch1, touch2],
    changedTouches: [touch1, touch2],
  })

  await Promise.resolve()

  act(() => {
    vi.runAllTimers()
  })

  await Promise.resolve()

  const circles = container.querySelectorAll('.wrapper > div:not(.overlay-text)')
  const visibleCircles = [...circles].filter(
    (c) => c.style.visibility !== 'hidden' && c.style.display !== 'none'
  )
  expect(visibleCircles).toHaveLength(1)
  expect(visibleCircles[0].style.width).toBe('1600px')

  vi.useRealTimers()
  vi.restoreAllMocks()
})
