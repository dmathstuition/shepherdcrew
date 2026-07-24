# Admin guide — the class portal

How to create an admin login and run the CBT portal end to end.

---

## 1. Prerequisites (one-time)

The admin lives at `/admin` and is backed by Supabase. Before an admin can sign
in you need:

1. A Supabase project.
2. The two migrations applied (Supabase dashboard → **SQL Editor**, paste and run
   each file in `supabase/migrations/`), which create the `admins`,
   `registrations`, `cohorts`, `members`, `assessments`, `questions`,
   `attempts`, and `answers` tables.
3. Three environment variables set wherever the site runs (locally in `.env`,
   in production in your host's project settings — e.g. Vercel → Settings →
   Environment Variables):

   | Variable | Where to find it |
   | --- | --- |
   | `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret |
   | `PORTAL_SESSION_SECRET` | Any long random string (≥ 32 chars). Generate one with the command below. |

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   > Keep `PORTAL_SESSION_SECRET` stable. Changing it signs everyone out **and**
   > invalidates every member access code.

---

## 2. Create your admin login — from the browser (no terminal)

Admin accounts are email + password. There is no public sign-up (by design). You
create the **first** admin from a one-time setup page, then add any further
admins from the dashboard. No command line needed.

### First admin (do this once)

1. In your host, add one more environment variable and redeploy:
   - **Vercel:** Project → Settings → Environment Variables → add
     `ADMIN_SETUP_TOKEN` = any long random string (e.g. mash the keyboard, or
     paste a UUID). Then Deployments → redeploy so the new variable takes effect.
2. Go to **`https://<your-site>/admin/setup`**.
3. Enter your email, a password (≥ 8 characters), and the **same
   `ADMIN_SETUP_TOKEN`** value you set in step 1.
4. Submit — you're created and signed in as the first admin.
5. (Optional) Back in Vercel, delete the `ADMIN_SETUP_TOKEN` variable. The setup
   page has already closed itself now that an admin exists.

The password is **scrypt-hashed** before storage — the plain password is never
saved. `/admin/setup` only works while there are zero admins *and* the token
matches, so it can't be used to create rogue accounts later.

### Adding more admins

Once signed in, open the dashboard's **Admins** section, enter an email and
password, and click **Add admin**. Remove an admin with **Remove** (you can't
remove yourself or the last remaining admin). No token or terminal needed.

### Alternative: the terminal (only if you have one)

If you do have a local machine with Node, you can instead run:

```bash
SUPABASE_URL="https://YOURPROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  node scripts/seed-admin.mjs admin@theshepherdscrew.org 'a-strong-password'
```

Re-running it with an existing email resets that admin's password.

---

## 3. Sign in

Go to **`/admin/login`**, enter the email and password, and you land on the
dashboard. Sessions last 12 hours; use **Sign out** (top-right) when done.

If you're not signed in, every `/admin` page bounces you back to the login.

---

## 4. Run the portal

### Cohorts
On the dashboard, create a cohort (e.g. "BFC Cohort 1.0"). Switch between cohorts
with the chips at the top — everything below (members, assessments) is scoped to
the selected cohort.

### Members & access codes
Under **Members**, enter a name (and optional phone), pick the cohort and a code
prefix (e.g. `BFC`), then **Create member & issue code**. A one-time access code
like `BFC-7K4Q-2M` appears — **copy it and give it to the member; it is shown
only once** (you can't see it again, only reset by re-creating the member).

Members log in at `/portal` with their **name + code** — no passwords.

Use **Revoke** to block a member's access, **Restore** to re-enable it.

### Assessments
Under **Assessments**, create one (title, cohort, week number, duration, optional
close time). You'll be taken to its page. New assessments start as **draft** —
members can't see them until you **Publish**.

On the assessment page you can:

- **Edit settings** — change the title, week number, or duration.
- **Publish / Unpublish** — control member visibility.
- **Add a question** — write the stem, up to four options, select the correct one
  with the radio, and add a **topic** (this drives the analytics) and an optional
  explanation shown on the result page.
- **Edit** any existing question — change wording, options, the correct answer,
  topic, or explanation.
- **Delete** a question.

### Results & analytics
Each assessment page shows:

- **Topic analytics** — percentage correct per topic across all submitted
  attempts, so you can see which foundations landed and which need another pass.
- **Results** — every member's score and submission time, plus the cohort
  average.

---

## 5. Security notes

- Correct answers and explanations are never sent to the exam browser; scoring
  and timing happen entirely on the server.
- One attempt per member per assessment is enforced by the database.
- Admin routes are gated by middleware and re-checked on every action.
- The `service_role` key and `PORTAL_SESSION_SECRET` are server-only secrets —
  never put them in client code or commit them to git.
