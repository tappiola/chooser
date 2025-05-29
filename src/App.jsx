import {useRef, useState, useEffect} from 'react'
import './App.css'

const PHASE = {
  IDLE: 'idle',
  CHOOSING: 'choosing',
  WINNER: 'winner',
}

const App = () => {
    const colors = [
      '#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65', '#4dd0e1', '#f06292'
    ]

  const BOUNCE_DURATION = 4750
  const RADIUS = 60
  const WIN_RADIUS = 800

  const touchCount = useRef(0);
  const [touches, setTouches] = useState({})
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [winnerId, setWinnerId] = useState(null)

  const currentTouchCount = Object.keys(touches).length;
  const touchIds = Object.keys(touches)

  useEffect(() => {
    if (currentTouchCount < 2 && phase !== PHASE.IDLE) {
      setPhase(PHASE.IDLE)
    }
    if (currentTouchCount >= 2 && !winnerId && phase !== PHASE.CHOOSING) {
      setPhase(PHASE.CHOOSING)
    }
    if (currentTouchCount >= 2 && !winnerId && phase !== PHASE.WINNER) {
      const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), BOUNCE_DURATION)

      return () => clearTimeout(timeoutId)
    }
    if (currentTouchCount === 0 && winnerId) {
      console.log(4)
      setWinnerId(null)
    }
  }, [currentTouchCount, phase, winnerId]);

  console.log({touches, phase, winnerId});

  const handleTouchStart = (e) => {
    // e.preventDefault()
    for (let t of e.changedTouches) {
      const newTouch = {
        [t.identifier]: {
          x: t.clientX,
          y: t.clientY,
          color: colors[touchCount.current % colors.length],
        }
      }
      setTouches(prevTouches => ({...prevTouches, ...newTouch}))
      touchCount.current += 1;
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const newTouches = { ...touches }
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
    const newTouches = { ...touches }
    for (let t of e.changedTouches) {
      delete newTouches[t.identifier]
    }
    setTouches(newTouches)
  }


  // useEffect(() => {
  //   if (phase === PHASE.CHOOSING) {
  //   console.log('choosing!');
  //     const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), BOUNCE_DURATION)
  //
  //     return () => clearTimeout(timeoutId)
  //   }
  //
  // }, [phase])

  useEffect(() => {
    if (phase === PHASE.WINNER && !winnerId) {

      console.log('winner');
        const winnerIdx = Math.floor(Math.random() * touchIds.length)
        const winnerId = touchIds[winnerIdx]
        console.log(winnerId)
        setWinnerId(winnerId)
    }

  }, [phase, touchIds, winnerId])

  // Render
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        touchAction: 'none',
        background: winnerId ? touches[winnerId] : undefined,
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
      {/* Touch circles */}
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
              border: '12px solid #fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              transition: 'all 3s',
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
