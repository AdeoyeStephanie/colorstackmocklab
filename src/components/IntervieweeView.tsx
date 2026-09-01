import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Flame,
  Lock,
  MessageSquare,
  Star,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDate,
  formatFullDate,
  metricsFor,
  to12h,
  useStore,
  YOU_ID,
  type InterviewType,
  type Session,
} from "../lib/store";
import { Avatar, Button, Card, Modal, StarPicker, Stars, TypeBadge } from "./ui";

type Tab = "browse" | "sessions" | "growth";

export default function IntervieweeView() {
  const [tab, setTab] = useState<Tab>("browse");
  const { credits, blocked, blockReason } = useStore();

  return (
    <div>
      <LimitBanner credits={credits} blocked={blocked} reason={blockReason} />

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1">
        {(
          [
            ["browse", "Find a mock"],
            ["sessions", "My sessions"],
            ["growth", "My growth"],
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

      {tab === "browse" && <Browse blocked={blocked} />}
      {tab === "sessions" && <MySessions />}
      {tab === "growth" && <Growth />}
    </div>
  );
}

/* ---------------- Limit banner ---------------- */

function LimitBanner({
  credits,
  blocked,
  reason,
}: {
  credits: number;
  blocked: boolean;
  reason: string | null;
}) {
  return (
    <div
      className={`mb-6 flex flex-wrap items-center gap-4 rounded-lg border-2 px-5 py-4 ${
        blocked ? "border-coral bg-coral/8" : "border-foreground bg-sun/20"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-md ${
          blocked ? "bg-coral text-white" : "bg-foreground text-background"
        }`}
      >
        {blocked ? <Lock size={20} /> : <Flame size={20} />}
      </div>
      <div className="flex-1">
        <div className="font-display text-sm font-bold">
          {blocked
            ? "You're out of credits"
            : `${credits} credit${credits === 1 ? "" : "s"} available`}
        </div>
        <div className="text-sm text-muted-foreground">
          {reason ??
            "Requesting a mock costs 1 credit · giving a mock earns 2 · cancelling costs 1."}
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1.5 font-display text-lg font-extrabold">
        <Coins size={18} /> {credits}
      </div>
    </div>
  );
}

/* ---------------- Browse ---------------- */

function Browse({ blocked }: { blocked: boolean }) {
  const { sessions, studentById, bookSlot, openProfile } = useStore();
  const [filter, setFilter] = useState<"all" | InterviewType>("all");
  const [booking, setBooking] = useState<Session | null>(null);
  const [confirmed, setConfirmed] = useState<Session | null>(null);

  const open = useMemo(
    () =>
      sessions
        .filter(
          (s) =>
            s.status === "open" &&
            s.interviewerId !== YOU_ID &&
            (filter === "all" || s.type === filter),
        )
        .sort((a, b) => (a.date + a.start < b.date + b.start ? -1 : 1)),
    [sessions, filter],
  );

  const confirmBook = () => {
    if (!booking) return;
    bookSlot(booking.id);
    setConfirmed(booking);
    setBooking(null);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "technical", "behavioral"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide transition-all ${
                filter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {open.length} open slot{open.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {open.map((s) => {
          const iv = studentById(s.interviewerId);
          return (
            <Card key={s.id} className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-[4px_4px_0_0_var(--border)]">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => openProfile(iv.id)}
                  className="group flex items-center gap-3 rounded-md text-left transition-colors hover:opacity-80"
                  title={`View ${iv.name}'s profile`}
                >
                  <Avatar student={iv} size={44} />
                  <div>
                    <div className="flex items-center gap-1 font-display text-sm font-bold leading-tight">
                      {iv.name}
                      <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {iv.major} · {iv.school}
                    </div>
                  </div>
                </button>
                <TypeBadge type={s.type} />
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 border-t border-border pt-4 text-sm">
                <Detail icon={<CalendarClock size={15} />} text={formatFullDate(s.date)} />
                <Detail icon={<Clock size={15} />} text={`${to12h(s.start)} ${s.timezone}`} />
                <Detail icon={<Video size={15} />} text={s.platform} />
                <Detail icon={<MessageSquare size={15} />} text={s.comm} />
              </div>

              <Button onClick={() => setBooking(s)} disabled={blocked} className="w-full">
                {blocked ? "Locked — give a mock" : "Book this slot"}
              </Button>
            </Card>
          );
        })}
        {open.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
            No open slots match this filter. Check back soon!
          </div>
        )}
      </div>

      {/* Booking confirm */}
      <Modal open={!!booking} onClose={() => setBooking(null)} title="Confirm your booking">
        {booking && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're booking a <b className="text-foreground">{booking.type}</b> mock with{" "}
              <b className="text-foreground">{studentById(booking.interviewerId).name}</b>.
            </p>
            <div className="rounded-md bg-muted p-4 text-sm">
              <div className="mb-2 flex justify-between">
                <span className="text-muted-foreground">When</span>
                <span className="font-medium">{formatFullDate(booking.date)} · {to12h(booking.start)} {booking.timezone}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">{booking.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{booking.comm}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-teal/10 p-3 text-sm text-teal">
              <CalendarCheck size={16} />
              A calendar invite will be emailed to both of you automatically.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBooking(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmBook} className="flex-1">
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Booked success */}
      <Modal open={!!confirmed} onClose={() => setConfirmed(null)} title="You're booked! 🎉">
        {confirmed && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15 text-teal">
              <CheckCircle2 size={34} />
            </div>
            <p className="text-sm text-muted-foreground">
              Calendar invites sent to <b className="text-foreground">you</b> and{" "}
              <b className="text-foreground">{studentById(confirmed.interviewerId).name}</b> for{" "}
              {formatFullDate(confirmed.date)} at {to12h(confirmed.start)} {confirmed.timezone}.
            </p>
            <Button onClick={() => setConfirmed(null)} className="w-full">
              Got it
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-foreground/50">{icon}</span>
      <span className="truncate text-foreground/90">{text}</span>
    </div>
  );
}

/* ---------------- My sessions ---------------- */

function MySessions() {
  const { sessions, studentById, cancelSlot, markNoShow, rateInterviewer } = useStore();
  const [rating, setRating] = useState<Session | null>(null);

  const mine = sessions
    .filter((s) => s.intervieweeId === YOU_ID && s.status !== "open" && s.status !== "cancelled")
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  const upcoming = mine.filter((s) => s.status === "booked");
  const past = mine.filter((s) => s.status === "completed");

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 font-display text-lg font-bold">Upcoming</h3>
        <div className="space-y-3">
          {upcoming.map((s) => {
            const iv = studentById(s.interviewerId);
            return (
              <Card key={s.id} className="flex flex-wrap items-center gap-4 p-4">
                <Avatar student={iv} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">{iv.name}</span>
                    <TypeBadge type={s.type} />
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {formatFullDate(s.date)} · {to12h(s.start)} {s.timezone} · {s.platform}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => markNoShow(s.id, "interviewer")} className="!px-3 !py-2 text-xs">
                    <X size={14} /> No-show
                  </Button>
                  <Button variant="ghost" onClick={() => cancelSlot(s.id)} className="!px-3 !py-2 text-xs">
                    Cancel
                  </Button>
                </div>
              </Card>
            );
          })}
          {upcoming.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No upcoming mocks. Find one in the Find a mock tab.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-bold">History</h3>
        <div className="space-y-3">
          {past.map((s) => {
            const iv = studentById(s.interviewerId);
            const avg = s.skillRatings?.length
              ? s.skillRatings.reduce((a, r) => a + r.score, 0) / s.skillRatings.length
              : 0;
            return (
              <Card key={s.id} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar student={iv} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold">{iv.name}</span>
                      <TypeBadge type={s.type} />
                      {s.noShow === "interviewer" && (
                        <span className="rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] uppercase text-coral">
                          No-show
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {formatFullDate(s.date)} · {s.platform}
                    </div>
                  </div>
                  {s.noShow !== "interviewer" && avg > 0 && (
                    <div className="text-right">
                      <div className="font-display text-lg font-bold">{avg.toFixed(1)}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">avg score</div>
                    </div>
                  )}
                  {s.noShow !== "interviewer" &&
                    (s.stars ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <Stars value={s.stars} size={14} />
                        <span className="font-mono text-[10px] text-muted-foreground">you rated</span>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setRating(s)} className="!px-3 !py-2 text-xs">
                        <Star size={14} /> Rate interviewer
                      </Button>
                    ))}
                </div>
                {s.intervieweeNote && s.noShow !== "interviewer" && (
                  <div className="mt-3 rounded-md bg-secondary p-3 text-sm">
                    <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-primary">
                      Feedback for you
                    </div>
                    <p className="text-secondary-foreground">{s.intervieweeNote}</p>
                    {s.skillRatings && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {s.skillRatings.map((r) => (
                          <span key={r.metric} className="font-mono text-[11px] text-muted-foreground">
                            {r.metric} <b className="text-foreground">{r.score}/5</b>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          {past.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No completed mocks yet.
            </p>
          )}
        </div>
      </section>

      <RateInterviewerModal
        session={rating}
        onClose={() => setRating(null)}
        onSubmit={(stars, review) => {
          if (rating) rateInterviewer(rating.id, stars, review);
          setRating(null);
        }}
        interviewerName={rating ? studentById(rating.interviewerId).name : ""}
      />
    </div>
  );
}

function RateInterviewerModal({
  session,
  onClose,
  onSubmit,
  interviewerName,
}: {
  session: Session | null;
  onClose: () => void;
  onSubmit: (stars: number, review: string) => void;
  interviewerName: string;
}) {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");

  return (
    <Modal open={!!session} onClose={onClose} title={`Rate ${interviewerName}`}>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-display text-sm font-semibold">Your rating</label>
          <StarPicker value={stars} onChange={setStars} />
        </div>
        <div>
          <label className="mb-2 block font-display text-sm font-semibold">
            Anonymous review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            placeholder="How was the session? What made it helpful? (Shared anonymously)"
            className="w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            Your name is never attached to reviews.
          </p>
        </div>
        <Button
          onClick={() => {
            setReview("");
            setStars(0);
            onSubmit(stars, review);
          }}
          disabled={stars === 0}
          className="w-full"
        >
          Submit rating
        </Button>
      </div>
    </Modal>
  );
}

/* ---------------- Growth ---------------- */

function Growth() {
  const { sessions } = useStore();

  const completed = sessions
    .filter((s) => s.intervieweeId === YOU_ID && s.status === "completed" && s.noShow === "none" && s.skillRatings)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const trend = completed.map((s) => {
    const avg = s.skillRatings!.reduce((a, r) => a + r.score, 0) / s.skillRatings!.length;
    return {
      date: formatDate(s.date),
      technical: s.type === "technical" ? +avg.toFixed(2) : null,
      behavioral: s.type === "behavioral" ? +avg.toFixed(2) : null,
    };
  });

  // latest radar per type
  const latest = (type: InterviewType) =>
    [...completed].reverse().find((s) => s.type === type);
  const buildRadar = (type: InterviewType) => {
    const l = latest(type);
    return metricsFor(type).map((m) => ({
      metric: m,
      score: l?.skillRatings?.find((r) => r.metric === m)?.score ?? 0,
    }));
  };
  const techRadar = buildRadar("technical");

  // stats
  const received = sessions.filter((s) => s.intervieweeId === YOU_ID && s.status === "completed").length;
  const given = sessions.filter((s) => s.interviewerId === YOU_ID && s.status === "completed").length;
  const allScores = completed.flatMap((s) => s.skillRatings!.map((r) => r.score));
  const overallAvg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  const first = completed[0]?.skillRatings;
  const last = completed[completed.length - 1]?.skillRatings;
  const firstAvg = first ? first.reduce((a, r) => a + r.score, 0) / first.length : 0;
  const lastAvg = last ? last.reduce((a, r) => a + r.score, 0) / last.length : 0;
  const delta = lastAvg - firstAvg;
  const noShows = sessions.filter((s) => s.intervieweeId === YOU_ID && s.noShow === "interviewee").length;
  const reliability = received ? Math.round(((received - noShows) / received) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Mocks received" value={String(received)} sub={`${given} given`} accent="var(--primary)" />
        <Stat label="Overall avg score" value={overallAvg.toFixed(1)} sub="out of 5" accent="var(--teal)" />
        <Stat
          label="Growth"
          value={`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`}
          sub="first → latest"
          accent="var(--sun)"
          icon={<TrendingUp size={16} />}
        />
        <Stat label="Reliability" value={`${reliability}%`} sub="show-up rate" accent="var(--sky)" />
      </div>

      <Card className="p-5">
        <h3 className="mb-1 font-display text-lg font-bold">Score trend over time</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Average interviewer score per mock, split by interview type.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--muted-foreground)" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="technical" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} connectNulls name="Technical" />
              <Line type="monotone" dataKey="behavioral" stroke="var(--teal)" strokeWidth={3} dot={{ r: 4 }} connectNulls name="Behavioral" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-1 font-display text-lg font-bold">Latest technical skill breakdown</h3>
        <p className="mb-4 text-sm text-muted-foreground">Where you stand on each metric right now.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={techRadar} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }} />
              <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 h-1.5 w-8 rounded-full" style={{ background: accent }} />
      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="font-display text-3xl font-extrabold tracking-tight">{value}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
    </Card>
  );
}
