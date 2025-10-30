import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { DateTime } from 'luxon';
import type { GardenPlot, PetInstance, Question } from '../api/supabase';

export type AnswerState = {
  question?: Question | null;
  myAnswer?: string;
  partnerAnswer?: string;
  revealed: boolean;
  mood?: string;
};

export type GardenState = {
  plots: GardenPlot[];
};

export type PetState = {
  pet?: PetInstance | null;
  lastFedAt?: string;
};

export type MissionProgress = {
  id: number;
  code: string;
  status: 'active' | 'completed' | 'claimed';
  progress: number;
  goal: number;
  period: 'daily' | 'weekly' | 'monthly';
};

type PremiumStatus = 'free' | 'trial' | 'premium';

export type AppState = {
  profileId?: string;
  coupleId?: string;
  tz: string;
  answer: AnswerState;
  garden: GardenState;
  pet: PetState;
  missions: MissionProgress[];
  premium: PremiumStatus;
  randomEvent?: { message: string; reward?: string; seen: boolean } | null;
  setProfile: (profileId: string, tz: string) => void;
  setCouple: (coupleId: string) => void;
  setQuestion: (question: Question | null) => void;
  submitAnswerLocal: (answer: string, mood: string) => void;
  revealAnswers: (partnerAnswer: string) => void;
  hydrateGarden: (plots: GardenPlot[]) => void;
  updatePet: (pet: PetInstance | null) => void;
  markPetFed: () => void;
  setMissions: (missions: MissionProgress[]) => void;
  setPremium: (status: PremiumStatus) => void;
  queueRandomEvent: (message: string, reward?: string) => void;
  dismissRandomEvent: () => void;
  claimMission: (missionId: number) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      tz: process.env.EXPO_PUBLIC_DEFAULT_TZ ?? 'Asia/Seoul',
      answer: { revealed: false },
      garden: { plots: [] },
      pet: {},
      missions: [],
      premium: 'free',
      randomEvent: null,
      setProfile: (profileId: string, tz: string) =>
        set((draft) => {
          draft.profileId = profileId;
          draft.tz = tz;
        }),
      setCouple: (coupleId: string) =>
        set((draft) => {
          draft.coupleId = coupleId;
        }),
      setQuestion: (question: Question | null) =>
        set((draft) => {
          draft.answer.question = question ?? undefined;
          draft.answer.revealed = false;
          draft.answer.partnerAnswer = undefined;
        }),
      submitAnswerLocal: (answer: string, mood: string) =>
        set((draft) => {
          draft.answer.myAnswer = answer;
          draft.answer.mood = mood;
        }),
      revealAnswers: (partnerAnswer: string) =>
        set((draft) => {
          draft.answer.revealed = true;
          draft.answer.partnerAnswer = partnerAnswer;
        }),
      hydrateGarden: (plots: GardenPlot[]) =>
        set((draft) => {
          draft.garden.plots = plots;
        }),
      updatePet: (pet: PetInstance | null) =>
        set((draft) => {
          draft.pet.pet = pet ?? undefined;
        }),
      markPetFed: () =>
        set((draft) => {
          draft.pet.lastFedAt = DateTime.now().toISO();
          if (draft.pet.pet) {
            draft.pet.pet.hunger = Math.min(100, draft.pet.pet.hunger + 15);
            draft.pet.pet.happiness = Math.min(100, draft.pet.pet.happiness + 10);
          }
        }),
      setMissions: (missions: MissionProgress[]) =>
        set((draft) => {
          draft.missions = missions;
        }),
      setPremium: (status: PremiumStatus) =>
        set((draft) => {
          draft.premium = status;
        }),
      queueRandomEvent: (message: string, reward?: string) =>
        set((draft) => {
          draft.randomEvent = { message, reward, seen: false };
        }),
      dismissRandomEvent: () =>
        set((draft) => {
          if (draft.randomEvent) {
            draft.randomEvent.seen = true;
          }
        }),
      claimMission: (missionId: number) =>
        set((draft) => {
          const mission = draft.missions.find((m) => m.id === missionId);
          if (mission) {
            mission.status = 'claimed';
          }
        }),
    })),
    {
      name: 'lovegarden-store',
      partialize: (state) => ({
        profileId: state.profileId,
        coupleId: state.coupleId,
        tz: state.tz,
        premium: state.premium,
      }),
    },
  ),
);
