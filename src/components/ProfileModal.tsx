import { Coins, Quote, ShieldCheck, Star, TrendingUp, XCircle } from "lucide-react";
import {
  formatDate,
  interviewerStats,
  useStore,
  YOU_ID,
  type CreditTx,
} from "../lib/store";
import { Avatar, Modal, Stars, TypeBadge } from "./ui";

export default function ProfileModal({
  studentId,
  onClose,
}: {
  studentId: string | null;
  onClose: () => void;
}) {
  const { sessions, studentById, ledger, credits } = useStore();
  if (!studentId) return null;

  const student = studentById(studentId);
  const stats = interviewerStats(sessions, studentId, studentById);
  const isYou = studentId === YOU_ID;

  return (
    <Modal open={!!studentId} onClose={onClose} title={isYou ? "Your profile" : "Interviewer profile"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar student={student} size={60} />
          <div>
            <div className="font-display text-xl font-bold">{student.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {student.major} · {student.school} · Class of {student.gradYear}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars value={stats.avg} size={14} />
              <span className="font-display text-sm font-bold">{stats.avg.toFixed(1)}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                ({stats.reviewCount} reviews)
              </span>
              {stats.rank && (
                <span className="rounded-full bg-sun/25 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                  #{stats.rank} on leaderboard
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={<TrendingUp size={15} />} value={String(stats.given)} label="mocks given" accent="var(--primary)" />
          <MiniStat icon={<ShieldCheck size={15} />} value={`${stats.reliability}%`} label="show-up rate" accent="var(--teal)" />
          <MiniStat icon={<XCircle size={15} />} value={String(stats.noShows)} label="no-shows" accent="var(--coral)" />
        </div>

        {/* Your credits */}
        {isYou && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-display text-sm font-bold">Credit history</h4>
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-display text-sm font-bold text-primary">
                <Coins size={15} /> {credits} credits
              </div>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
              {[...ledger].reverse().map((tx: CreditTx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <div className="min-w-0">
                    <div className="truncate">{tx.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{formatDate(tx.date)}</div>
                  </div>
                  <div
                    className={`shrink-0 font-mono text-sm font-bold ${
                      tx.delta > 0 ? "text-teal" : "text-coral"
                    }`}
                  >
                    {tx.delta > 0 ? "+" : ""}
                    {tx.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h4 className="mb-2 font-display text-sm font-bold">
            {isYou ? "Reviews you've received" : "Recent reviews"}
          </h4>
          <div className="space-y-2.5">
            {stats.reviews.length === 0 && (
              <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No reviews yet.
              </p>
            )}
            {stats.reviews.map((r, i) => (
              <div key={i} className="rounded-md bg-secondary p-3">
                <div className="mb-1 flex items-center justify-between">
                  <Stars value={r.stars} size={13} />
                  <TypeBadge type={r.type} />
                </div>
                <div className="flex gap-2 text-sm text-secondary-foreground">
                  <Quote size={14} className="mt-0.5 shrink-0 text-primary" />
                  <p className="italic">"{r.text}"</p>
                </div>
                <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
                  Anonymous · {formatDate(r.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MiniStat({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div style={{ color: accent }}>{icon}</div>
      <div className="mt-1 font-display text-xl font-extrabold">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
