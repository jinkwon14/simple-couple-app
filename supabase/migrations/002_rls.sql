-- Enable row level security on all tables
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.questions enable row level security;
alter table public.daily_questions enable row level security;
alter table public.answers enable row level security;
alter table public.whiteboards enable row level security;
alter table public.strokes enable row level security;
alter table public.whiteboard_archive enable row level security;
alter table public.garden_plots enable row level security;
alter table public.pet_species enable row level security;
alter table public.pet_instances enable row level security;
alter table public.eggs enable row level security;
alter table public.inventory_items enable row level security;
alter table public.missions enable row level security;
alter table public.couple_missions enable row level security;
alter table public.events_log enable row level security;

create view public.v_couple_membership as
  select cm.couple_id, cm.user_id
  from public.couple_members cm;

grant select on public.v_couple_membership to authenticated;

grant usage on schema public to anon, authenticated;

grant select on all sequences in schema public to authenticated;

grant select on public.pet_species to anon;

grant select on public.questions to anon;

-- Profiles policies
create policy "profiles_self_select"
  on public.profiles for select
  using (
    auth.uid() = profiles.user_id
    or exists (
      select 1 from public.v_couple_membership m
      where m.user_id = auth.uid()
        and m.couple_id in (
          select couple_id from public.couple_members cm where cm.user_id = profiles.user_id
        )
    )
  );

create policy "profiles_self_upsert"
  on public.profiles for all
  using (auth.uid() = profiles.user_id)
  with check (auth.uid() = profiles.user_id);

-- Couples policies
create policy "couples_read_members"
  on public.couples for select
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couples.id and m.user_id = auth.uid()
    )
  );

create policy "couples_insert_authenticated"
  on public.couples for insert
  with check (auth.role() = 'authenticated');

-- Couple members policies
create policy "couple_members_read"
  on public.couple_members for select
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couple_members.couple_id and m.user_id = auth.uid()
    )
  );

create policy "couple_members_manage"
  on public.couple_members for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couple_members.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couple_members.couple_id and m.user_id = auth.uid()
    )
  );

-- Questions are public for read
create policy "questions_public_read"
  on public.questions for select
  using (true);

create policy "questions_service_write"
  on public.questions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Daily questions
create policy "daily_questions_couple"
  on public.daily_questions for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = daily_questions.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = daily_questions.couple_id and m.user_id = auth.uid()
    )
  );

-- Answers
create policy "answers_couple"
  on public.answers for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.user_id = auth.uid()
        and m.couple_id in (
          select dq.couple_id from public.daily_questions dq where dq.id = answers.daily_question_id
        )
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.user_id = auth.uid()
        and m.couple_id in (
          select dq.couple_id from public.daily_questions dq where dq.id = answers.daily_question_id
        )
    )
  );

-- Whiteboards
create policy "wb_read_own_couple"
  on public.whiteboards for select
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = whiteboards.couple_id and m.user_id = auth.uid()
    )
  );

create policy "wb_write_own_couple"
  on public.whiteboards for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = whiteboards.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = whiteboards.couple_id and m.user_id = auth.uid()
    )
  );

-- Strokes policies
create policy "strokes_couple"
  on public.strokes for all
  using (
    exists (
      select 1 from public.whiteboards wb
      join public.v_couple_membership m on m.couple_id = wb.couple_id
      where wb.id = strokes.whiteboard_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.whiteboards wb
      join public.v_couple_membership m on m.couple_id = wb.couple_id
      where wb.id = strokes.whiteboard_id and m.user_id = auth.uid()
    )
  );

-- Whiteboard archive
create policy "wb_archive_couple"
  on public.whiteboard_archive for select
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = whiteboard_archive.couple_id and m.user_id = auth.uid()
    )
  );

-- Garden plots
create policy "garden_plots_couple"
  on public.garden_plots for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = garden_plots.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = garden_plots.couple_id and m.user_id = auth.uid()
    )
  );

-- Pet species (read only)
create policy "pet_species_public"
  on public.pet_species for select
  using (true);

create policy "pet_species_service_write"
  on public.pet_species for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Pet instances
create policy "pet_instances_couple"
  on public.pet_instances for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = pet_instances.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = pet_instances.couple_id and m.user_id = auth.uid()
    )
  );

-- Eggs
create policy "eggs_couple"
  on public.eggs for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = eggs.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = eggs.couple_id and m.user_id = auth.uid()
    )
  );

-- Inventory items
create policy "inventory_couple"
  on public.inventory_items for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = inventory_items.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = inventory_items.couple_id and m.user_id = auth.uid()
    )
  );

-- Missions definitions
create policy "missions_public_read"
  on public.missions for select
  using (true);

create policy "missions_service_write"
  on public.missions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Couple missions
create policy "couple_missions_couple"
  on public.couple_missions for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couple_missions.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = couple_missions.couple_id and m.user_id = auth.uid()
    )
  );

-- Events log
create policy "events_log_couple"
  on public.events_log for all
  using (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = events_log.couple_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_couple_membership m
      where m.couple_id = events_log.couple_id and m.user_id = auth.uid()
    )
  );
