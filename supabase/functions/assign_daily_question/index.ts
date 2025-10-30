import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { getServiceClient } from '../_shared/supabaseClient.ts';
import { todayInTz } from '../_shared/time.ts';

const client = getServiceClient();

type CoupleRecord = {
  id: string;
  tz: string;
};

const sample = <T>(items: T[]): T | null => {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

serve(async () => {
  const { data: couples, error } = await client
    .from('couples')
    .select('id, couple_members(user_id, profiles(tz))');

  if (error) {
    console.error('Failed to load couples', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const normalizedCouples: CoupleRecord[] = (couples ?? []).map((c: any) => {
    const tz = c.couple_members?.[0]?.profiles?.tz ?? 'Asia/Seoul';
    return { id: c.id, tz };
  });

  const assigned: Array<{ coupleId: string; questionId: number | null }> = [];

  for (const couple of normalizedCouples) {
    const today = todayInTz(couple.tz);
    const isoDate = today.toISODate();
    if (!isoDate) continue;

    const existing = await client
      .from('daily_questions')
      .select('id')
      .eq('couple_id', couple.id)
      .eq('assigned_for_date', isoDate)
      .maybeSingle();

    if (existing.data) {
      assigned.push({ coupleId: couple.id, questionId: null });
      continue;
    }

    const fourteenDaysAgo = today.minus({ days: 14 }).toISODate();

    const recent = await client
      .from('daily_questions')
      .select('question_id')
      .eq('couple_id', couple.id)
      .gte('assigned_for_date', fourteenDaysAgo ?? isoDate);

    const excluded = new Set((recent.data ?? []).map((r) => r.question_id));

    const { data: candidates, error: candidateError } = await client
      .from('questions')
      .select('id')
      .eq('active', true);

    if (candidateError || !candidates?.length) {
      console.error('No questions available', candidateError);
      continue;
    }

    const available = candidates.filter((q) => !excluded.has(q.id));
    const pick = sample(available.length ? available : candidates);
    if (!pick) continue;

    const { error: insertError } = await client.from('daily_questions').insert({
      couple_id: couple.id,
      question_id: pick.id,
      assigned_for_date: isoDate,
    });

    if (insertError) {
      console.error('Failed to assign question', insertError);
    } else {
      assigned.push({ coupleId: couple.id, questionId: pick.id });
    }
  }

  return new Response(JSON.stringify({ assigned }), { headers: { 'content-type': 'application/json' } });
});
