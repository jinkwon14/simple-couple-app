import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { DateTime } from 'https://esm.sh/luxon@3.4.4';
import { getServiceClient } from '../_shared/supabaseClient.ts';
import { getExpoAccessToken } from '../_shared/env.ts';

const client = getServiceClient();
const expoEndpoint = 'https://exp.host/--/api/v2/push/send';

const sendPush = async (token: string, title: string, body: string, data: Record<string, unknown>) => {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
  };

  const resp = await fetch(expoEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${getExpoAccessToken()}`,
    },
    body: JSON.stringify(message),
  });

  if (!resp.ok) {
    const payload = await resp.text();
    console.error('Expo push failed', resp.status, payload);
  }
};

serve(async () => {
  const today = DateTime.utc().toISODate();
  const { data: questions, error } = await client
    .from('daily_questions')
    .select('id, couple_id, assigned_for_date, questions(text)')
    .eq('assigned_for_date', today ?? '');

  if (error) {
    console.error('Failed to load daily questions', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const notified: Array<{ coupleId: string; tokens: number }> = [];

  for (const dq of questions ?? []) {
    const { data: members, error: memberError } = await client
      .from('couple_members')
      .select('user_id, profiles(display_name, push_token)')
      .eq('couple_id', dq.couple_id);

    if (memberError) {
      console.error('Failed to load members', memberError);
      continue;
    }

    let tokensSent = 0;
    for (const member of members ?? []) {
      const token = member.profiles?.push_token;
      if (!token) continue;
      tokensSent += 1;
      await sendPush(
        token,
        'LoveGarden Question 🌱',
        dq.questions?.text ?? 'Today\'s prompt awaits!',
        {
          type: 'daily_question',
          dailyQuestionId: dq.id,
        },
      );
    }

    notified.push({ coupleId: dq.couple_id, tokens: tokensSent });
  }

  return new Response(JSON.stringify({ notified }), {
    headers: { 'content-type': 'application/json' },
  });
});
