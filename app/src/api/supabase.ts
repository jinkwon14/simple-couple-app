import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !anonKey) {
  console.warn('Supabase credentials are missing. Set EXPO_PUBLIC_SUPABASE_URL and key.');
}

export const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: true,
    storageKey: 'lovegarden-auth',
  },
});

export type Question = {
  id: number;
  text: string;
  category: string;
  assigned_for_date: string;
};

export type AnswerPayload = {
  dailyQuestionId: number;
  answerText: string;
  mood: 'happy' | 'calm' | 'tired' | 'stressed' | 'excited';
};

export type AnswerRecord = {
  id: number;
  user_id: string;
  answer_text: string;
  mood: string | null;
};

export type GardenPlot = {
  id: number;
  plot_index: number;
  seed_type: string | null;
  planted_at: string | null;
  watered_at: string | null;
  stage: 'seed' | 'sprout' | 'mature' | null;
};

export type PetInstance = {
  id: string;
  nickname: string | null;
  stage: 'egg' | 'baby' | 'teen' | 'adult';
  hunger: number;
  energy: number;
  happiness: number;
  species_id: number;
};

export type Egg = {
  id: string;
  rarity: string;
  hatch_progress: number;
  discovered_at: string;
};

export type InventoryItem = {
  id: number;
  kind: string;
  qty: number;
};

export const fetchTodayQuestion = async (coupleId: string) => {
  const today = DateTime.now().toISODate();
  const { data, error } = await supabase
    .from('daily_questions')
    .select('id, assigned_for_date, questions(text, category)')
    .eq('couple_id', coupleId)
    .eq('assigned_for_date', today)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    text: data.questions?.text ?? '',
    category: data.questions?.category ?? 'playful',
    assigned_for_date: data.assigned_for_date,
  } satisfies Question;
};

export const submitAnswer = async ({ dailyQuestionId, answerText, mood }: AnswerPayload) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    throw new Error('Must be authenticated to submit an answer');
  }
  const { error } = await supabase.from('answers').upsert(
    {
      daily_question_id: dailyQuestionId,
      answer_text: answerText,
      mood,
      user_id: user.user.id,
    },
    { onConflict: 'daily_question_id,user_id' },
  );
  if (error) throw error;
};

export const fetchGarden = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('garden_plots')
    .select('id, plot_index, seed_type, planted_at, watered_at, stage')
    .eq('couple_id', coupleId)
    .order('plot_index');
  if (error) throw error;
  return (data ?? []) as GardenPlot[];
};

export const waterPlot = async (plotId: number) => {
  const { error } = await supabase
    .from('garden_plots')
    .update({ watered_at: new Date().toISOString(), stage: 'sprout' })
    .eq('id', plotId);
  if (error) throw error;
};

export const harvestPlot = async (plotId: number) => {
  const { error } = await supabase
    .from('garden_plots')
    .update({ seed_type: null, planted_at: null, watered_at: null, stage: null })
    .eq('id', plotId);
  if (error) throw error;
};

export const plantSeed = async (coupleId: string, plotIndex: number, seedType: string) => {
  const { error } = await supabase
    .from('garden_plots')
    .upsert(
      {
        couple_id: coupleId,
        plot_index: plotIndex,
        seed_type: seedType,
        planted_at: new Date().toISOString(),
        stage: 'seed',
      },
      { onConflict: 'couple_id,plot_index' },
    );
  if (error) throw error;
};

export const fetchPet = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('pet_instances')
    .select('id, nickname, stage, hunger, energy, happiness, species_id')
    .eq('couple_id', coupleId)
    .maybeSingle();

  if (error) throw error;
  return data as PetInstance | null;
};

export const fetchEggs = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('eggs')
    .select('id, rarity, hatch_progress, discovered_at')
    .eq('couple_id', coupleId);
  if (error) throw error;
  return (data ?? []) as Egg[];
};

export const fetchInventory = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('id, kind, qty')
    .eq('couple_id', coupleId);
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
};

export const interactWithPet = async (petId: string, delta: Partial<Pick<PetInstance, 'hunger' | 'energy' | 'happiness'>>) => {
  const { error } = await supabase
    .from('pet_instances')
    .update(delta)
    .eq('id', petId);
  if (error) throw error;
};

export type StrokePayload = {
  id?: number;
  whiteboard_id: string;
  path: any;
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
};

export const sendStroke = async (stroke: StrokePayload) => {
  const { error } = await supabase.from('strokes').insert(stroke);
  if (error) throw error;
};

export const subscribeToWhiteboard = (whiteboardId: string, onStroke: (payload: StrokePayload) => void) => {
  const channel = supabase
    .channel(`wb_${whiteboardId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'strokes', filter: `whiteboard_id=eq.${whiteboardId}` }, (payload) => {
      onStroke(payload.new as StrokePayload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const fetchWhiteboard = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('whiteboards')
    .select('id, opened_at, expires_at')
    .eq('couple_id', coupleId)
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const fetchAnswers = async (dailyQuestionId: number) => {
  const { data, error } = await supabase
    .from('answers')
    .select('id, user_id, answer_text, mood')
    .eq('daily_question_id', dailyQuestionId);
  if (error) throw error;
  return (data ?? []) as AnswerRecord[];
};

export const subscribeToAnswers = (dailyQuestionId: number, cb: (answer: AnswerRecord) => void) => {
  const channel = supabase
    .channel(`answers_${dailyQuestionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `daily_question_id=eq.${dailyQuestionId}`,
      },
      (payload) => {
        cb(payload.new as AnswerRecord);
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

export type MissionRow = {
  id: number;
  couple_id: string;
  mission_id: number;
  status: 'active' | 'completed' | 'claimed';
  progress: Record<string, unknown>;
  missions: {
    code: string;
    period: 'daily' | 'weekly' | 'monthly';
    objective: Record<string, unknown>;
  } | null;
};

export const fetchCoupleMissions = async (coupleId: string) => {
  const { data, error } = await supabase
    .from('couple_missions')
    .select('id, couple_id, mission_id, status, progress, missions(code, period, objective)')
    .eq('couple_id', coupleId);
  if (error) throw error;
  return (data ?? []) as MissionRow[];
};
