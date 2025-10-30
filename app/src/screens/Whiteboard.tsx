import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DateTime } from 'luxon';
import { PalettePicker } from '../components/PalettePicker';
import { StrokeCanvas, type Stroke } from '../components/StrokeCanvas';
import { Button } from '../components/Button';
import { useRealtimeWhiteboard } from '../hooks/useRealtimeWhiteboard';
import { fetchWhiteboard, sendStroke } from '../api/supabase';
import { useAppStore } from '../state/store';

const widths = [4, 8, 12];

export const WhiteboardScreen = () => {
  const coupleId = useAppStore((state) => state.coupleId);
  const [color, setColor] = useState('#2F2E41');
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [ttl, setTtl] = useState<string>('');

  const { data: whiteboard } = useQuery({
    queryKey: ['whiteboard', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      if (!coupleId) return null;
      return fetchWhiteboard(coupleId);
    },
  });

  const { strokes, reset } = useRealtimeWhiteboard(whiteboard?.id);

  useEffect(() => {
    if (!whiteboard?.expires_at) return;
    const interval = setInterval(() => {
      const diff = DateTime.fromISO(whiteboard.expires_at).diffNow();
      const hours = Math.max(0, Math.floor(diff.as('hours')));
      const minutes = Math.max(0, Math.floor(diff.as('minutes') % 60));
      setTtl(`${hours}h ${minutes}m left`);
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, [whiteboard?.expires_at]);

  const mutation = useMutation({
    mutationFn: sendStroke,
  });

  const handleStrokeComplete = async (stroke: Stroke) => {
    await mutation.mutateAsync({
      whiteboard_id: whiteboard?.id ?? '',
      ...stroke,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily whiteboard</Text>
        <Text style={styles.ttl}>{ttl}</Text>
      </View>
      <StrokeCanvas strokes={strokes as Stroke[]} color={color} width={width} tool={tool} onStrokeComplete={handleStrokeComplete} />
      <View style={styles.controls}>
        <PalettePicker selected={color} onSelect={setColor} />
        <View style={styles.widths}>
          {widths.map((size) => (
            <Button key={size} title={`${size}`} variant={width === size ? 'primary' : 'secondary'} onPress={() => setWidth(size)} />
          ))}
        </View>
        <View style={styles.toolRow}>
          <Button title="Pen" variant={tool === 'pen' ? 'primary' : 'secondary'} onPress={() => setTool('pen')} />
          <Button title="Erase" variant={tool === 'eraser' ? 'primary' : 'secondary'} onPress={() => setTool('eraser')} />
        </View>
        <Button title="Clear" variant="secondary" onPress={reset} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  ttl: {
    fontSize: 14,
    color: '#4B5563',
  },
  controls: {
    gap: 12,
  },
  widths: {
    flexDirection: 'row',
    gap: 8,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
