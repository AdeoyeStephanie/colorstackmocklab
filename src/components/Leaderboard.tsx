import { Trophy } from "lucide-react";
import { leaderboard, useStore, YOU_ID } from "../lib/store";
import { Avatar, Card, Stars } from "./ui";

const MEDAL = ["#ffc93c", "#c9c9d4", "#e0965c"];

export default function Leaderboard() {
  const { sessions, studentById, openProfile } = useStore();
  const rows = leaderboard(sessions, studentById);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-5 py-3.5">
        <Trophy size={18} className="text-primary" />
        <h3 className="font-display text-base font-bold">Top 10 Interviewers</h3>
      </div>
      <ol className="divide-y divide-border">
        {rows.map((r, i) => {
          const isYou = r.student.id === YOU_ID;
          return (
            <li
              key={r.student.id}
              onClick={() => openProfile(r.student.id)}
              className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted ${isYou ? "bg-primary/5" : ""}`}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold"
                style={{
                  background: i < 3 ? MEDAL[i] : "var(--muted)",
                  color: i < 3 ? "#16141f" : "var(--muted-foreground)",
                }}
              >
                {i + 1}
              </div>
              <Avatar student={r.student} size={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-sm font-bold">
                  {r.student.name}
                  {isYou && <span className="ml-1.5 font-mono text-[10px] text-primary">YOU</span>}
                </div>
                <div className="truncate font-mono text-[11px] text-muted-foreground">
                  {r.count} mocks given
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="font-display text-sm font-bold">{r.avg.toFixed(1)}</span>
                  <Stars value={r.avg} size={12} />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {r.reviews} reviews
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
