import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

export type DragDropAreaProps = {
    sourceContent: React.ReactNode;
    targetContent: React.ReactNode;
    onSuccess: () => void;
    onFail: () => void;
    onDragStart: () => void;
    /** Tolerancia extra alrededor de la zona destino (mínimo 40 para TEA). */
    hitSlop?: number;
};

type Rect = { x: number; y: number; width: number; height: number };

function readXY(v: Animated.ValueXY): { x: number; y: number } {
    return {
        // Valores internos tras animación; necesario para setOffset en el siguiente gesto.
        x: (v.x as unknown as { _value: number })._value,
        y: (v.y as unknown as { _value: number })._value,
    };
}

/**
 * Arrastre con PanResponder; translate con useNativeDriver: false para seguir el dedo sin lag.
 */
export default function DragDropArea({
    sourceContent,
    targetContent,
    onSuccess,
    onFail,
    onDragStart,
    hitSlop = 40,
}: DragDropAreaProps) {
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const targetLayout = useRef<Rect | null>(null);
    const targetRef = useRef<View>(null);
    const reportedDrag = useRef(false);
    const handlersRef = useRef({
        onSuccess,
        onFail,
        onDragStart,
        hitSlop,
    });
    handlersRef.current = { onSuccess, onFail, onDragStart, hitSlop };

    const remeasureTarget = useCallback(() => {
        targetRef.current?.measureInWindow((x, y, width, height) => {
            targetLayout.current = { x, y, width, height };
        });
    }, []);

    const resetPosition = useCallback(() => {
        Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 80,
            useNativeDriver: false,
        }).start();
    }, [pan]);

    const resetPositionRef = useRef(resetPosition);
    resetPositionRef.current = resetPosition;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                reportedDrag.current = false;
                const cur = readXY(pan);
                pan.setOffset({ x: cur.x, y: cur.y });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (e, gesture) => {
                pan.x.setValue(gesture.dx);
                pan.y.setValue(gesture.dy);
                const { onDragStart: od } = handlersRef.current;
                if (!reportedDrag.current && (Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10)) {
                    reportedDrag.current = true;
                    od();
                }
            },
            onPanResponderRelease: (_e, gesture) => {
                pan.flattenOffset();
                const { onSuccess: os, onFail: ofail, hitSlop: hs } = handlersRef.current;
                const { moveX, moveY } = gesture;
                const t = targetLayout.current;
                const rp = resetPositionRef.current;
                if (!t) {
                    ofail();
                    rp();
                    return;
                }
                const pad = hs;
                const inside =
                    moveX >= t.x - pad &&
                    moveX <= t.x + t.width + pad &&
                    moveY >= t.y - pad &&
                    moveY <= t.y + t.height + pad;

                if (inside) {
                    os();
                    pan.setValue({ x: 0, y: 0 });
                } else {
                    ofail();
                    rp();
                }
            },
            onPanResponderTerminate: () => {
                pan.flattenOffset();
                handlersRef.current.onFail();
                resetPositionRef.current();
            },
        }),
    ).current;

    useEffect(() => {
        const t = setTimeout(remeasureTarget, 100);
        return () => clearTimeout(t);
    }, [remeasureTarget]);

    return (
        <View style={styles.row}>
            <View style={styles.cell}>
                <Animated.View
                    style={[
                        styles.draggableWrap,
                        {
                            transform: [{ translateX: pan.x }, { translateY: pan.y }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {sourceContent}
                </Animated.View>
            </View>
            <View
                style={styles.cell}
                ref={targetRef}
                onLayout={remeasureTarget}
                collapsable={false}
            >
                {targetContent}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
        gap: 8,
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
    },
    draggableWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
