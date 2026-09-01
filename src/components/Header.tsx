import { Coins, UserRound, Presentation } from "lucide-react";
import { useStore, YOU_ID } from "../lib/store";
import { Avatar } from "./ui";

export default function Header() {
  const { role, setRole, me, credits, openProfile } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-extrabold text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)]">
            C
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-extrabold tracking-tight">
              ColorStack <span className="text-primary">MockLab</span>
            </div>
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Free peer mock interviews
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile switch */}
          <div className="flex items-center rounded-full border border-border bg-muted p-1">
            <SwitchBtn
              active={role === "interviewee"}
              onClick={() => setRole("interviewee")}
              icon={<UserRound size={15} />}
              label="Interviewee"
            />
            <SwitchBtn
              active={role === "interviewer"}
              onClick={() => setRole("interviewer")}
              icon={<Presentation size={15} />}
              label="Interviewer"
            />
          </div>

          {/* Credit chip */}
          <button
            onClick={() => openProfile(YOU_ID)}
            title="View credit history"
            className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-sun px-3 py-1.5 font-display text-sm font-bold text-foreground shadow-[2px_2px_0_0_var(--foreground)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Coins size={16} />
            {credits}
            <span className="hidden font-mono text-[10px] font-medium uppercase tracking-wide sm:inline">
              credits
            </span>
          </button>

          <button
            onClick={() => openProfile(YOU_ID)}
            className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted sm:flex"
            title="Your profile"
          >
            <Avatar student={me} size={34} />
            <div className="text-left leading-tight">
              <div className="font-display text-sm font-bold">{me.name.split(" ")[0]}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{me.school}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function SwitchBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[13px] font-semibold transition-all ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="hidden xs:inline sm:inline">{label}</span>
    </button>
  );
}
