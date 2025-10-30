-- Seed sample couple and users for local testing
-- Creates two confirmed email/password users with associated couple data

-- make script idempotent to avoid duplicate inserts when rerun
DO $$
DECLARE
  sample_user_1 uuid := '6c23f10c-1b63-4d0e-8d6f-bc88bb0d5852';
  sample_user_2 uuid := 'f054f3c8-9725-4da6-93a0-7db0f2547318';
  sample_identity_1 uuid := '8a9b52f2-2fde-4a2a-9b69-28f65fa4f069';
  sample_identity_2 uuid := 'c4be2cf7-02f8-48eb-a0e8-e9a6d8f1d6d3';
  sample_couple uuid := '2f47a8b2-3b97-4dbe-9d06-8a0a99c98f24';
  sample_daily_question bigint;
  mission_water_id smallint;
  mission_checkin_id smallint;
  mission_refresh_id smallint;
  pet_species_id smallint;
  sample_pet uuid := 'a4bbfb0b-9db8-4c47-9b0a-9c7de63f2a61';
  sample_whiteboard uuid := '9f1a0c6a-9c23-4c15-a145-0017c1a1f26c';
BEGIN
  -- Create email/password users if missing
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = sample_user_1) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      sample_user_1,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'amy@example.com',
      crypt('lovelygarden', gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Amy"}'::jsonb,
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = sample_user_2) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      sample_user_2,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'ben@example.com',
      crypt('lovelygarden', gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Ben"}'::jsonb,
      now(),
      now()
    );
  END IF;

  -- Ensure matching identities exist
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE id = sample_identity_1) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      sample_identity_1,
      sample_user_1,
      'email',
      json_build_object('sub', sample_user_1::text, 'email', 'amy@example.com'),
      now(),
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE id = sample_identity_2) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      sample_identity_2,
      sample_user_2,
      'email',
      json_build_object('sub', sample_user_2::text, 'email', 'ben@example.com'),
      now(),
      now(),
      now()
    );
  END IF;

  -- Create couple profile and membership
  INSERT INTO public.couples (id, created_at)
  VALUES (sample_couple, now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (user_id, display_name, tz)
  VALUES
    (sample_user_1, 'Amy', 'America/Los_Angeles'),
    (sample_user_2, 'Ben', 'America/New_York')
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    tz = EXCLUDED.tz;

  INSERT INTO public.couple_members (couple_id, user_id, role)
  VALUES
    (sample_couple, sample_user_1, 'member'),
    (sample_couple, sample_user_2, 'member')
  ON CONFLICT (couple_id, user_id) DO NOTHING;

  -- Daily check-in question for today
  SELECT id INTO sample_daily_question
  FROM public.daily_questions
  WHERE couple_id = sample_couple AND assigned_for_date = current_date;

  IF sample_daily_question IS NULL THEN
    WITH pick AS (
      SELECT id FROM public.questions ORDER BY id LIMIT 1
    )
    INSERT INTO public.daily_questions (couple_id, question_id, assigned_for_date, assigned_at)
    SELECT sample_couple, pick.id, current_date, now()
    FROM pick
    RETURNING id INTO sample_daily_question;
  END IF;

  IF sample_daily_question IS NOT NULL THEN
    INSERT INTO public.answers (daily_question_id, user_id, answer_text, mood, created_at)
    VALUES
      (sample_daily_question, sample_user_1, 'I loved our morning walk together.', 'happy', now() - INTERVAL '2 hours'),
      (sample_daily_question, sample_user_2, 'Cooking breakfast as a team felt amazing.', 'calm', now() - INTERVAL '1 hour')
    ON CONFLICT (daily_question_id, user_id) DO UPDATE SET
      answer_text = EXCLUDED.answer_text,
      mood = EXCLUDED.mood,
      created_at = EXCLUDED.created_at;
  END IF;

  -- Garden plots for the couple
  INSERT INTO public.garden_plots (couple_id, plot_index, seed_type, planted_at, watered_at, stage)
  VALUES
    (sample_couple, 0, 'seed.sunflower', now() - INTERVAL '3 days', now() - INTERVAL '1 days', 'mature'),
    (sample_couple, 1, 'seed.lavender', now() - INTERVAL '1 days', now(), 'sprout'),
    (sample_couple, 2, NULL, NULL, NULL, NULL),
    (sample_couple, 3, 'seed.tulip', now(), NULL, 'seed')
  ON CONFLICT (couple_id, plot_index) DO UPDATE SET
    seed_type = EXCLUDED.seed_type,
    planted_at = EXCLUDED.planted_at,
    watered_at = EXCLUDED.watered_at,
    stage = EXCLUDED.stage;

  -- Pet companion setup
  SELECT id INTO pet_species_id FROM public.pet_species WHERE name = 'Lumen Fox' LIMIT 1;
  IF pet_species_id IS NOT NULL THEN
    INSERT INTO public.pet_instances (id, couple_id, species_id, nickname, stage, hunger, energy, happiness, last_interaction_at, created_at)
    VALUES (
      sample_pet,
      sample_couple,
      pet_species_id,
      'Nova',
      'baby',
      82,
      76,
      88,
      now() - INTERVAL '3 hours',
      now() - INTERVAL '7 days'
    )
    ON CONFLICT (id) DO UPDATE SET
      species_id = EXCLUDED.species_id,
      nickname = EXCLUDED.nickname,
      stage = EXCLUDED.stage,
      hunger = EXCLUDED.hunger,
      energy = EXCLUDED.energy,
      happiness = EXCLUDED.happiness,
      last_interaction_at = EXCLUDED.last_interaction_at;
  END IF;

  INSERT INTO public.eggs (id, couple_id, species_hint, rarity, discovered_at, hatch_progress)
  SELECT
    gen_random_uuid(),
    sample_couple,
    pet_species_id,
    'rare',
    now() - INTERVAL '5 days',
    45
  WHERE NOT EXISTS (
    SELECT 1 FROM public.eggs WHERE couple_id = sample_couple
  );

  -- Inventory starter items
  INSERT INTO public.inventory_items (couple_id, kind, qty)
  VALUES
    (sample_couple, 'seed.sunflower', 3),
    (sample_couple, 'seed.lavender', 2),
    (sample_couple, 'treat.basic', 5)
  ON CONFLICT (couple_id, kind) DO UPDATE SET
    qty = EXCLUDED.qty;

  -- Missions in flight
  SELECT id INTO mission_water_id FROM public.missions WHERE code = 'D_WATER_3' LIMIT 1;
  SELECT id INTO mission_checkin_id FROM public.missions WHERE code = 'D_CHECKIN_2' LIMIT 1;
  SELECT id INTO mission_refresh_id FROM public.missions WHERE code = 'W_GARDEN_REFRESH' LIMIT 1;

  IF mission_water_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.couple_missions
    WHERE couple_id = sample_couple
      AND mission_id = mission_water_id
      AND window_start = date_trunc('day', now())
  ) THEN
    INSERT INTO public.couple_missions (couple_id, mission_id, window_start, window_end, progress, status)
    VALUES (
      sample_couple,
      mission_water_id,
      date_trunc('day', now()),
      date_trunc('day', now()) + INTERVAL '1 day',
      '{"count": 1}'::jsonb,
      'active'
    );
  END IF;

  IF mission_checkin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.couple_missions
    WHERE couple_id = sample_couple
      AND mission_id = mission_checkin_id
      AND window_start = date_trunc('day', now())
  ) THEN
    INSERT INTO public.couple_missions (couple_id, mission_id, window_start, window_end, progress, status)
    VALUES (
      sample_couple,
      mission_checkin_id,
      date_trunc('day', now()),
      date_trunc('day', now()) + INTERVAL '1 day',
      '{"count": 2}'::jsonb,
      'completed'
    );
  END IF;

  IF mission_refresh_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.couple_missions
    WHERE couple_id = sample_couple
      AND mission_id = mission_refresh_id
      AND window_start = date_trunc('week', now())
  ) THEN
    INSERT INTO public.couple_missions (couple_id, mission_id, window_start, window_end, progress, status)
    VALUES (
      sample_couple,
      mission_refresh_id,
      date_trunc('week', now()),
      date_trunc('week', now()) + INTERVAL '7 days',
      '{"count": 6}'::jsonb,
      'claimed'
    );
  END IF;

  -- Whiteboard session and sample strokes
  INSERT INTO public.whiteboards (id, couple_id, opened_at, expires_at)
  VALUES (
    sample_whiteboard,
    sample_couple,
    now() - INTERVAL '30 minutes',
    now() + INTERVAL '11 hours'
  )
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (
    SELECT 1 FROM public.strokes
    WHERE whiteboard_id = sample_whiteboard AND user_id = sample_user_1
  ) THEN
    INSERT INTO public.strokes (whiteboard_id, user_id, tool, color, width, path, created_at)
    VALUES (
      sample_whiteboard,
      sample_user_1,
      'pen',
      '#F97316',
      4,
      '{"points":[[12,24],[48,60],[90,96]]}'::jsonb,
      now() - INTERVAL '20 minutes'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.strokes
    WHERE whiteboard_id = sample_whiteboard AND user_id = sample_user_2
  ) THEN
    INSERT INTO public.strokes (whiteboard_id, user_id, tool, color, width, path, created_at)
    VALUES (
      sample_whiteboard,
      sample_user_2,
      'pen',
      '#38BDF8',
      3,
      '{"points":[[20,18],[54,72],[100,120]]}'::jsonb,
      now() - INTERVAL '18 minutes'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.whiteboard_archive
    WHERE couple_id = sample_couple AND image_url = 'https://example.com/whiteboards/sample.png'
  ) THEN
    INSERT INTO public.whiteboard_archive (couple_id, opened_at, closed_at, image_url)
    VALUES (
      sample_couple,
      now() - INTERVAL '9 days',
      now() - INTERVAL '9 days' + INTERVAL '1 hour',
      'https://example.com/whiteboards/sample.png'
    );
  END IF;

  -- Event log snapshot
  IF NOT EXISTS (
    SELECT 1 FROM public.events_log
    WHERE couple_id = sample_couple AND event_type = 'mission_completed'
  ) THEN
    INSERT INTO public.events_log (couple_id, event_type, payload, created_at)
    VALUES (
      sample_couple,
      'mission_completed',
      json_build_object('mission', 'D_CHECKIN_2'),
      now() - INTERVAL '1 day'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.events_log
    WHERE couple_id = sample_couple AND event_type = 'pet_fed'
  ) THEN
    INSERT INTO public.events_log (couple_id, event_type, payload, created_at)
    VALUES (
      sample_couple,
      'pet_fed',
      json_build_object('pet', 'Nova'),
      now() - INTERVAL '3 hours'
    );
  END IF;
END
$$;
