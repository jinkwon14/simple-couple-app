import { act } from '@testing-library/react-native';
import { useAppStore } from '../src/state/store';

describe('app store', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState((state) => ({
        ...state,
        profileId: undefined,
        coupleId: undefined,
        tz: 'Asia/Seoul',
        answer: { revealed: false },
        garden: { plots: [] },
        pet: {},
        missions: [],
        premium: 'free',
        randomEvent: null,
      }));
    });
  });

  it('queues random event and marks seen', () => {
    act(() => useAppStore.getState().queueRandomEvent('Surprise', 'seed'));
    expect(useAppStore.getState().randomEvent?.seen).toBe(false);
    act(() => useAppStore.getState().dismissRandomEvent());
    expect(useAppStore.getState().randomEvent?.seen).toBe(true);
  });

  it('marks mission claimed', () => {
    act(() => useAppStore.setState({ missions: [{ id: 1, code: 'TEST', status: 'completed', progress: 1, goal: 1, period: 'daily' }] }));
    act(() => useAppStore.getState().claimMission(1));
    expect(useAppStore.getState().missions[0].status).toBe('claimed');
  });
});
