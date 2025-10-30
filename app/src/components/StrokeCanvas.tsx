import { memo, useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Canvas, Path } from '@shopify/react-native-skia';

export type Stroke = {
  color: string;
  width: number;
  path: string;
  tool: 'pen' | 'eraser';
};

export type StrokeCanvasProps = {
  strokes: Stroke[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
  onStrokeComplete: (stroke: Stroke) => void;
};

export const StrokeCanvas = memo(({ strokes, color, width, tool, onStrokeComplete }: StrokeCanvasProps) => {
  const [currentPoints, setCurrentPoints] = useState<string>('');

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const point = `${evt.nativeEvent.locationX},${evt.nativeEvent.locationY}`;
          setCurrentPoints(point);
        },
        onPanResponderMove: (evt) => {
          const point = `${evt.nativeEvent.locationX},${evt.nativeEvent.locationY}`;
          setCurrentPoints((prev) => `${prev} ${point}`);
        },
        onPanResponderRelease: () => {
          if (!currentPoints) return;
          const stroke: Stroke = {
            color,
            width,
            path: currentPoints,
            tool,
          };
          onStrokeComplete(stroke);
          setCurrentPoints('');
        },
      }),
    [color, width, tool, onStrokeComplete, currentPoints],
  );

  const renderedStrokes = useMemo(
    () =>
      [...strokes, currentPoints ? { color, width, path: currentPoints, tool } : null]
        .filter(Boolean)
        .map((stroke, index) => (
          <Path
            key={`${(stroke as Stroke).path}-${index}`}
            path={`M ${(stroke as Stroke).path}`}
            color={(stroke as Stroke).tool === 'eraser' ? '#FFFFFF' : (stroke as Stroke).color}
            strokeWidth={(stroke as Stroke).width}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        )),
    [strokes, currentPoints, color, width, tool],
  );

  return (
    <View style={styles.container} {...responder.panHandlers}>
      <Canvas style={StyleSheet.absoluteFill}>{renderedStrokes}</Canvas>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
