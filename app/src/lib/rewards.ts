import { DateTime } from 'luxon';

export type EventHistory = Array<{ type: 'egg_drop' | 'random_visit'; createdAt: string }>;

type Reward =
  | { type: 'egg'; rarity: 'common' | 'rare' | 'ultra' }
  | { type: 'decor'; id: string };

const decorPool = [
  'decor.cozycabin.chair',
  'decor.cozycabin.rug',
  'decor.twilight.lantern',
  'decor.spring.wreath',
];

const rarityWeights = {
  common: 0.7,
  rare: 0.25,
  ultra: 0.05,
};

export const calculateEggChance = (history: EventHistory) => {
  const last24h = history.filter((event) => DateTime.fromISO(event.createdAt) > DateTime.now().minus({ hours: 24 }));
  return last24h.some((event) => event.type === 'egg_drop') ? 0.02 : 0.05;
};

const pickRarity = () => {
  const roll = Math.random();
  if (roll < rarityWeights.ultra) return 'ultra';
  if (roll < rarityWeights.ultra + rarityWeights.rare) return 'rare';
  return 'common';
};

export const rollReward = (history: EventHistory): Reward => {
  const chance = calculateEggChance(history);
  if (Math.random() < chance) {
    return { type: 'egg', rarity: pickRarity() };
  }
  const decor = decorPool[Math.floor(Math.random() * decorPool.length)];
  return { type: 'decor', id: decor };
};
