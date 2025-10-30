import Constants from 'expo-constants';

type EventName =
  | 'pair_complete'
  | 'q_answer'
  | 'q_reveal'
  | 'garden_water'
  | 'harvest'
  | 'pet_feed'
  | 'wb_stroke'
  | 'random_visit'
  | 'mission_claim'
  | 'premium_subscribe';

type EventPayload = Record<string, unknown>;

const buffer: Array<{ name: EventName; payload: EventPayload; ts: number }> = [];

export const track = (name: EventName, payload: EventPayload = {}) => {
  const ts = Date.now();
  buffer.push({ name, payload, ts });
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${name}`, payload);
  }
};

export const flushAnalytics = async () => {
  if (!buffer.length) return;
  const project = Constants.expoConfig?.name ?? 'LoveGarden';
  buffer.splice(0, buffer.length);
  // Placeholder for backend ingestion; this can be replaced with a network call
  if (__DEV__) {
    console.log(`Flushed analytics for ${project}`);
  }
};
