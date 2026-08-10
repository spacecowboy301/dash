import { CalendarDays, UserRound } from "lucide-react";
import { ActivitySection } from "@/components/activity-section";
import { BottomNav } from "@/components/bottom-nav";
import { FindingRow } from "@/components/finding-row";
import { getDashboardData } from "@/dashboard/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(new Date());
  const attentionCount = data.attentionFindings.length;

  return (
    <>
      <main className="page-shell" id="top">
        <header className="app-header">
          <a className="wordmark" href="#top" aria-label="Dash home">
            Dash
          </a>
          <a className="profile-button" href="#settings" aria-label="Open settings">
            <UserRound aria-hidden="true" />
          </a>
        </header>

        <section className="greeting" aria-labelledby="greeting-heading">
          <p className="date-line">
            <CalendarDays aria-hidden="true" />
            {dateLabel}
          </p>
          <h1 id="greeting-heading">Good morning, Edward</h1>
          <p>
            {attentionCount === 0
              ? "Nothing needs your attention right now."
              : `${numberWord(attentionCount)} ${attentionCount === 1 ? "thing is" : "things are"} worth your attention.`}
          </p>
        </section>

        <section className="dashboard-section attention" aria-labelledby="attention-heading">
          <h2 id="attention-heading">Needs attention</h2>
          {attentionCount === 0 ? (
            <div className="quiet-state">
              <p>You’re caught up.</p>
              <span>The next meaningful change will appear here.</span>
            </div>
          ) : (
            <div className="findings-list">
              {data.attentionFindings.map((finding, index) => (
                <FindingRow key={finding.id} finding={finding} featured={index === 0} />
              ))}
            </div>
          )}
        </section>

        <ActivitySection activity={data.latestActivity} budget={data.budget} />

        <section className="anchor-section" id="watchlists" aria-label="Watchlists" />
        <section className="anchor-section" id="settings" aria-label="Settings" />
      </main>
      <BottomNav />
    </>
  );
}

function numberWord(value: number): string {
  if (value === 1) return "One";
  if (value === 2) return "Two";
  return String(value);
}
