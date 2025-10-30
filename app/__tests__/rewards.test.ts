import { calculateEggChance, rollReward } from '../src/lib/rewards';
import { DateTime } from 'luxon';

describe('rewards', () => {
  it('reduces egg chance after recent drop', () => {
    const history = [
      { type: 'egg_drop' as const, createdAt: DateTime.now().minus({ hours: 2 }).toISO()! },
    ];
    expect(calculateEggChance(history)).toBe(0.02);
  });

  it('increases egg chance when no recent drop', () => {
    const history: any[] = [];
    expect(calculateEggChance(history)).toBe(0.05);
  });

  it('returns either egg or decor reward', () => {
    const result = rollReward([]);
    expect(['egg', 'decor']).toContain(result.type);
  });
});
