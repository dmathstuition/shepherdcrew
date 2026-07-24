-- General Assessment — a ready-to-use, published foundational test.
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → paste this whole file → Run.
-- It attaches to your cohort automatically (the 'bfc-cohort-1' demo cohort if it
-- exists, otherwise your earliest cohort). If you have no cohort yet, create one
-- in /admin first, then run this. Re-running is a no-op (guarded by title).
--
-- After running, members of that cohort see "General Assessment" at /portal.
-- To move it to a different cohort later, edit its cohort_id in the Table Editor.

do $$
declare
  v_cohort uuid;
  v_assess uuid;
begin
  -- Pick a cohort: prefer the demo slug, else the earliest cohort.
  select id into v_cohort from public.cohorts where slug = 'bfc-cohort-1';
  if v_cohort is null then
    select id into v_cohort from public.cohorts order by created_at asc limit 1;
  end if;
  if v_cohort is null then
    raise exception 'No cohort found. Create a cohort in /admin first, then run this again.';
  end if;

  select id into v_assess
  from public.assessments
  where cohort_id = v_cohort and title = 'General Assessment';

  if v_assess is null then
    insert into public.assessments
      (cohort_id, title, week_number, duration_minutes, opens_at, closes_at, is_published)
    values
      (v_cohort, 'General Assessment', null, 30, now() - interval '1 hour', now() + interval '365 days', true)
    returning id into v_assess;

    insert into public.questions
      (assessment_id, stem, options, correct_option, explanation, topic, position)
    values
      (v_assess, 'How is a person saved?',
       '["By grace through faith in Jesus Christ","By keeping the law perfectly","By church membership","By good works alone"]'::jsonb,
       0, 'Ephesians 2:8-9 — by grace you have been saved through faith, not of works.', 'Salvation', 1),

      (v_assess, 'What best describes the new birth (being born again)?',
       '["A new job or social status","A spiritual rebirth that makes you a new creation","A financial breakthrough","Freedom from every trial"]'::jsonb,
       1, 'John 3:3-6; 2 Corinthians 5:17 — the born-again person is a new creation.', 'New birth', 2),

      (v_assess, 'Assurance of salvation rests on…',
       '["How you feel each day","God''s Word and the witness of the Holy Spirit","Never sinning again","Other people''s opinion of you"]'::jsonb,
       1, '1 John 5:13; Romans 8:16 — the Word and the Spirit assure us.', 'Assurance', 3),

      (v_assess, 'Repentance means…',
       '["Merely feeling guilty","A change of mind that turns from sin to God","Paying for your own past sins","Simply being religious"]'::jsonb,
       1, 'Repentance is a turning of the whole person from sin to God.', 'Repentance', 4),

      (v_assess, 'Who is the Holy Spirit?',
       '["An impersonal force","A created angel","God — the third Person of the Trinity, living in every believer","A gift only for the apostles"]'::jsonb,
       2, 'John 14:16-17 — the Spirit is God and indwells believers.', 'Holy Spirit', 5),

      (v_assess, 'Who is Jesus Christ?',
       '["A good teacher only","A prophet who never died","The eternal Son of God who became man, died, and rose again","A created angel"]'::jsonb,
       2, 'Jesus is fully God and fully man — His death and resurrection are central.', 'Christ', 6),

      (v_assess, 'The Bible is…',
       '["A book of human ideas","The inspired and infallible Word of God","Only partly true","Outdated for today"]'::jsonb,
       1, '2 Timothy 3:16 — all Scripture is God-breathed.', 'The Word', 7),

      (v_assess, 'A healthy prayer life is best described as…',
       '["A last resort only in trouble","Consistent, relational communication with God","Repeating memorised words","Something only leaders do"]'::jsonb,
       1, 'Prayer is ongoing relationship and communion with God.', 'Prayer', 8),

      (v_assess, 'Why do believers fast?',
       '["To earn salvation","To force God to act","To humble themselves and seek God more intently","As a diet plan"]'::jsonb,
       2, 'Fasting humbles us and sharpens our pursuit of God — it does not earn salvation.', 'Fasting', 9),

      (v_assess, 'Worship is fundamentally…',
       '["Only singing songs","Giving God reverence and adoration in spirit and truth","Something for Sundays only","Entertainment"]'::jsonb,
       1, 'John 4:24 — God seeks worship in spirit and in truth.', 'Worship', 10),

      (v_assess, 'What does dominion in Christ mean?',
       '["Controlling other people","Reigning in life through Christ''s victory over sin","Seeking earthly political power","Achieving sinless perfection by effort"]'::jsonb,
       1, 'Romans 5:17 — we reign in life through the one, Jesus Christ.', 'Dominion', 11),

      (v_assess, 'Your identity in Christ is based on…',
       '["Your job title","Your achievements","What Christ has done and who God says you are","Other people''s approval"]'::jsonb,
       2, 'Identity rests on Christ''s finished work, not performance.', 'Identity', 12),

      (v_assess, 'Water baptism is…',
       '["What saves you","An outward sign of your union with Christ","Optional and meaningless","Only for leaders"]'::jsonb,
       1, 'Romans 6:3-4 — baptism testifies to union with Christ in death and resurrection.', 'Baptism', 13),

      (v_assess, 'The Great Commission calls every believer to…',
       '["Stay comfortable","Make disciples of all nations","Judge unbelievers","Build big buildings"]'::jsonb,
       1, 'Matthew 28:19-20 — go and make disciples of all nations.', 'Calling', 14),

      (v_assess, '"Mountains of influence" refers to…',
       '["Literal mountains to climb","Key spheres of society believers are called to impact","Obstacles to avoid","A worship song"]'::jsonb,
       1, 'Spheres like family, church, education, government, media, arts, and business.', 'Influence', 15);

    raise notice 'General Assessment created on cohort % with 15 questions.', v_cohort;
  else
    raise notice 'General Assessment already exists on cohort %.', v_cohort;
  end if;
end $$;
