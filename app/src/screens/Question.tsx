import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
  fetchAnswers,
  fetchTodayQuestion,
  submitAnswer,
  subscribeToAnswers,
  type AnswerRecord,
} from '../api/supabase';
import { useAppStore } from '../state/store';
import { track } from '../lib/analytics';

const moods: Array<{ value: AnswerRecord['mood']; label: string }> = [
  { value: 'happy', label: 'Happy' },
  { value: 'calm', label: 'Calm' },
  { value: 'tired', label: 'Tired' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'excited', label: 'Excited' },
];

export const QuestionScreen = () => {
  const coupleId = useAppStore((state) => state.coupleId);
  const profileId = useAppStore((state) => state.profileId);
  const answerState = useAppStore((state) => state.answer);
  const setQuestion = useAppStore((state) => state.setQuestion);
  const submitAnswerLocal = useAppStore((state) => state.submitAnswerLocal);
  const revealAnswers = useAppStore((state) => state.revealAnswers);

  const [localAnswer, setLocalAnswer] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('happy');

  const { data: question } = useQuery({
    queryKey: ['question', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      if (!coupleId) return null;
      const q = await fetchTodayQuestion(coupleId);
      setQuestion(q);
      return q;
    },
  });

  useEffect(() => {
    if (answerState.question) {
      setLocalAnswer(answerState.myAnswer ?? '');
      setSelectedMood(answerState.mood ?? 'happy');
    }
  }, [answerState.question, answerState.myAnswer, answerState.mood]);

  useEffect(() => {
    if (!question?.id) return;
    let unsub: (() => void) | undefined;
    fetchAnswers(question.id).then((answers) => {
      const partner = answers.find((a) => a.user_id !== profileId);
      if (partner?.answer_text) {
        revealAnswers(partner.answer_text);
      }
    });
    unsub = subscribeToAnswers(question.id, (answer) => {
      if (answer.user_id !== profileId) {
        revealAnswers(answer.answer_text);
        track('q_reveal', { dailyQuestionId: question.id });
      }
    });
    return () => unsub?.();
  }, [question?.id, profileId, revealAnswers]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: () => {
      track('q_answer', { questionId: answerState.question?.id });
      Alert.alert('Answer sent', 'We will reveal when your partner responds.');
    },
    onError: (error: Error) => Alert.alert('Unable to submit', error.message),
  });

  const disabled = !localAnswer?.trim();

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.category}>{question?.category?.toUpperCase()}</Text>
        <Text style={styles.prompt}>{question?.text ?? 'No question yet. Check back soon!'}</Text>
      </Card>
      <Card>
        <Text style={styles.label}>Your reflection</Text>
        <TextInput
          accessibilityLabel="Your answer"
          placeholder="Share your thoughts..."
          multiline
          value={localAnswer}
          onChangeText={setLocalAnswer}
          style={styles.input}
        />
        <View style={styles.moodRow}>
          {moods.map((mood) => (
            <Button
              key={mood.value}
              title={mood.label}
              variant={selectedMood === mood.value ? 'primary' : 'secondary'}
              onPress={() => setSelectedMood(mood.value ?? 'happy')}
            />
          ))}
        </View>
        <Button
          title="Submit"
          onPress={() => {
            if (!question) return;
            submitAnswerLocal(localAnswer, selectedMood ?? 'happy');
            mutation.mutate({
              dailyQuestionId: question.id,
              answerText: localAnswer,
              mood: (selectedMood as any) ?? 'happy',
            });
          }}
          disabled={disabled || mutation.isPending}
        />
      </Card>
      {answerState.revealed && answerState.partnerAnswer ? (
        <Card>
          <Text style={styles.label}>Partner shared</Text>
          <Text style={styles.partnerAnswer}>{answerState.partnerAnswer}</Text>
        </Card>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
    padding: 16,
    gap: 16,
  },
  category: {
    color: '#6366F1',
    fontWeight: '600',
  },
  prompt: {
    fontSize: 20,
    color: '#0F172A',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  partnerAnswer: {
    fontSize: 16,
    color: '#111827',
  },
});
