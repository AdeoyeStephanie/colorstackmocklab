import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type InterviewType = "technical" | "behavioral";
export type Platform = "Zoom" | "Google Meet" | "Microsoft Teams";
export type Comm = "Video call" | "Phone call" | "In person";
export type Role = "interviewee" | "interviewer";

export type SessionStatus = "open" | "booked" | "completed" | "cancelled";
export type NoShow = "none" | "interviewer" | "interviewee";

export interface Student {
  id: string;
  name: string;
  major: string;
  school: string;
  gradYear: number;
  color: string;
}

export interface SkillRating {
  metric: string;
  score: number; // 1..5
}

export interface Session {
  id: string;
  interviewerId: string;
  intervieweeId: string | null;
  type: InterviewType;
  date: string; // ISO yyyy-mm-dd
  start: string; // "14:00"
  end: string; // "15:00"
  timezone: string;
  comm: Comm;
  platform: Platform;
  status: SessionStatus;
  noShow: NoShow;
  // Interviewer -> interviewee skill assessment
  skillRatings?: SkillRating[];
  intervieweeNote?: string;
  // Interviewee -> interviewer star rating + anonymous review
  stars?: number;
  review?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const TECH_METRICS = [
  "Coding",
  "Problem-Solving",
  "Complexity Analysis",
  "Communication",
];
export const BEHAVIORAL_METRICS = [
  "Communication",
  "Structure (STAR)",
  "Impact",
  "Confidence",
];

export const metricsFor = (type: InterviewType) =>
  type === "technical" ? TECH_METRICS : BEHAVIORAL_METRICS;

export const WELCOME_CREDITS = 2; // new members start with 2
export const CREDIT_PER_GIVEN = 2; // giving a mock earns 2
export const CREDIT_PER_REQUEST = 1; // requesting a mock costs 1
export const CREDIT_PER_CANCEL = 1; // cancelling a booked mock costs 1

export const YOU_ID = "you";

export interface CreditTx {
  id: string;
  date: string; // ISO
  delta: number;
  label: string;
  kind: "welcome" | "earn" | "spend" | "refund";
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const students: Student[] = [
  { id: YOU_ID, name: "Amara Okafor", major: "Computer Science", school: "Georgia Tech", gradYear: 2027, color: "#4c33e0" },
  { id: "s2", name: "Deshawn Miller", major: "Software Engineering", school: "Howard University", gradYear: 2026, color: "#ff6b5c" },
  { id: "s3", name: "Priya Sharma", major: "Computer Science", school: "UC Berkeley", gradYear: 2026, color: "#10bfa0" },
  { id: "s4", name: "Marcus Bell", major: "Information Technology", school: "Morehouse College", gradYear: 2027, color: "#ffc93c" },
  { id: "s5", name: "Elena Vasquez", major: "Computer Engineering", school: "UT Austin", gradYear: 2025, color: "#3fa9ff" },
  { id: "s6", name: "Jordan Lee", major: "Computer Science", school: "Spelman College", gradYear: 2026, color: "#c04cff" },
  { id: "s7", name: "Tobi Adeyemi", major: "Software Engineering", school: "MIT", gradYear: 2025, color: "#ff9636" },
  { id: "s8", name: "Grace Chen", major: "Information Systems", school: "Carnegie Mellon", gradYear: 2027, color: "#e0336e" },
  { id: "s9", name: "Andre Thomas", major: "Computer Engineering", school: "Florida A&M", gradYear: 2026, color: "#2fbf71" },
];

// today = 2026-08-31 (per project date)
function iso(offsetDays: number): string {
  const d = new Date(2026, 7, 31);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

let seq = 0;
const uid = () => `sess_${(++seq).toString().padStart(3, "0")}`;

function seedSessions(): Session[] {
  const s: Session[] = [];

  // --- Open availability from other interviewers (future, bookable) ---
  s.push(
    { id: uid(), interviewerId: "s7", intervieweeId: null, type: "technical", date: iso(1), start: "17:00", end: "18:00", timezone: "ET", comm: "Video call", platform: "Zoom", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s3", intervieweeId: null, type: "technical", date: iso(2), start: "19:00", end: "20:00", timezone: "PT", comm: "Video call", platform: "Google Meet", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s5", intervieweeId: null, type: "behavioral", date: iso(2), start: "12:00", end: "12:45", timezone: "CT", comm: "Video call", platform: "Zoom", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s8", intervieweeId: null, type: "technical", date: iso(3), start: "15:00", end: "16:00", timezone: "ET", comm: "Video call", platform: "Microsoft Teams", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s2", intervieweeId: null, type: "behavioral", date: iso(4), start: "18:30", end: "19:15", timezone: "ET", comm: "Phone call", platform: "Zoom", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s9", intervieweeId: null, type: "technical", date: iso(5), start: "20:00", end: "21:00", timezone: "ET", comm: "Video call", platform: "Google Meet", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s7", intervieweeId: null, type: "behavioral", date: iso(6), start: "16:00", end: "16:45", timezone: "ET", comm: "Video call", platform: "Zoom", status: "open", noShow: "none" },
    { id: uid(), interviewerId: "s5", intervieweeId: null, type: "technical", date: iso(7), start: "13:00", end: "14:00", timezone: "CT", comm: "Video call", platform: "Google Meet", status: "open", noShow: "none" },
    // a slot already booked by someone else -> should be hidden from browse
    { id: uid(), interviewerId: "s3", intervieweeId: "s6", type: "technical", date: iso(3), start: "10:00", end: "11:00", timezone: "PT", comm: "Video call", platform: "Zoom", status: "booked", noShow: "none" },
  );

  // --- YOU as interviewee: upcoming booked ---
  s.push({
    id: uid(), interviewerId: "s7", intervieweeId: YOU_ID, type: "technical",
    date: iso(2), start: "18:00", end: "19:00", timezone: "ET",
    comm: "Video call", platform: "Zoom", status: "booked", noShow: "none",
  });

  // --- YOU as interviewee: past completed with skill ratings (growth trend) ---
  const techTrend = [
    { off: -48, scores: [2, 3, 2, 3] },
    { off: -34, scores: [3, 3, 3, 3] },
    { off: -20, scores: [3, 4, 3, 4] },
    { off: -9, scores: [4, 4, 4, 4] },
  ];
  const techInterviewers = ["s3", "s5", "s8", "s3"];
  techTrend.forEach((t, i) => {
    s.push({
      id: uid(), interviewerId: techInterviewers[i], intervieweeId: YOU_ID, type: "technical",
      date: iso(t.off), start: "18:00", end: "19:00", timezone: "ET",
      comm: "Video call", platform: "Zoom", status: "completed", noShow: "none",
      skillRatings: TECH_METRICS.map((m, j) => ({ metric: m, score: t.scores[j] })),
      intervieweeNote: i === techTrend.length - 1 ? "Big jump on complexity analysis — talk through edge cases earlier next time." : "Solid progress, keep drilling arrays & hashing.",
    });
  });

  const behTrend = [
    { off: -40, scores: [3, 2, 3, 3] },
    { off: -22, scores: [3, 3, 3, 4] },
    { off: -6, scores: [4, 4, 4, 4] },
  ];
  const behInterviewers = ["s2", "s5", "s7"];
  behTrend.forEach((t, i) => {
    s.push({
      id: uid(), interviewerId: behInterviewers[i], intervieweeId: YOU_ID, type: "behavioral",
      date: iso(t.off), start: "12:00", end: "12:45", timezone: "ET",
      comm: "Video call", platform: "Google Meet", status: "completed", noShow: "none",
      skillRatings: BEHAVIORAL_METRICS.map((m, j) => ({ metric: m, score: t.scores[j] })),
      intervieweeNote: "STAR structure much tighter — quantify impact more.",
    });
  });

  // --- YOU as interviewer: past mocks given (with your ratings + reviews received) ---
  s.push(
    { id: uid(), interviewerId: YOU_ID, intervieweeId: "s4", type: "technical", date: iso(-30), start: "16:00", end: "17:00", timezone: "ET", comm: "Video call", platform: "Zoom", status: "completed", noShow: "none", skillRatings: TECH_METRICS.map((m, j) => ({ metric: m, score: [3, 3, 2, 4][j] })), stars: 5, review: "Amara asked sharp follow-ups and kept me calm. Best mock I've had." },
    { id: uid(), interviewerId: YOU_ID, intervieweeId: "s6", type: "behavioral", date: iso(-16), start: "17:00", end: "17:45", timezone: "ET", comm: "Video call", platform: "Google Meet", status: "completed", noShow: "none", skillRatings: BEHAVIORAL_METRICS.map((m, j) => ({ metric: m, score: [4, 3, 4, 3][j] })), stars: 5, review: "Really thoughtful feedback on my STAR stories." },
    { id: uid(), interviewerId: YOU_ID, intervieweeId: "s9", type: "technical", date: iso(-4), start: "20:00", end: "21:00", timezone: "ET", comm: "Video call", platform: "Zoom", status: "completed", noShow: "none", skillRatings: TECH_METRICS.map((m, j) => ({ metric: m, score: [4, 4, 3, 4][j] })), stars: 4, review: "Clear and encouraging. Would book again." },
    { id: uid(), interviewerId: YOU_ID, intervieweeId: "s5", type: "behavioral", date: iso(-24), start: "15:00", end: "15:45", timezone: "ET", comm: "Video call", platform: "Zoom", status: "completed", noShow: "none", skillRatings: BEHAVIORAL_METRICS.map((m, j) => ({ metric: m, score: [4, 4, 3, 4][j] })), stars: 5, review: "Patient and detailed — pointed out filler words I never noticed." },
    { id: uid(), interviewerId: YOU_ID, intervieweeId: "s8", type: "technical", date: iso(-11), start: "19:00", end: "20:00", timezone: "ET", comm: "Video call", platform: "Google Meet", status: "completed", noShow: "none", skillRatings: TECH_METRICS.map((m, j) => ({ metric: m, score: [3, 4, 4, 4][j] })), stars: 4, review: "Great at nudging me toward the optimal approach without giving it away." },
  );

  // --- YOU as interviewer: upcoming to run ---
  s.push({
    id: uid(), interviewerId: YOU_ID, intervieweeId: "s4", type: "technical",
    date: iso(3), start: "16:00", end: "17:00", timezone: "ET",
    comm: "Video call", platform: "Zoom", status: "booked", noShow: "none",
  });

  // --- Reputation seeds for leaderboard (other interviewers' completed mocks with stars) ---
  const rep: Array<[string, number, number]> = [
    // [interviewerId, count, stars]
    ["s7", 6, 5], ["s3", 5, 5], ["s5", 4, 4], ["s8", 3, 5], ["s2", 3, 4], ["s9", 2, 4],
  ];
  rep.forEach(([iv, count, stars]) => {
    for (let k = 0; k < count; k++) {
      s.push({
        id: uid(), interviewerId: iv, intervieweeId: "s6", type: k % 2 ? "behavioral" : "technical",
        date: iso(-60 + k * 3), start: "18:00", end: "19:00", timezone: "ET",
        comm: "Video call", platform: "Zoom", status: "completed", noShow: "none",
        stars: k === 0 ? stars : Math.max(3, stars - (k % 2)),
      });
    }
  });

  return s;
}

const TODAY = iso(0);

// Deterministically derive the starting credit ledger from seeded history.
function buildInitialLedger(sessions: Session[], nameOf: (id: string) => string): CreditTx[] {
  const txns: CreditTx[] = [
    { id: "tx_welcome", date: iso(-90), delta: WELCOME_CREDITS, label: "Welcome bonus", kind: "welcome" },
  ];
  let n = 0;
  const relevant = sessions
    .filter(
      (s) =>
        (s.interviewerId === YOU_ID && s.status === "completed") ||
        (s.intervieweeId === YOU_ID && (s.status === "booked" || s.status === "completed")),
    )
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  for (const s of relevant) {
    if (s.interviewerId === YOU_ID && s.status === "completed") {
      txns.push({
        id: `tx_seed_${n++}`,
        date: s.date,
        delta: CREDIT_PER_GIVEN,
        label: `Gave ${s.type} mock to ${nameOf(s.intervieweeId!)}`,
        kind: "earn",
      });
    }
    if (s.intervieweeId === YOU_ID && (s.status === "booked" || s.status === "completed")) {
      txns.push({
        id: `tx_seed_${n++}`,
        date: s.date,
        delta: -CREDIT_PER_REQUEST,
        label: `Requested ${s.type} mock with ${nameOf(s.interviewerId)}`,
        kind: "spend",
      });
    }
  }
  return txns;
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

interface StoreValue {
  students: Student[];
  sessions: Session[];
  role: Role;
  setRole: (r: Role) => void;
  me: Student;
  studentById: (id: string) => Student;
  addAvailability: (draft: Omit<Session, "id" | "interviewerId" | "intervieweeId" | "status" | "noShow">) => void;
  bookSlot: (id: string) => void;
  cancelSlot: (id: string) => void;
  concludeSession: (id: string, skillRatings: SkillRating[], note: string) => void;
  rateInterviewer: (id: string, stars: number, review: string) => void;
  markNoShow: (id: string, who: NoShow) => void;
  ledger: CreditTx[];
  credits: number;
  blocked: boolean;
  blockReason: string | null;
  profileId: string | null;
  openProfile: (id: string) => void;
  closeProfile: () => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const LS_SESSIONS = "colorstack-mocks-v2";
const LS_LEDGER = "colorstack-ledger-v2";

const nameOf = (id: string) => (students.find((s) => s.id === id) ?? students[0]).name;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const raw = localStorage.getItem(LS_SESSIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seedSessions();
  });
  const [ledger, setLedger] = useState<CreditTx[]>(() => {
    try {
      const raw = localStorage.getItem(LS_LEDGER);
      if (raw) return JSON.parse(raw);
    } catch {}
    return buildInitialLedger(sessions, nameOf);
  });

  const [role, setRole] = useState<Role>("interviewee");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(LS_LEDGER, JSON.stringify(ledger));
    } catch {}
  }, [sessions, ledger]);

  const studentById = (id: string) =>
    students.find((s) => s.id === id) ?? students[0];
  const me = studentById(YOU_ID);

  const credits = ledger.reduce((sum, t) => sum + t.delta, 0);
  const blocked = credits < CREDIT_PER_REQUEST;
  const blockReason = blocked
    ? "You're out of credits. Give a mock to earn 2 more."
    : null;

  const addTx = (delta: number, label: string, kind: CreditTx["kind"]) =>
    setLedger((prev) => [
      ...prev,
      { id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, date: TODAY, delta, label, kind },
    ]);

  const addAvailability: StoreValue["addAvailability"] = (draft) => {
    setSessions((prev) => [
      {
        ...draft,
        id: `sess_new_${Date.now()}`,
        interviewerId: YOU_ID,
        intervieweeId: null,
        status: "open",
        noShow: "none",
      },
      ...prev,
    ]);
  };

  const bookSlot = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s || credits < CREDIT_PER_REQUEST) return;
    setSessions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, intervieweeId: YOU_ID, status: "booked" } : x)),
    );
    addTx(-CREDIT_PER_REQUEST, `Requested ${s.type} mock with ${nameOf(s.interviewerId)}`, "spend");
  };

  const cancelSlot = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    // Interviewee cancelling a mock they booked -> costs a credit
    if (s.intervieweeId === YOU_ID && s.status === "booked") {
      addTx(-CREDIT_PER_CANCEL, `Cancelled mock with ${nameOf(s.interviewerId)}`, "spend");
      setSessions((prev) =>
        prev.map((x) => (x.id === id ? { ...x, intervieweeId: null, status: "open" } : x)),
      );
      return;
    }
    // Interviewer pulling their own open slot -> no charge
    setSessions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, intervieweeId: null, status: "cancelled" } : x)),
    );
  };

  const concludeSession: StoreValue["concludeSession"] = (id, skillRatings, note) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "completed", skillRatings, intervieweeNote: note } : x,
      ),
    );
    if (s) addTx(CREDIT_PER_GIVEN, `Gave ${s.type} mock to ${nameOf(s.intervieweeId!)}`, "earn");
  };

  const rateInterviewer: StoreValue["rateInterviewer"] = (id, stars, review) =>
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stars, review } : s)),
    );

  const markNoShow = (id: string, who: NoShow) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "completed", noShow: who } : x)),
    );
    if (!s) return;
    if (who === "interviewee") {
      // You showed up as interviewer -> still earn the credit
      addTx(CREDIT_PER_GIVEN, `Gave mock (${nameOf(s.intervieweeId!)} no-show)`, "earn");
    } else if (who === "interviewer") {
      // Interviewer no-showed on you -> refund your request credit
      addTx(CREDIT_PER_REQUEST, `Refund: ${nameOf(s.interviewerId)} no-show`, "refund");
    }
  };

  const reset = () => {
    const fresh = seedSessions();
    setSessions(fresh);
    setLedger(buildInitialLedger(fresh, nameOf));
  };

  const value = useMemo<StoreValue>(
    () => ({
      students,
      sessions,
      role,
      setRole,
      me,
      studentById,
      addAvailability,
      bookSlot,
      cancelSlot,
      concludeSession,
      rateInterviewer,
      markNoShow,
      ledger,
      credits,
      blocked,
      blockReason,
      profileId,
      openProfile: setProfileId,
      closeProfile: () => setProfileId(null),
      reset,
    }),
    [sessions, ledger, role, credits, blocked, blockReason, profileId],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export interface LeaderboardRow {
  student: Student;
  avg: number;
  count: number;
  reviews: number;
}

export function leaderboard(sessions: Session[], studentById: (id: string) => Student): LeaderboardRow[] {
  const map = new Map<string, { total: number; count: number; reviews: number }>();
  sessions
    .filter((s) => s.status === "completed" && s.noShow === "none")
    .forEach((s) => {
      const entry = map.get(s.interviewerId) ?? { total: 0, count: 0, reviews: 0 };
      entry.count++;
      if (typeof s.stars === "number") {
        entry.total += s.stars;
        entry.reviews++;
      }
      map.set(s.interviewerId, entry);
    });
  return Array.from(map.entries())
    .map(([id, v]) => ({
      student: studentById(id),
      avg: v.reviews ? v.total / v.reviews : 0,
      count: v.count,
      reviews: v.reviews,
    }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 10);
}

export interface InterviewerStats {
  given: number;
  avg: number;
  reviewCount: number;
  reliability: number; // % of interviews they showed up for
  noShows: number;
  rank: number | null; // position on top-10 leaderboard
  reviews: { stars: number; text: string; date: string; type: InterviewType }[];
}

export function interviewerStats(
  sessions: Session[],
  id: string,
  studentById: (id: string) => Student,
): InterviewerStats {
  const asInterviewer = sessions.filter(
    (s) => s.interviewerId === id && s.status === "completed",
  );
  const clean = asInterviewer.filter((s) => s.noShow === "none");
  const rated = clean.filter((s) => typeof s.stars === "number");
  const avg = rated.length ? rated.reduce((a, s) => a + (s.stars ?? 0), 0) / rated.length : 0;
  const noShows = asInterviewer.filter((s) => s.noShow === "interviewer").length;
  const reliability = asInterviewer.length
    ? Math.round(((asInterviewer.length - noShows) / asInterviewer.length) * 100)
    : 100;
  const rankRow = leaderboard(sessions, studentById).findIndex((r) => r.student.id === id);

  return {
    given: clean.length,
    avg,
    reviewCount: rated.length,
    reliability,
    noShows,
    rank: rankRow >= 0 ? rankRow + 1 : null,
    reviews: rated
      .filter((s) => s.review)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((s) => ({ stars: s.stars!, text: s.review!, date: s.date, type: s.type })),
  };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}
export function formatFullDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
  return `${wd}, ${MONTHS[m - 1]} ${d}`;
}
export function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ap}`;
}
export function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}
