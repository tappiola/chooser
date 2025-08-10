import './App.css'
import useTouches, { PHASE } from './useTouches.js'

const App = () => {
  const colors = [
    '#e57373',
    '#9656c1',
    '#4dd0e1',
    '#ffd54f',
    '#81c784',
    '#557acf',
    '#f67c3a',
    '#f38fc7',
    '#bac83e',
    '#d68639',
  ]

  const BOUNCE_DURATION = 4500
  const RADIUS = 64
  const BORDER_WIDTH = 10
  const WIN_RADIUS = 800

  const {
    touches,
    phase,
    winnerId,
    touchIds,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTouches({
    colors,
    radius: RADIUS,
    borderWidth: BORDER_WIDTH,
    bounceDuration: BOUNCE_DURATION,
  })

  return (
    <div
      className="wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {Array(navigator.maxTouchPoints)
        .fill(null)
        .map((_unused, index) => {
          const touchId = touchIds[index]
          const touchInfo = touches[touchId] || {
            x: 0,
            y: 0,
            angle: 0,
            color: 'inherit',
          }
          const circleRadius = winnerId === touchId ? WIN_RADIUS : RADIUS

          return (
            <div
              className={phase === PHASE.CHOOSING ? 'bounce-circle' : ''}
              key={index}
              style={{
                position: 'absolute',
                left: touchInfo.x - circleRadius,
                top: touchInfo.y - circleRadius,
                width: circleRadius * 2,
                height: circleRadius * 2,
                borderRadius: '50%',
                background: touchInfo.color,
                border: '10px solid #fff',
                boxShadow: `0 2px ${BORDER_WIDTH}px rgba(0,0,0,0.2)`,
                transition: winnerId && 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: winnerId && winnerId !== touchId && 'none',
                visibility: !touchId && 'hidden',
              }}
            />
          )
        })}
      <div
        className="overlay-text"
        style={{
          top: `calc(${window.visualViewport?.offsetTop || 0}px + 12px)`,
        }}
      >
        {!winnerId && touchIds.length === 0 && 'Touch and hold to choose'}
        {!winnerId && touchIds.length === 1 && 'Add more fingers...'}
      </div>
    </div>
  )
}

export default App
