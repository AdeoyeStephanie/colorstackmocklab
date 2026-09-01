import { useMemo, useState } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Quote,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  formatFullDate,
  metricsFor,
  to12h,
  useStore,
  YOU_ID,
  type Comm,
  type InterviewType,
  type Platform,
  type Session,
  type SkillRating,
} from "../lib/store";
import { Avatar, Button, Card, Modal, Stars, TypeBadge } from "./ui";

type Tab = "dashboard" | "availability";

export default function InterviewerView() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1">
        {(
          [
            ["dashboard", "Interview dashboard"],
            ["availability", "My availability"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-4 py-2 font-display text-sm font-semibold transition-all ${
              tab === k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <Dashboard />}
      {tab === "availability" && <Availability />}
    </div>
  );
}

/* ---------------- Reputation strip ---------------- */

function ReputationStrip() {
  const { sessions } = useStore();
  const given = sessions.filter((s) => s.interviewerId === YOU_ID && s.status === "completed" && s.noShow === "none");
  const rated = given.filter((s) => typeof s.stars === "number");
  const avg = rated.length ? rated.reduce((a, s) => a + (s.stars ?? 0), 0) / rated.length : 0;
  const upcoming = sessions.filter((s) => s.interviewerId === YOU_ID && s.status === "booked").length;

  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="mb-2 h-1.5 w-8 rounded-full bg-primary" />
        <div className="font-display text-3xl font-extrabold">{given.length}</div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">mocks given</div>
      </Card>
      <Card className="p-4">
        <div className="mb-2 h-1.5 w-8 rounded-full bg-sun" />
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl font-extrabold">{avg.toFixed(1)}</span>
          <Stars value={avg} size={14} />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          rating · {rated.length} reviews
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-2 h-1.5 w-8 rounded-full bg-teal" />
        <div className="font-display text-3xl font-extrabold">{upcoming}</div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">upcoming</div>
      </Card>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard() {
  const { sessions, studentById, markNoShow } = useStore();
  const [conclude, setConclude] = useState<Session | null>(null);

  const mine = sessions
    .filter((s) => s.interviewerId === YOU_ID && s.intervieweeId)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  const upcoming = mine.filter((s) => s.status === "booked");
  const past = mine.filter((s) => s.status === "completed");

  return (
    <div>
      <ReputationStrip />

      <section className="mb-8">
        <h3 className="mb-3 font-display text-lg font-bold">Upcoming interviews to run</h3>
        <div className="space-y-3">
          {upcoming.map((s) => {
            const ie = studentById(s.intervieweeId!);
            return (
              <Card key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                <Avatar student={ie} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">{ie.name}</span>
                    <TypeBadge type={s.type} />
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {formatFullDate(s.date)} · {to12h(s.start)} {s.timezone} · {s.platform}
                  </div>
                </div>
                <Button variant="danger" onClick={() => markNoShow(s.id, "interviewee")} className="!px-3 !py-2 text-xs">
                  <X size={14} /> No-show
                </Button>
                <Button onClick={() => setConclude(s)} className="!px-3 !py-2 text-xs">
                  <CheckCircle2 size={14} /> Conclude & rate
                </Button>
              </Card>
            );
          })}
          {upcoming.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No upcoming interviews. Post availability so students can book you.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-bold">Completed</h3>
        <div className="space-y-3">
          {past.map((s) => {
            const ie = studentById(s.intervieweeId!);
            return (
              <Card key={s.id} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar student={ie} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold">{ie.name}</span>
                      <TypeBadge type={s.type} />
                      {s.noShow === "interviewee" && (
                        <span className="rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] uppercase text-coral">
                          No-show
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {formatFullDate(s.date)} · {s.platform}
                    </div>
                  </div>
                  {typeof s.stars === "number" && (
                    <div className="flex flex-col items-end gap-0.5">
                      <Stars value={s.stars} size={14} />
                      <span className="font-mono text-[10px] text-muted-foreground">they rated you</span>
                    </div>
                  )}
                </div>
                {s.review && (
                  <div className="mt-3 flex gap-2 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                    <Quote size={16} className="shrink-0 text-primary" />
                    <div>
                      <p className="italic">"{s.review}"</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">Anonymous review</p>
                    </div>
                  </div>
                )}
                {s.skillRatings && s.noShow === "none" && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2">
                    {s.skillRatings.map((r) => (
                      <span key={r.metric} className="font-mono text-[11px] text-muted-foreground">
                        {r.metric} <b className="text-foreground">{r.score}/5</b>
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {past.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No completed interviews yet.
            </p>
          )}
        </div>
      </section>

      <ConcludeModal session={conclude} onClose={() => setConclude(null)} />
    </div>
  );
}

function ConcludeModal({ session, onClose }: { session: Session | null; onClose: () => void }) {
  const { studentById, concludeSession } = useStore();
  const metrics = session ? metricsFor(session.type) : [];
  const [scores, setScores] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");

  const submit = () => {
    if (!session) return;
    const ratings: SkillRating[] = metrics.map((m) => ({ metric: m, score: scores[m] ?? 3 }));
    concludeSession(session.id, ratings, note);
    setScores({});
    setNote("");
    onClose();
  };

  return (
    <Modal
      open={!!session}
      onClose={onClose}
      title={session ? `Rate ${studentById(session.intervieweeId!).name}` : ""}
    >
      {session && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Score this {session.type} mock on each metric. Your feedback drives their growth chart.
          </p>
          <div className="space-y-4">
            {metrics.map((m) => (
              <div key={m}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-display text-sm font-semibold">{m}</span>
                  <span className="font-mono text-xs text-muted-foreground">{scores[m] ?? "—"}/5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setScores((p) => ({ ...p, [m]: n }))}
                      className={`h-9 flex-1 rounded-md border font-display text-sm font-bold transition-all ${
                        (scores[m] ?? 0) >= n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">Feedback note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What went well, and one thing to work on next time…"
              className="w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <Button onClick={submit} className="w-full">
            <CheckCircle2 size={16} /> Conclude interview
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- Availability ---------------- */

const PLATFORMS: Platform[] = ["Zoom", "Google Meet", "Microsoft Teams"];
const COMMS: Comm[] = ["Video call", "Phone call", "In person"];
const TZS = ["ET", "CT", "MT", "PT"];

function Availability() {
  const { sessions, addAvailability, cancelSlot } = useStore();
  const [open, setOpen] = useState(false);

  const myOpen = useMemo(
    () =>
      sessions
        .filter((s) => s.interviewerId === YOU_ID && s.status === "open")
        .sort((a, b) => (a.date + a.start < b.date + b.start ? -1 : 1)),
    [sessions],
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Open slots you're offering</h3>
          <p className="text-sm text-muted-foreground">Interviewees only see slots that are still open.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Add availability
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {myOpen.map((s) => (
          <Card key={s.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <TypeBadge type={s.type} />
              <button
                onClick={() => cancelSlot(s.id)}
                className="text-muted-foreground transition-colors hover:text-coral"
                aria-label="Remove slot"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="font-display text-base font-bold">{formatFullDate(s.date)}</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {to12h(s.start)} {s.timezone}</span>
              <span className="flex items-center gap-1.5"><Video size={14} /> {s.platform}</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {s.comm}</span>
            </div>
          </Card>
        ))}
        {myOpen.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
            <CalendarPlus size={28} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No open slots yet. Add availability to start giving mocks.</p>
          </div>
        )}
      </div>

      <AvailabilityModal open={open} onClose={() => setOpen(false)} onSubmit={addAvailability} />
    </div>
  );
}

function AvailabilityModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: {
    type: InterviewType;
    date: string;
    start: string;
    end: string;
    timezone: string;
    comm: Comm;
    platform: Platform;
  }) => void;
}) {
  const [type, setType] = useState<InterviewType>("technical");
  const [date, setDate] = useState("2026-09-05");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("19:00");
  const [timezone, setTimezone] = useState("ET");
  const [comm, setComm] = useState<Comm>("Video call");
  const [platform, setPlatform] = useState<Platform>("Zoom");

  const submit = () => {
    onSubmit({ type, date, start, end, timezone, comm, platform });
    onClose();
  };

  const field = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20";

  return (
    <Modal open={open} onClose={onClose} title="Add availability">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-display text-sm font-semibold">Interview type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["technical", "behavioral"] as InterviewType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-md border-2 py-2.5 font-display text-sm font-semibold capitalize transition-all ${
                  type === t ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-display text-sm font-semibold">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">Start</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">End</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">Zone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={field}>
              {TZS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">Format</label>
            <select value={comm} onChange={(e) => setComm(e.target.value as Comm)} className={field}>
              {COMMS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-display text-sm font-semibold">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={field}>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={submit} className="w-full">
          <CalendarPlus size={16} /> Post this slot
        </Button>
      </div>
    </Modal>
  );
}
