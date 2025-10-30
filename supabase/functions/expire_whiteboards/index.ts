import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { DateTime } from 'https://esm.sh/luxon@3.4.4';
import { getServiceClient } from '../_shared/supabaseClient.ts';

const client = getServiceClient();

serve(async () => {
  const now = DateTime.utc();
  const { data: boards, error } = await client
    .from('whiteboards')
    .select('id, couple_id, opened_at, expires_at')
    .lt('expires_at', now.toISO());

  if (error) {
    console.error('Failed to load whiteboards', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const processed: string[] = [];

  for (const board of boards ?? []) {
    const archiveUrl = `archive://whiteboard/${board.id}.png`;
    const { error: archiveError } = await client.from('whiteboard_archive').insert({
      couple_id: board.couple_id,
      opened_at: board.opened_at,
      closed_at: now.toISO(),
      image_url: archiveUrl,
    });

    if (archiveError) {
      console.error('Failed to archive whiteboard', archiveError);
      continue;
    }

    const { error: deleteError } = await client.from('whiteboards').delete().eq('id', board.id);
    if (deleteError) {
      console.error('Failed to delete expired whiteboard', deleteError);
    }

    const { error: createError } = await client.from('whiteboards').insert({
      couple_id: board.couple_id,
      expires_at: now.plus({ hours: 24 }).toISO(),
      opened_at: now.toISO(),
    });

    if (createError) {
      console.error('Failed to create new whiteboard', createError);
    } else {
      processed.push(board.id);
    }
  }

  return new Response(JSON.stringify({ processed }), {
    headers: { 'content-type': 'application/json' },
  });
});
