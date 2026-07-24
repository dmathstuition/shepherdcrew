# Class portal — architecture notes

Not built yet. This is the plan the landing pages assume, written down so the next
session doesn't restart from a blank page.

## The decision that shapes everything else: no passwords

Members join via Telegram. They are teenagers and young adults on mobile data. If you
ship email-and-password auth, the dominant support ticket for the entire cohort will be
"I can't log in" — and coordinators will spend the class handling resets instead of teaching.

Use **admin-issued access codes** instead — the tokenised-link pattern already used on the
WPA portal:

- Admin adds a member; the system generates a short code (e.g. `BFC-7K4Q-2M`).
- The member enters name + code once. A signed, httpOnly session cookie lasts the cohort.
- Codes are single-cohort and revocable. A leaked code is a small blast radius.

Admins are the only accounts that need real credentials — a handful of people, email plus
password plus TOTP is fine there.

## Do not start a new repository

There is already a Next.js / Prisma / PostgreSQL CBT portal from the IJA work with schema
and seed data done and API routes unfinished. The BFC portal is the same product with a
different tenant. Add an `organisation` (or `cohort`) column and finish the API routes.
Standing up a fourth parallel portal is how all three of the existing ones ended up half-done.

## Data model sketch

```
Organisation  id, name, slug
Cohort        id, organisationId, name, startsOn, endsOn
Member        id, cohortId, fullName, phone, accessCodeHash, joinedAt
Admin         id, email, passwordHash, totpSecret, role
Assessment    id, cohortId, title, weekNumber, opensAt, closesAt, durationMinutes
Question      id, assessmentId, stem, type, options[], correctOption, explanation, topic
Attempt       id, memberId, assessmentId, startedAt, submittedAt, score
Answer        id, attemptId, questionId, chosenOption, isCorrect, answeredAt
```

`Question.topic` is the field that makes the analytics worth having — it lets you see that
week two's prayer teaching landed and the Holy Spirit teaching didn't. Without it you only
get scores, which tell you nothing you can act on.

## On "highly secured"

Be honest about the threat model. Members sit alone with their phones at 10 PM. Nothing in
the browser stops a second tab. Tab-blur detection, disabled right-click, and copy-paste
locks cost real development time and are trivially defeated; they also punish honest users
whose phone rings mid-question.

What genuinely matters, and is worth building:

- **Server-side scoring only.** Never send correct answers to the client. This is the one
  non-negotiable — most homemade CBT portals leak the answer key in the JSON payload.
- **Server-side timing.** `startedAt` on the server; ignore any client-reported duration.
- **One attempt per member per assessment**, enforced by a unique DB constraint, not UI state.
- **Question shuffling per attempt**, mainly so screenshots circulate less usefully.
- **Rate limiting and audit logging** on the admin routes.
- **Autosave each answer as it's chosen**, so a dropped connection doesn't lose the attempt.
  On Nigerian mobile data this matters far more than anti-cheating.

If you later run something certificated, add live proctoring then. For a discipleship class,
optimise for diagnosis, not invigilation.

## Admin surface, in build order

1. Add members, generate and print/send codes.
2. Create assessment, add questions manually.
3. Bulk import questions (CSV, and the LaTeX-capable format already used for IJA).
4. Results table: per member, per assessment.
5. Topic analytics: percentage correct by `Question.topic` across the cohort. **This is the
   feature the whole portal exists for.** Build it before question editing, not after.
6. Question editing and versioning.

Ship 1–4 for cohort one. Adding features to a portal nobody has used yet is how the previous
three stalled.
