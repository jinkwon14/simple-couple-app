import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { fetchCoupleMissions, type MissionRow } from '../api/supabase';
import { useAppStore } from '../state/store';
import { track } from '../lib/analytics';

const MissionItem = ({ mission, onClaim }: { mission: MissionRow; onClaim: () => void }) => {
  const progressCount = Number(mission.progress?.count ?? 0);
  const goal = Number((mission.missions?.objective as any)?.count ?? 1);
  const isCompleted = mission.status !== 'active';
  return (
    <Card>
      <Text style={styles.title}>{mission.missions?.code ?? 'Mission'}</Text>
      <Text style={styles.meta}>{mission.missions?.period?.toUpperCase()}</Text>
      <Text style={styles.body}>Progress {progressCount}/{goal}</Text>
      <Button title={mission.status === 'claimed' ? 'Claimed' : 'Claim reward'} onPress={onClaim} disabled={mission.status === 'claimed'} />
    </Card>
  );
};

export const MissionsScreen = () => {
  const coupleId = useAppStore((state) => state.coupleId);
  const setMissions = useAppStore((state) => state.setMissions);
  const missions = useAppStore((state) => state.missions);
  const claimMission = useAppStore((state) => state.claimMission);

  const { isLoading } = useQuery({
    queryKey: ['missions', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      if (!coupleId) return [] as MissionRow[];
      const data = await fetchCoupleMissions(coupleId);
      setMissions(
        data.map((mission) => ({
          id: mission.id,
          code: mission.missions?.code ?? 'MISSION',
          status: mission.status,
          progress: Number(mission.progress?.count ?? 0),
          goal: Number((mission.missions?.objective as any)?.count ?? 1),
          period: (mission.missions?.period as 'daily' | 'weekly' | 'monthly') ?? 'daily',
        })),
      );
      return data;
    },
  });

  const handleClaim = (missionId: number) => {
    claimMission(missionId);
    track('mission_claim', { missionId });
  };

  return (
    <View style={styles.container}>
      {isLoading ? <Text style={styles.loading}>Loading missions...</Text> : null}
      <FlatList
        data={missions}
        keyExtractor={(mission) => mission.id.toString()}
        renderItem={({ item }) => (
          <MissionItem
            mission={{
              id: item.id,
              couple_id: coupleId ?? '',
              mission_id: item.id,
              status: item.status,
              progress: { count: item.progress },
              missions: { code: item.code, period: item.period, objective: { count: item.goal } },
            }}
            onClaim={() => handleClaim(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    padding: 16,
  },
  list: {
    paddingBottom: 60,
    gap: 12,
  },
  loading: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#1D4ED8',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  meta: {
    fontSize: 12,
    color: '#2563EB',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
});
