import Header from "./components/Header";
import IntervieweeView from "./components/IntervieweeView";
import InterviewerView from "./components/InterviewerView";
import Leaderboard from "./components/Leaderboard";
import ProfileModal from "./components/ProfileModal";
import { StoreProvider, useStore } from "./lib/store";

function Shell() {
  const { role, me, profileId, closeProfile } = useStore();

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {role === "interviewee" ? "Interviewee profile" : "Interviewer profile"}
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {role === "interviewee" ? (
              <>Hey {me.name.split(" ")[0]}, ready to <span className="text-primary">level up?</span></>
            ) : (
              <>Give back, {me.name.split(" ")[0]} — <span className="text-primary">run a mock.</span></>
            )}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>{role === "interviewee" ? <IntervieweeView /> : <InterviewerView />}</div>
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Leaderboard />
          </aside>
        </div>
      </main>
      <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted-foreground">
        ColorStack MockLab · Built by students, for students
      </footer>
      <ProfileModal studentId={profileId} onClose={closeProfile} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
