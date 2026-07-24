-- Optional demo data so you can take a real exam the moment the portal is
-- wired up. Safe to run once on a fresh project; re-running is a no-op because
-- of the slug/title guards. Delete this data before your real cohort.
--
-- This seeds a cohort, a published assessment, and its questions. It does NOT
-- create a member — access codes are hashed with your PORTAL_SESSION_SECRET,
-- so run `node scripts/seed-portal-demo.mjs` after setting the env to mint a
-- demo member and print a working access code.

do $$
declare
  v_cohort uuid;
  v_assessment uuid;
begin
  -- Cohort
  select id into v_cohort from public.cohorts where slug = 'bfc-cohort-1';
  if v_cohort is null then
    insert into public.cohorts (name, slug, starts_on)
    values ('BFC Cohort 1.0', 'bfc-cohort-1', current_date)
    returning id into v_cohort;
  end if;

  -- Assessment
  select id into v_assessment
  from public.assessments
  where cohort_id = v_cohort and title = 'Week One — Salvation & Assurance';
  if v_assessment is null then
    insert into public.assessments
      (cohort_id, title, week_number, duration_minutes, opens_at, closes_at, is_published)
    values
      (v_cohort, 'Week One — Salvation & Assurance', 1, 15,
       now() - interval '1 hour', now() + interval '365 days', true)
    returning id into v_assessment;

    insert into public.questions
      (assessment_id, stem, options, correct_option, explanation, topic, position)
    values
      (v_assessment,
       'Salvation is received by…',
       '["Grace through faith in Jesus Christ","Keeping the law perfectly","Church membership","Good works alone"]'::jsonb,
       0, 'Ephesians 2:8-9 — by grace you have been saved through faith, not of works.',
       'Salvation', 1),
      (v_assessment,
       'The new birth primarily results in…',
       '["A new social status","A regenerated spirit and new life in Christ","Financial breakthrough","Freedom from all trials"]'::jsonb,
       1, 'John 3:3-6 — being born again is a spiritual rebirth.',
       'New birth', 2),
      (v_assessment,
       'Assurance of salvation rests on…',
       '["How we feel each day","God''s Word and the witness of the Spirit","Never sinning again","Others'' opinion of us"]'::jsonb,
       1, '1 John 5:13 and Romans 8:16 — the Word and the Spirit assure us.',
       'Assurance', 3),
      (v_assessment,
       'Repentance means…',
       '["Feeling guilty only","A change of mind that turns from sin to God","Paying for past sins","Being religious"]'::jsonb,
       1, 'Repentance is a turning of the whole person from sin to God.',
       'Repentance', 4),
      (v_assessment,
       'Water baptism is best described as…',
       '["What saves us","An outward sign of an inward reality","Optional and meaningless","Only for leaders"]'::jsonb,
       1, 'Baptism is an outward testimony of union with Christ (Romans 6:3-4).',
       'Baptism', 5);
  end if;
end $$;
