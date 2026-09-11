# AOWAP 2026 registration — Google Apps Script setup

The AOWAP registration page (`/aowap`) sends each submission to a **Google Apps
Script Web App** that you own. That script does two things:

1. **Records** the registration as a new row in a Google Sheet.
2. **Emails** the registrant an acknowledgement immediately.

The website never talks to Google directly from the browser — it forwards the
submission from its own server to your script's URL — so there are no CORS
problems and your script URL stays private.

You only have to do this **once**. It takes about 10 minutes and needs no
coding.

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.google.com> and create a **blank spreadsheet**.
2. Name it something like **“AOWAP 2026 Registrations”**.
3. Leave it empty — the script writes the header row for you on the first
   registration.

## Step 2 — Add the script

1. In that spreadsheet, open **Extensions → Apps Script**. A code editor opens.
2. Delete whatever is in `Code.gs` and paste **all** of the code below.
3. In the `CONFIG` block at the top, set:
   - `ADMIN_EMAIL` — where you want a copy of every registration (optional; set
     to `""` to turn off admin copies).
   - `SHEET_NAME` — leave as `"Registrations"` unless you renamed the tab.
4. Click the **Save** icon (💾).

```javascript
// ===== AOWAP 2026 registration handler =====
var CONFIG = {
  SHEET_NAME: "Registrations",
  ADMIN_EMAIL: "dmathstuition@gmail.com", // set "" to disable admin copies
  EVENT_NAME: "AOWAP 2026",
  EVENT_DATE: "20th November 2026",
  EVENT_VENUE: "Epe, Lagos State",
  EVENT_TIME: "8:00 PM",
};

var HEADERS = [
  "Timestamp", "First Name", "Last Name", "Email", "Phone", "Gender",
  "City", "Denomination/Fellowship", "Occupation", "Age Range",
  "Attended Before", "Expectations", "IP",
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // avoid two writes clobbering each other

    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      data.phone || "",
      data.gender || "",
      data.city || "",
      data.denomination || "",
      data.occupation || "",
      data.ageRange || "",
      data.attendedBefore || "",
      data.expectations || "",
      data.ip || "",
    ]);

    sendConfirmation(data);
    if (CONFIG.ADMIN_EMAIL) sendAdminCopy(data);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return json({ ok: true, status: "AOWAP registration endpoint is live." });
}

function sendConfirmation(data) {
  if (!data.email) return;
  var name = (data.firstName || "there").toString();
  var subject = "You're registered for " + CONFIG.EVENT_NAME + " 🎉";

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;' +
    'border:1px solid #eee;border-radius:12px;overflow:hidden">' +
    '<div style="background:#0b1220;color:#fff;padding:24px 28px">' +
    '<div style="color:#c6a24c;letter-spacing:2px;font-size:12px;font-weight:bold">THE SHEPHERD\'S CREW</div>' +
    '<div style="font-size:22px;font-weight:bold;margin-top:6px">Atmosphere of Worship &amp; Praise 2026</div>' +
    "</div>" +
    '<div style="padding:28px">' +
    "<p>Hi " + escapeHtml(name) + ",</p>" +
    "<p>Your registration for <strong>" + CONFIG.EVENT_NAME + "</strong> has been received. " +
    "We can't wait to have you be a part of this prophetic encounter!</p>" +
    '<table style="margin:18px 0;border-collapse:collapse">' +
    row("Date", CONFIG.EVENT_DATE) +
    row("Red carpet", CONFIG.EVENT_TIME) +
    row("Venue", CONFIG.EVENT_VENUE) +
    "</table>" +
    "<p>Come expectant. Come thirsty. Come ready to worship.</p>" +
    '<p style="margin-top:24px;color:#666">With love,<br>The Shepherd\'s Crew</p>' +
    "</div></div>";

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: html,
    name: "The Shepherd's Crew",
  });
}

function sendAdminCopy(data) {
  var body =
    "New AOWAP 2026 registration:\n\n" +
    "Name: " + (data.firstName || "") + " " + (data.lastName || "") + "\n" +
    "Email: " + (data.email || "") + "\n" +
    "Phone: " + (data.phone || "") + "\n" +
    "Gender: " + (data.gender || "") + "\n" +
    "City: " + (data.city || "") + "\n" +
    "Denomination/Fellowship: " + (data.denomination || "") + "\n" +
    "Occupation: " + (data.occupation || "") + "\n" +
    "Age Range: " + (data.ageRange || "") + "\n" +
    "Attended Before: " + (data.attendedBefore || "") + "\n" +
    "Expectations: " + (data.expectations || "") + "\n";
  MailApp.sendEmail(CONFIG.ADMIN_EMAIL, "New AOWAP 2026 registration", body);
}

function row(label, value) {
  return (
    '<tr><td style="padding:4px 16px 4px 0;color:#888">' + label + "</td>" +
    '<td style="padding:4px 0;font-weight:bold">' + escapeHtml(value) + "</td></tr>"
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

## Step 3 — Deploy it as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear ⚙️ next to “Select type” and choose **Web app**.
3. Fill in:
   - **Description:** `AOWAP 2026 registration`
   - **Execute as:** **Me** (your Google account — this lets it send email and
     write the sheet).
   - **Who has access:** **Anyone**.
     > This does **not** make your sheet public. It only means the website's
     > server is allowed to POST registrations to the script. No one can read
     > your data through this URL.
4. Click **Deploy**.
5. Google will ask you to **authorize** — click through, choose your account,
   and on the “Google hasn’t verified this app” screen click **Advanced →
   Go to (project name) → Allow**. (This is normal for your own scripts.)
6. Copy the **Web app URL**. It ends in `/exec` and looks like:
   `https://script.google.com/macros/s/AKfycb................/exec`

**Quick check:** paste that `/exec` URL into a browser. You should see
`{"ok":true,"status":"AOWAP registration endpoint is live."}`.

## Step 4 — Tell the website about it (on Vercel)

1. Open your project on **Vercel → Settings → Environment Variables**.
2. Add a new variable:
   - **Name:** `AOWAP_APPS_SCRIPT_URL`
   - **Value:** the `/exec` URL you copied.
   - **Environments:** Production (and Preview, if you use previews).
3. Click **Save**, then **redeploy** the site (Deployments → ⋯ → Redeploy) so
   the new variable takes effect.

That’s it. Visit `/aowap`, submit a test registration, and you should see:

- a new row in your Google Sheet,
- a confirmation email in the test inbox,
- (if you set `ADMIN_EMAIL`) a copy in your admin inbox.

---

## Updating the script later

If you change the `Code.gs`, you must **re-deploy** for the change to go live:
**Deploy → Manage deployments → (pencil ✏️) → Version: New version → Deploy**.
Editing the “New version” of the **existing** deployment keeps the **same URL**,
so you don’t need to touch Vercel again. (Creating a brand-new deployment gives
a new URL — if you do that, update `AOWAP_APPS_SCRIPT_URL` on Vercel.)

## Notes & limits

- **Sending limit:** a normal Gmail account can send ~100 emails/day via Apps
  Script (Google Workspace accounts get ~1,500). That's plenty for
  registrations; if you expect a very large spike, spread signups over days or
  use a Workspace account.
- **Emails landing in spam:** the confirmation is sent from your Gmail address,
  so it's generally trusted. Ask registrants to check spam once and mark it
  “Not spam.”
- **Where the data lives:** only in your Google Sheet and your inbox. The
  website does not store AOWAP registrations in Supabase.
