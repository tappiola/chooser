import jiggly from './jiggly.png'
import './App2.css'
import useTouchChooser, {PHASE} from './useTouchChooser.js'

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

    const {
        touches,
        phase,
        winnerId,
        touchIds,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    } = useTouchChooser({
        colors,
        radius: RADIUS,
        borderWidth: BORDER_WIDTH,
        bounceDuration: BOUNCE_DURATION,
        getExtraData: (_, {x, y}) => {
            const {width, height, offsetLeft, offsetTop} = window.visualViewport
            const centerX = width / 2 + offsetLeft
            const centerY = height / 2 + offsetTop
            const angleRad = Math.atan2(centerY - y, centerX - x)
            const angleDeg = angleRad * (180 / Math.PI) + 90
            return {angle: angleDeg}
        },
    })

    return (
        <div
            className="wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {Array(navigator.maxTouchPoints).fill(null).map((_, index) => {
                const radius = RADIUS
                const touchId = touchIds[index]
                const t = touches[touchId] || {x: 0, y: 0, angle: 0, color: 'inherit'}

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
                    && touchIds.length === 0
                    && 'Touch and hold to choose'}
                {!winnerId && touchIds.length === 1
                    && 'Add more fingers...'}
            </div>
        </div>
    )
}

export default App

