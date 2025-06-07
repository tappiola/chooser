import {useEffect, useRef, useState} from 'react'
import jiggly from './jiggly.png';
import './App2.css'

const PHASE = {
    IDLE: 'idle',
    CHOOSING: 'choosing',
    WINNER: 'winner',
}

const App = () => {
    const colors = [
        '#e57373',
        '#9656c1',
        '#4dd0e1',
        '#ffd54f',
        '#81c784',
        '#557acf',
        '#f48e58',
        '#f38fc7',
        '#bac83e',
        '#754b2f',
    ]

    const BOUNCE_DURATION = 6050
    const RADIUS = 80
    const BORDER_WIDTH = 10

    const touchCount = useRef(0);
    const [touches, setTouches] = useState({})
    const [phase, setPhase] = useState(PHASE.IDLE)
    const [winnerId, setWinnerId] = useState(null)

    const currentTouchCount = Object.keys(touches).length;
    const touchIds = Object.keys(touches)

    const getXY = (t) => {
        const {width, height, offsetLeft, offsetTop} = window.visualViewport;
        const minX = RADIUS + offsetLeft;
        const maxX = width + offsetLeft - RADIUS - BORDER_WIDTH * 2;
        const minY = RADIUS + offsetTop;
        const maxY = height + offsetTop - RADIUS - BORDER_WIDTH * 2;

        const x = Math.max(minX, Math.min(t.clientX, maxX));
        const y = Math.max(minY, Math.min(t.clientY, maxY));

        const centerX = width / 2 + offsetLeft;
        const centerY = height / 2 + offsetTop;

        const angleRad = Math.atan2(centerY - y, centerX - x)
        const angleDeg = angleRad * (180 / Math.PI) + 90;

        return {
            x,
            y,
            angle: angleDeg
        };
    };


    const syncTouches = (e) => {
        const newTouches = {}
        for (let t of e.touches) {
            newTouches[t.identifier] = {
                color: colors[touchCount.current % colors.length],
                ...touches[t.identifier],
                ...getXY(t)
            }
        }
        setTouches(newTouches)
    }

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
    }, [currentTouchCount, phase, winnerId]);

    const isChoosing = currentTouchCount >= 2;

    useEffect(() => {
        if (isChoosing && !winnerId && phase !== PHASE.WINNER) {
            const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), BOUNCE_DURATION)

            return () => clearTimeout(timeoutId)
        }
    }, [isChoosing, phase, winnerId]);


    const handleTouchStart = (e) => {
        for (let t of e.changedTouches) {
            const newTouch = {
                [t.identifier]: {
                    ...getXY(t),
                    color: colors[touchCount.current % colors.length],
                }
            }
            setTouches(prevTouches => ({...prevTouches, ...newTouch}))
            touchCount.current += 1;
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

    useEffect(() => {
        if (phase === PHASE.WINNER && !winnerId) {
            const winnerIdx = Math.floor(Math.random() * touchIds.length)
            const winnerId = touchIds[winnerIdx]
            setWinnerId(winnerId)
        }

    }, [phase, touchIds, winnerId])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                touchAction: 'none',
                background: winnerId ? touches[winnerId] : undefined,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            // onTouchCancel={handleTouchEnd}
        >
            {Array(navigator.maxTouchPoints).fill(null).map((_, index) => {
                const radius = RADIUS;
                const touchId = touchIds[index];
                const t = touches[touchId] || {x: 0, y: 0, angle: 0, color: 'inherit'};

                return (
                    <div
                        className={phase !== PHASE.IDLE ? 'bounce-circle' : ''}
                        key={index}
                        style={{
                            position: 'absolute',
                            left: t.x - radius,
                            top: t.y - radius,
                            width: radius * 2,
                            height: radius * 2,
                            pointerEvents: 'none',
                            visibility: !touchId && 'hidden',
                            display: winnerId && winnerId !== touchId && 'none',
                        }}
                    >
                        <img
                            src={jiggly}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `rotate(${t.angle}deg)`,
                            }}
                        />
                    </div>

                )
            })}
            <div className="overlay-text" style={{top: `calc(${window.visualViewport?.offsetTop || 0}px + 12px)`}}>
                {!winnerId
                    && Object.keys(touches).length === 0
                    && 'Touch and hold to choose'}
                {!winnerId && Object.keys(touches).length === 1
                    && 'Add more fingers...'}
            </div>
        </div>
    )
}

export default App
