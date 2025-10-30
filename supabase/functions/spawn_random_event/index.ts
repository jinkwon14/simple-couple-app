import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { DateTime } from 'https://esm.sh/luxon@3.4.4';
import { getServiceClient } from '../_shared/supabaseClient.ts';

const client = getServiceClient();

const rarityWeight: Record<string, number> = {
  common: 5,
  rare: 3,
  ultra: 1,
};

const decorPool = [
  'decor.cozycabin.chair',
  'decor.cozycabin.rug',
  'decor.twilight.lantern',
  'decor.spring.wreath',
];

const pickWeighted = <T extends { weight: number }>(items: T[]) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    if (roll < item.weight) return item;
    roll -= item.weight;
  }
  return items[items.length - 1];
};

serve(async (req) => {
  const body = await req.json();
  const coupleId = body?.couple_id as string | undefined;
  const trigger = body?.trigger as string | undefined;

  if (!coupleId) {
    return new Response(JSON.stringify({ error: 'Missing couple_id' }), { status: 400 });
  }

  const since = DateTime.utc().minus({ hours: 24 }).toISO();
  const { data: recentEggs } = await client
    .from('events_log')
    .select('id')
    .eq('couple_id', coupleId)
    .eq('event_type', 'egg_drop')
    .gte('created_at', since ?? DateTime.utc().toISO());

  let dropChance = 0.05;
  if (recentEggs && recentEggs.length > 0) {
    dropChance = 0.02;
  }

  const roll = Math.random();

  if (roll < dropChance) {
    const { data: species } = await client.from('pet_species').select('id, name, rarity');
    if (!species?.length) {
      return new Response(JSON.stringify({ error: 'No species configured' }), { status: 500 });
    }

    const choice = pickWeighted(
      species.map((s) => ({ ...s, weight: rarityWeight[s.rarity] ?? 1 })),
    );

    const rarity = species.find((s) => s.id === choice.id)?.rarity ?? 'common';

    const { data: egg, error: eggError } = await client
      .from('eggs')
      .insert({
        couple_id: coupleId,
        species_hint: choice.id,
        rarity,
      })
      .select()
      .single();

    if (eggError) {
      return new Response(JSON.stringify({ error: eggError.message }), { status: 500 });
    }

    await client.from('events_log').insert({
      couple_id: coupleId,
      event_type: 'egg_drop',
      payload: { trigger, egg_id: egg.id, species_hint: choice.id },
    });

    return new Response(JSON.stringify({ type: 'egg_drop', egg }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  const decor = decorPool[Math.floor(Math.random() * decorPool.length)];
  const existing = await client
    .from('inventory_items')
    .select('id, qty')
    .eq('couple_id', coupleId)
    .eq('kind', decor)
    .maybeSingle();

  if (existing.data) {
    await client
      .from('inventory_items')
      .update({ qty: (existing.data.qty as number) + 1 })
      .eq('id', existing.data.id);
  } else {
    await client.from('inventory_items').insert({
      couple_id: coupleId,
      kind: decor,
      qty: 1,
    });
  }

  await client.from('events_log').insert({
    couple_id: coupleId,
    event_type: 'random_visit',
    payload: { trigger, reward: decor },
  });

  return new Response(JSON.stringify({ type: 'random_visit', reward: decor }), {
    headers: { 'content-type': 'application/json' },
  });
});
