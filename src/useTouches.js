import { useEffect, useRef, useState } from 'react'

export const PHASE = {
  IDLE: 'idle',
  CHOOSING: 'choosing',
  WINNER: 'winner',
}

const useTouches = ({
  colors = [],
  radius = 64,
  borderWidth = 10,
  bounceDuration = 4500,
  getExtraData,
} = {}) => {
  const touchCount = useRef(0)
  const [touches, setTouches] = useState({})
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [winnerId, setWinnerId] = useState(null)

  const touchIds = Object.keys(touches)
  const currentTouchCount = touchIds.length

  const getPosition = (touch) => {
    const { width, height, offsetLeft, offsetTop } = window.visualViewport
    const minX = radius + offsetLeft
    const maxX = width + offsetLeft - radius - borderWidth * 2
    const minY = radius + offsetTop
    const maxY = height + offsetTop - radius - borderWidth * 2

    return {
      x: Math.max(minX, Math.min(touch.clientX, maxX)),
      y: Math.max(minY, Math.min(touch.clientY, maxY)),
    }
  }

  const getTouchInfo = (touch) => {
    const coordinates = getPosition(touch)
    return {
      ...coordinates,
      ...(getExtraData ? getExtraData(touch, coordinates) : {}),
    }
  }

  const syncTouches = (touchEvent) => {
    const updatedTouches = {}
    for (const touch of touchEvent.touches) {
      updatedTouches[touch.identifier] = {
        color: colors[touchCount.current % colors.length],
        ...touches[touch.identifier],
        ...getTouchInfo(touch),
      }
    }
    setTouches(updatedTouches)
  }

  const isChoosing = currentTouchCount >= 2

  useEffect(() => {
    if (currentTouchCount < 2 && phase !== PHASE.IDLE) {
      setPhase(PHASE.IDLE)
    }
    if (currentTouchCount >= 2 && !winnerId && phase === PHASE.IDLE) {
      setPhase(PHASE.CHOOSING)
    }
    if (currentTouchCount === 0 && winnerId) {
      setWinnerId(null)
    }
  }, [currentTouchCount, phase, winnerId])

  useEffect(() => {
    if (isChoosing && !winnerId && phase !== PHASE.WINNER) {
      const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), bounceDuration)
      return () => clearTimeout(timeoutId)
    }
  }, [isChoosing, phase, winnerId, bounceDuration])

  useEffect(() => {
    if (phase === PHASE.WINNER && !winnerId) {
      const winnerIndex = Math.floor(Math.random() * touchIds.length)
      const chosenWinnerId = touchIds[winnerIndex]
      setWinnerId(chosenWinnerId)
    }
  }, [phase, touchIds, winnerId])

  const handleTouchStart = (touchEvent) => {
    for (const touch of touchEvent.changedTouches) {
      const newTouchData = {
        [touch.identifier]: {
          ...getTouchInfo(touch),
          color: colors[touchCount.current % colors.length],
        },
      }
      setTouches((previousTouches) => ({ ...previousTouches, ...newTouchData }))
      touchCount.current += 1
    }
  }

  const handleTouchMove = (touchEvent) => {
    if (winnerId) {
      return
    }
    syncTouches(touchEvent)
  }

  const handleTouchEnd = (touchEvent) => {
    syncTouches(touchEvent)
  }

  return {
    touches,
    phase,
    winnerId,
    touchIds,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}

export default useTouches
