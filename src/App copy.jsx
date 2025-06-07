import {useEffect, useRef, useState} from 'react'
import './App.css'

const App = () => {
    const colors = [
        '#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65', '#4dd0e1', '#f06292'
    ]

    function distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    }

    const BOUNCE_COUNT = 3
    const BOUNCE_DURATION = 1000 // ms per bounce

    const [touches, setTouches] = useState({})
    const [bouncing, setBouncing] = useState(false)
    const [bounceStep, setBounceStep] = useState(0)
    const [winnerId, setWinnerId] = useState(null)
    const [winnerColor, setWinnerColor] = useState(null)
    const [expanding, setExpanding] = useState(false)
    const [expandRadius, setExpandRadius] = useState(0)
    const containerRef = useRef(null)
    const bounceTimeout = useRef(null)

    console.log(touches);

    // Handle touch events
    const handleTouchStart = (e) => {
        e.preventDefault()
        const newTouches = {...touches}
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (!newTouches[t.identifier]) {
                newTouches[t.identifier] = {
                    x: t.clientX,
                    y: t.clientY,
                    color: colors[i],
                }
            }
        }
        setTouches(newTouches)
    }

    const handleTouchMove = (e) => {
        e.preventDefault()
        const newTouches = {...touches}
        for (let t of e.changedTouches) {
            if (newTouches[t.identifier]) {
                newTouches[t.identifier] = {
                    ...newTouches[t.identifier],
                    x: t.clientX,
                    y: t.clientY,
                }
            }
        }
        setTouches(newTouches)
    }

    const handleTouchEnd = (e) => {
        e.preventDefault()
        const newTouches = {...touches}
        for (let t of e.changedTouches) {
            delete newTouches[t.identifier]
        }
        setTouches(newTouches)
    }

    // Start bounce when multiple touches
    useEffect(() => {
        if (Object.keys(touches).length > 1 && !bouncing && !winnerId) {
            setBouncing(true)
            setBounceStep(0)
        }
        if (Object.keys(touches).length === 0) {
            // Reset all state
            setTouches({})
            setBouncing(false)
            setBounceStep(0)
            setWinnerId(null)
            setWinnerColor(null)
            setExpanding(false)
            setExpandRadius(0)
        }
    }, [touches, bouncing, winnerId])

    // Bounce animation logic
    useEffect(() => {
        if (bouncing && bounceStep < BOUNCE_COUNT) {
            bounceTimeout.current = setTimeout(() => {
                setBounceStep(bounceStep + 1)
            }, BOUNCE_DURATION)
        } else if (bouncing && bounceStep >= BOUNCE_COUNT && !winnerId) {
            // Pick winner
            const ids = Object.keys(touches)
            if (ids.length > 0) {
                const winnerIdx = Math.floor(Math.random() * ids.length)
                const winner = ids[winnerIdx]
                setWinnerId(winner)
                setWinnerColor(touches[winner].color)
                setExpanding(true)
                setExpandRadius(0)
            }
            setBouncing(false)
        }
        return () => clearTimeout(bounceTimeout.current)
    }, [bouncing, bounceStep, touches, winnerId])

    // Expanding winner animation
    // useEffect(() => {
    //   if (expanding) {
    //     let raf
    //     const grow = () => {
    //       setExpandRadius(r => {
    //         if (containerRef.current) {
    //           const w = containerRef.current.offsetWidth
    //           const h = containerRef.current.offsetHeight
    //           const maxR = Math.sqrt(w * w + h * h)
    //           if (r < maxR) {
    //             raf = requestAnimationFrame(grow)
    //             return r + 300
    //           } else {
    //             return maxR
    //           }
    //         }
    //         return r
    //       })
    //     }
    //     raf = requestAnimationFrame(grow)
    //     return () => cancelAnimationFrame(raf)
    //   } else {
    //     setExpandRadius(0)
    //   }
    // }, [expanding])

    // Render
    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                touchAction: 'none',
                background: winnerId && expanding ? winnerColor : undefined,
                transition: expanding ? 'background 0.5s' : undefined,
                userSelect: 'none', // Disable text selection for the whole app
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {/* Expanding winner circle */}
            {winnerId && expanding && touches[winnerId] && (
                <div
                    style={{
                        position: 'absolute',
                        left: touches[winnerId].x - expandRadius,
                        top: touches[winnerId].y - expandRadius,
                        width: expandRadius * 2,
                        height: expandRadius * 2,
                        borderRadius: '50%',
                        background: winnerColor,
                        zIndex: 2,
                        pointerEvents: 'none',
                        transition: 'background 0.5s',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                    }}
                />
            )}

            {/* Touch circles */}
            {Object.entries(touches).map(([id, t]) => {
                // Winner: make winner circle bigger
                if (winnerId === id && expanding) {
                    return null // handled by expanding circle
                }
                return (
                    <div
                        className='bounce-circle'
                        key={id}
                        style={{
                            position: 'absolute',
                            left: t.x - 60,
                            top: t.y - 60,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: t.color,
                            border: '12px solid #fff',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                            // transition: 'transform 0.2s, border 0.2s',
                            // transform: `scale(${scale})`,
                            zIndex: 3,
                            pointerEvents: 'none',
                            display: winnerId && winnerId !== id ? 'none' : undefined,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                        }}
                    />
                )
            })}
            {/* Overlay text */}
            <div
                style={{
                    position: 'absolute',
                    top: 24,
                    width: '100%',
                    textAlign: 'center',
                    color: '#fff',
                    fontSize: 24,
                    textShadow: '0 2px 8px #000',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    pointerEvents: 'none',
                    fontWeight: 600,
                    letterSpacing: 1,
                }}
            >
                {winnerId && expanding
                    ? 'Winner!'
                    : Object.keys(touches).length === 0
                        ? 'Touch and hold to choose'
                        : Object.keys(touches).length === 1
                            ? 'Add more fingers...'
                            : bouncing
                                ? 'Bouncing...'
                                : ''}
            </div>
        </div>
    )
}

export default App
