import {useEffect, useRef, useState} from 'react'

export const PHASE = {
    IDLE: 'idle',
    CHOOSING: 'choosing',
    WINNER: 'winner',
}

const useTouchChooser = ({
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

    const getXY = (t) => {
        const {width, height, offsetLeft, offsetTop} = window.visualViewport
        const minX = radius + offsetLeft
        const maxX = width + offsetLeft - radius - borderWidth * 2
        const minY = radius + offsetTop
        const maxY = height + offsetTop - radius - borderWidth * 2

        return {
            x: Math.max(minX, Math.min(t.clientX, maxX)),
            y: Math.max(minY, Math.min(t.clientY, maxY)),
        }
    }

    const getTouchInfo = (t) => {
        const coords = getXY(t)
        return {
            ...coords,
            ...(getExtraData ? getExtraData(t, coords) : {}),
        }
    }

    const syncTouches = (e) => {
        const newTouches = {}
        for (let t of e.touches) {
            newTouches[t.identifier] = {
                color: colors[touchCount.current % colors.length],
                ...touches[t.identifier],
                ...getTouchInfo(t),
            }
        }
        setTouches(newTouches)
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
            const winnerIdx = Math.floor(Math.random() * touchIds.length)
            const winnerId = touchIds[winnerIdx]
            setWinnerId(winnerId)
        }
    }, [phase, touchIds, winnerId])

    const handleTouchStart = (e) => {
        for (let t of e.changedTouches) {
            const newTouch = {
                [t.identifier]: {
                    ...getTouchInfo(t),
                    color: colors[touchCount.current % colors.length],
                },
            }
            setTouches((prev) => ({...prev, ...newTouch}))
            touchCount.current += 1
        }
    }

    const handleTouchMove = (e) => {
        if (winnerId) {
            return
        }
        syncTouches(e)
    }

    const handleTouchEnd = (e) => {
        syncTouches(e)
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

export default useTouchChooser

