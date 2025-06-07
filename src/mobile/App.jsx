import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import jiggly from './assets/jiggly.png'; // replace with a valid import or asset

const PHASE = {
    IDLE: 'idle',
    CHOOSING: 'choosing',
    WINNER: 'winner',
};

const BOUNCE_DURATION = 6050;
const RADIUS = 80;
const BORDER_WIDTH = 10;

const colors = ['#e57373', '#ba68c8', '#4dd0e1', '#ffd54f', '#81c784'];

const App = () => {
    const touchCount = useRef(0);
    const [touches, setTouches] = useState({});
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [winnerId, setWinnerId] = useState(null);

    const {width, height} = Dimensions.get('window');
    const touchIds = Object.keys(touches);
    const currentTouchCount = touchIds.length;

    const getXY = (x, y) => {
        const minX = RADIUS;
        const maxX = width - RADIUS - BORDER_WIDTH * 2;
        const minY = RADIUS + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
        const maxY = height - RADIUS - BORDER_WIDTH * 2;

        x = Math.max(minX, Math.min(x, maxX));
        y = Math.max(minY, Math.min(y, maxY));

        const centerX = width / 2;
        const centerY = height / 2;

        const angleRad = Math.atan2(centerY - y, centerX - x);
        const angleDeg = angleRad * (180 / Math.PI) + 90;

        return {x, y, angle: angleDeg};
    };

    const handleTouches = (event) => {
        const newTouches = {};
        const changedTouches = event.nativeEvent.touches;

        for (let i = 0; i < changedTouches.length; i++) {
            const t = changedTouches[i];
            newTouches[t.identifier] = {
                ...touches[t.identifier],
                color: colors[touchCount.current % colors.length],
                ...getXY(t.pageX, t.pageY),
            };
        }
        setTouches(newTouches);
    };

    const handleTouchStart = handleTouches;
    const handleTouchMove = handleTouches;
    const handleTouchEnd = (event) => {
        const activeTouches = event.nativeEvent.touches;
        const active = {};

        for (let i = 0; i < activeTouches.length; i++) {
            const t = activeTouches[i];
            active[t.identifier] = touches[t.identifier];
        }
        setTouches(active);
    };

    useEffect(() => {
        if (currentTouchCount < 2 && phase !== PHASE.IDLE) setPhase(PHASE.IDLE);
        if (currentTouchCount >= 2 && !winnerId && phase === PHASE.IDLE) setPhase(PHASE.CHOOSING);
        if (currentTouchCount === 0 && winnerId) setWinnerId(null);
    }, [currentTouchCount, phase, winnerId]);

    const isChoosing = currentTouchCount >= 2;

    useEffect(() => {
        if (isChoosing && !winnerId && phase !== PHASE.WINNER) {
            const timeoutId = setTimeout(() => setPhase(PHASE.WINNER), BOUNCE_DURATION);
            return () => clearTimeout(timeoutId);
        }
    }, [isChoosing, phase, winnerId]);

    useEffect(() => {
        if (phase === PHASE.WINNER && !winnerId && touchIds.length > 0) {
            const winnerIdx = Math.floor(Math.random() * touchIds.length);
            setWinnerId(touchIds[winnerIdx]);
        }
    }, [phase, touchIds, winnerId]);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View
                style={[styles.fullScreen, winnerId && {backgroundColor: touches[winnerId]?.color}]}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {Array(5).fill(null).map((_, index) => {
                    const touchId = touchIds[index];
                    const t = touches[touchId] || {x: 0, y: 0, angle: 0, color: 'transparent'};
                    return (
                        <View
                            key={index}
                            style={[styles.circle, {
                                left: t.x - RADIUS,
                                top: t.y - RADIUS,
                                display: winnerId && winnerId !== touchId ? 'none' : 'flex',
                            }]}
                        >
                            <Image
                                source={jiggly}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: [{rotate: `${t.angle}deg`}],
                                }}
                                resizeMode="cover"
                            />
                        </View>
                    );
                })}

                {currentTouchCount === 0 && !winnerId && (
                    <Text style={styles.overlayText}>Touch and hold to choose</Text>
                )}
                {currentTouchCount === 1 && !winnerId && (
                    <Text style={styles.overlayText}>Add more fingers...</Text>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullScreen: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
    },
    circle: {
        position: 'absolute',
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: RADIUS,
        overflow: 'hidden',
    },
    overlayText: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 6,
        borderRadius: 8,
    },
});

export default App;
