import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { currentAdmin } from "@/lib/current-admin";
import { getAssessmentBasic, getResults, getTopicAnalytics, listQuestions } from "@/lib/admin";
import { getCohortName, PASS_PCT } from "@/lib/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Brand colours (Deep Navy + Gold), plus the pass/fail tones used on-screen.
const NAVY = rgb(0.09, 0.13, 0.24);
const GOLD = rgb(0.78, 0.63, 0.3);
const INK = rgb(0.13, 0.15, 0.2);
const MUTED = rgb(0.42, 0.45, 0.52);
const LINE = rgb(0.85, 0.86, 0.89);
const GREEN = rgb(0.13, 0.62, 0.42);
const RED = rgb(0.79, 0.28, 0.24);

const PAGE_W = 595.28; // A4 portrait
const PAGE_H = 841.89;
const MARGIN = 48;
const BOTTOM = 56;

/** Percent for a result row, using the question count as a fallback total. */
function pctOf(score: number | null, total: number | null, fallbackTotal: number): number | null {
  if (score == null) return null;
  const t = total || fallbackTotal;
  if (!t) return 0;
  return Math.round((score / t) * 100);
}

function safeFilename(title: string): string {
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "assessment"}-report.pdf`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await currentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const assessment = await getAssessmentBasic(params.id);
  if (!assessment) return new Response("Not found", { status: 404 });

  const [results, analytics, questions, cohortName] = await Promise.all([
    getResults(params.id),
    getTopicAnalytics(params.id),
    listQuestions(params.id),
    getCohortName(assessment.cohort_id),
  ]);

  const questionCount = questions.length;
  const submitted = results.filter((r) => r.submittedAt);
  const totalScore = submitted.reduce((s, r) => s + (r.score ?? 0), 0);
  const totalPossible = submitted.reduce((s, r) => s + (r.total || questionCount || 1), 0);
  const avg = submitted.length > 0 ? Math.round((totalScore / totalPossible) * 100) : null;
  const passed = submitted.filter((r) => (pctOf(r.score, r.total, questionCount) ?? 0) >= PASS_PCT).length;
  const passRate = submitted.length > 0 ? Math.round((passed / submitted.length) * 100) : null;

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };
  const ensure = (needed: number) => {
    if (y - needed < BOTTOM) newPage();
  };
  const text = (
    p: PDFPage,
    s: string,
    x: number,
    yy: number,
    size: number,
    f: PDFFont,
    color = INK
  ) => p.drawText(s, { x, y: yy, size, font: f, color });

  // Truncate a string to fit a width at a given font/size.
  const fit = (s: string, f: PDFFont, size: number, maxW: number) => {
    if (f.widthOfTextAtSize(s, size) <= maxW) return s;
    let out = s;
    while (out.length > 1 && f.widthOfTextAtSize(out + "…", size) > maxW) out = out.slice(0, -1);
    return out + "…";
  };

  // ---- Header ----
  page.drawRectangle({ x: 0, y: PAGE_H - 92, width: PAGE_W, height: 92, color: NAVY });
  text(page, "THE SHEPHERD'S CREW", MARGIN, PAGE_H - 40, 11, bold, GOLD);
  text(page, "Exam Performance Report", MARGIN, PAGE_H - 62, 18, bold, rgb(1, 1, 1));
  const genLabel = `Generated ${new Date().toLocaleString()}`;
  text(page, genLabel, PAGE_W - MARGIN - font.widthOfTextAtSize(genLabel, 9), PAGE_H - 40, 9, font, rgb(0.8, 0.83, 0.9));
  y = PAGE_H - 92 - 28;

  const weekBit = assessment.week_number != null ? `Week ${assessment.week_number} · ` : "";
  text(page, fit(assessment.title, bold, 15, PAGE_W - 2 * MARGIN), MARGIN, y, 15, bold);
  y -= 18;
  text(page, `${weekBit}${cohortName ?? "Cohort"} · ${assessment.duration_minutes} min · ${questionCount} questions`, MARGIN, y, 10, font, MUTED);
  y -= 28;

  // ---- Summary band ----
  const stats: [string, string][] = [
    ["Attempts", String(results.length)],
    ["Submitted", String(submitted.length)],
    ["Cohort average", avg != null ? `${avg}%` : "—"],
    ["Pass rate", passRate != null ? `${passRate}%` : "—"],
  ];
  const gap = 12;
  const cardW = (PAGE_W - 2 * MARGIN - gap * (stats.length - 1)) / stats.length;
  const cardH = 56;
  stats.forEach(([label, value], i) => {
    const x = MARGIN + i * (cardW + gap);
    page.drawRectangle({ x, y: y - cardH, width: cardW, height: cardH, color: rgb(0.97, 0.97, 0.98), borderColor: LINE, borderWidth: 1 });
    text(page, label.toUpperCase(), x + 10, y - 18, 7.5, bold, MUTED);
    text(page, value, x + 10, y - 42, 20, bold, NAVY);
  });
  text(page, `Pass mark: ${PASS_PCT}%`, MARGIN, y - cardH - 14, 8.5, font, MUTED);
  y -= cardH + 34;

  // ---- Topic analytics ----
  ensure(40);
  text(page, "Topic analytics", MARGIN, y, 13, bold, NAVY);
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
  y -= 20;

  if (analytics.length === 0) {
    text(page, "No submissions yet.", MARGIN, y, 10, font, MUTED);
    y -= 22;
  } else {
    const barX = MARGIN + 150;
    const barW = PAGE_W - MARGIN - 90 - barX;
    for (const t of analytics) {
      ensure(22);
      text(page, fit(t.topic, font, 10, 140), MARGIN, y, 10, font, INK);
      page.drawRectangle({ x: barX, y: y - 3, width: barW, height: 10, color: rgb(0.92, 0.92, 0.94) });
      page.drawRectangle({
        x: barX,
        y: y - 3,
        width: Math.max(2, (barW * Math.min(100, Math.max(0, t.pct))) / 100),
        height: 10,
        color: t.pct < 50 ? RED : GREEN,
      });
      const stat = `${t.pct}%  ${t.correct}/${t.total}`;
      text(page, stat, PAGE_W - MARGIN - font.widthOfTextAtSize(stat, 9.5), y, 9.5, font, MUTED);
      y -= 22;
    }
  }
  y -= 12;

  // ---- Results table ----
  ensure(40);
  text(page, "Results", MARGIN, y, 13, bold, NAVY);
  if (avg != null) {
    const a = `Cohort average: ${avg}%`;
    text(page, a, PAGE_W - MARGIN - font.widthOfTextAtSize(a, 10), y, 10, font, MUTED);
  }
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
  y -= 18;

  // Column x-positions.
  const cMember = MARGIN;
  const cScore = MARGIN + 210;
  const cPct = MARGIN + 290;
  const cResult = MARGIN + 350;
  const cSubmitted = MARGIN + 420;

  const header = () => {
    text(page, "MEMBER", cMember, y, 8, bold, MUTED);
    text(page, "SCORE", cScore, y, 8, bold, MUTED);
    text(page, "%", cPct, y, 8, bold, MUTED);
    text(page, "RESULT", cResult, y, 8, bold, MUTED);
    text(page, "SUBMITTED", cSubmitted, y, 8, bold, MUTED);
    y -= 14;
  };
  header();

  if (results.length === 0) {
    text(page, "No attempts yet.", cMember, y, 10, font, MUTED);
    y -= 18;
  } else {
    for (const r of results) {
      ensure(18);
      if (y === PAGE_H - MARGIN) header(); // just started a fresh page
      const p = pctOf(r.score, r.total, questionCount);
      text(page, fit(r.memberName, font, 10, 200), cMember, y, 10, font, INK);
      if (r.submittedAt) {
        text(page, `${r.score}/${r.total || questionCount}`, cScore, y, 10, font, INK);
        text(page, `${p}%`, cPct, y, 10, font, INK);
        const pass = (p ?? 0) >= PASS_PCT;
        text(page, pass ? "Pass" : "Fail", cResult, y, 10, bold, pass ? GREEN : RED);
        text(page, new Date(r.submittedAt).toLocaleString(), cSubmitted, y, 8.5, font, MUTED);
      } else {
        text(page, "in progress", cScore, y, 9.5, font, MUTED);
        text(page, "—", cSubmitted, y, 9.5, font, MUTED);
      }
      y -= 8;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.92, 0.92, 0.94) });
      y -= 10;
    }
  }

  const bytes = await pdf.save();
  // Copy into a fresh ArrayBuffer so the body type is a plain BodyInit.
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename(assessment.title)}"`,
      "Cache-Control": "no-store",
    },
  });
}
