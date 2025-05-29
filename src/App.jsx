import {useRef, useState, useEffect} from 'react'
import './App.css'

const PHASE = {
  IDLE: 'idle',
  CHOOSING: 'choosing',
  WINNER: 'winner',
}

const App = () => {
    const colors = [
      '#e57373',
      '#ba68c8',
      '#4dd0e1',
      '#ffd54f',
      '#81c784',
    ]

  const BOUNCE_DURATION = 4500
  const RADIUS = 64
  const BORDER_WIDTH = 10
  const WIN_RADIUS = 800

  const touchCount = useRef(0);
  const [touches, setTouches] = useState({})
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [winnerId, setWinnerId] = useState(null)

  const currentTouchCount = Object.keys(touches).length;
  const touchIds = Object.keys(touches)

    const getXY = (t) => {
        const { width, height, offsetLeft, offsetTop } = window.visualViewport;
        const minX = RADIUS  + offsetLeft;
        const maxX = width + offsetLeft - RADIUS - BORDER_WIDTH * 2;
        const minY = RADIUS + offsetTop;
        const maxY = height + offsetTop - RADIUS - BORDER_WIDTH * 2;

        return {
            x: Math.max(minX, Math.min(t.clientX, maxX)),
            y: Math.max(minY, Math.min(t.clientY, maxY)),
        };
    };


    const syncTouches = (e) => {
    const newTouches = {  }
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
    if (currentTouchCount >= 2 && !winnerId && phase !== PHASE.WINNER) {
      const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), BOUNCE_DURATION)

      return () => clearTimeout(timeoutId)
    }
    if (currentTouchCount === 0 && winnerId) {
      setWinnerId(null)
    }
  }, [currentTouchCount, phase, winnerId]);


  const handleTouchStart = (e) => {
      console.log(e, window.innerHeight, window.innerWidth)
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
    if (winnerId){
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
      onTouchCancel={handleTouchEnd}
    >
      {Object.entries(touches).map(([id, t]) => {
        const radius = winnerId === id ? WIN_RADIUS : RADIUS;

        return (
          <div
          className={phase === PHASE.CHOOSING  && 'bounce-circle'}
            key={id}
            style={{
              position: 'absolute',
              left: t.x - radius,
              top: t.y - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              background: t.color,
              border: '10px solid #fff',
              boxShadow: `0 2px ${BORDER_WIDTH}px rgba(0,0,0,0.2)`,
              transition: winnerId && 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              display:  winnerId && winnerId !== id && 'none',
            }}
          />
        )
      })}
      <div className="overlay-text">
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
