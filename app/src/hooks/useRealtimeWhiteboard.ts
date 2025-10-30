import { useEffect, useRef, useState } from 'react';
import { subscribeToWhiteboard, sendStroke, type StrokePayload } from '../api/supabase';
import { track } from '../lib/analytics';

export const useRealtimeWhiteboard = (whiteboardId?: string | null) => {
  const [strokes, setStrokes] = useState<StrokePayload[]>([]);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    if (!whiteboardId) return;
    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribeToWhiteboard(whiteboardId, (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
      track('wb_stroke', { whiteboardId });
    });
    return () => unsubscribeRef.current?.();
  }, [whiteboardId]);

  const pushStroke = async (stroke: StrokePayload) => {
    if (!whiteboardId) return;
    await sendStroke({ ...stroke, whiteboard_id: whiteboardId });
  };

  const reset = () => setStrokes([]);

  return { strokes, pushStroke, reset };
};
