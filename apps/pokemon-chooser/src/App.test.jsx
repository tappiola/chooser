import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import App from './App'
import { act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const touch = (target, id, x, y) => ({
  identifier: id,
  target,
  clientX: x,
  clientY: y,
  pageX: x,
  pageY: y,
  screenX: x,
  screenY: y,
  radiusX: 1,
  radiusY: 1,
  rotationAngle: 0,
  force: 1,
})

beforeEach(() => {
  Object.defineProperty(window, 'visualViewport', {
    value: { width: 300, height: 600, offsetLeft: 0, offsetTop: 0 },
    configurable: true,
  })
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 5,
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
})

test('shows initial instruction', () => {
  render(<App />)
  expect(screen.getByText('Touch and hold to choose')).toBeVisible()
})

test('one touch not enough for winner select', async () => {
  const { container } = render(<App />)
  const wrapper = container.firstElementChild

  const t1 = touch(wrapper, 1, 140, 160)

  fireEvent.touchStart(wrapper, {
    touches: [t1],
    changedTouches: [t1],
    bubbles: true,
    cancelable: true,
  })

  expect(await screen.findByText('Add more fingers...')).toBeVisible()
})

test('shows circles on screen touch', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)

  const { container } = render(<App />)
  const wrapper = container.firstElementChild

  fireEvent.touchStart(wrapper, {
    touches: [touch(wrapper, 1, 100, 100), touch(wrapper, 2, 200, 200)],
    changedTouches: [touch(wrapper, 1, 100, 100), touch(wrapper, 2, 200, 200)],
    bubbles: true,
    cancelable: true,
  })

  await waitFor(() => {
    const circles = screen.getAllByTestId('circle')
    expect(circles).toHaveLength(2)
  })
})

test('circles disappear when fingers are lifted', async () => {
  const { container } = render(<App />)
  const wrapper = container.firstElementChild

  const t1 = touch(wrapper, 1, 120, 140)

  fireEvent.touchStart(wrapper, {
    touches: [t1],
    changedTouches: [t1],
    bubbles: true,
    cancelable: true,
  })

  await waitFor(() => {
    expect(screen.getAllByTestId('circle')).toHaveLength(1)
  })

  // finger lifted
  fireEvent.touchEnd(wrapper, {
    touches: [],
    changedTouches: [t1],
    bubbles: true,
    cancelable: true,
  })

  await waitFor(() => {
    expect(screen.queryAllByTestId('circle')).toHaveLength(0)
  })
})

test('selects a winner', async () => {
  vi.useFakeTimers()

  const { container } = render(<App />)
  const wrapper = container.querySelector('.wrapper')

  const t1 = { identifier: 1, target: wrapper, clientX: 100, clientY: 100 }
  const t2 = { identifier: 2, target: wrapper, clientX: 200, clientY: 200 }

  fireEvent.touchStart(wrapper, { touches: [t1, t2], changedTouches: [t1, t2] })

  expect(screen.getAllByTestId('circle')).toHaveLength(2)

  await act(async () => {
    await vi.runOnlyPendingTimersAsync()
  })

  expect(screen.getAllByTestId('winning-circle')).toHaveLength(1)
  expect(screen.getAllByTestId('circle')).toHaveLength(1)

  vi.useRealTimers()
  vi.restoreAllMocks()
})
