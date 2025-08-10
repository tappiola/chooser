import './App.css'
import useTouches, { PHASE } from 'use-touches'
import jiggly from './jiggly.png'

const App = () => {
  const BOUNCE_DURATION = 6050
  const RADIUS = 80
  const BORDER_WIDTH = 0

  const {
    touches,
    phase,
    winnerId,
    touchIds,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getUserMessage,
  } = useTouches({
    radius: RADIUS,
    borderWidth: BORDER_WIDTH,
    bounceDuration: BOUNCE_DURATION,
    getExtraData: (_touch, { x: coordX, y: coordY }) => {
      const { width, height, offsetLeft, offsetTop } = window.visualViewport
      const centerX = width / 2 + offsetLeft
      const centerY = height / 2 + offsetTop
      const angleRad = Math.atan2(centerY - coordY, centerX - coordX)
      const angleDeg = angleRad * (180 / Math.PI) + 90
      return { angle: angleDeg }
    },
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
          const radius = RADIUS
          const touchId = touchIds[index]
          const touchInfo = touches[touchId] || {
            x: 0,
            y: 0,
            angle: 0,
            color: 'inherit',
          }

          return (
            <div
              className={phase !== PHASE.IDLE ? 'bounce-circle' : ''}
              key={index}
              style={{
                position: 'absolute',
                left: touchInfo.x - radius,
                top: touchInfo.y - radius,
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
                  transform: `rotate(${touchInfo.angle}deg)`,
                }}
              />
            </div>
          )
        })}
      <div
        className="overlay-text"
        style={{
          top: `calc(${window.visualViewport?.offsetTop || 0}px + 12px)`,
        }}
      >
        {getUserMessage()}
      </div>
    </div>
  )
}

export default App
