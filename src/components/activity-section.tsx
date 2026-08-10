import { CheckCircle2, ChevronRight, Database, Radar, WalletCards } from "lucide-react";
import type { DashboardData } from "@/dashboard/data";

type ActivitySectionProps = {
  activity: DashboardData["latestActivity"];
  budget: DashboardData["budget"];
};

export function ActivitySection({ activity, budget }: ActivitySectionProps) {
  const spentDollars = budget.spentMicroUsd / 1_000_000;
  const limitDollars = budget.hardLimitMicroUsd / 1_000_000;
  const usedPercent = Math.min((budget.spentMicroUsd / budget.hardLimitMicroUsd) * 100, 100);

  return (
    <>
      <section className="dashboard-section today" aria-labelledby="today-heading">
        <h2 id="today-heading">Today</h2>
        <div className="activity-row">
          <CheckCircle2 aria-hidden="true" />
          <span>No urgent deadlines</span>
          <ChevronRight className="activity-row__chevron" aria-hidden="true" />
        </div>
      </section>

      <section className="dashboard-section" id="activity" aria-labelledby="activity-heading">
        <h2 id="activity-heading">Workflow activity</h2>
        <div className="activity-row">
          <Radar aria-hidden="true" />
          <div>
            <strong>{activity?.workflowName ?? "Career monitor"}</strong>
            <small>{activity?.status === "failed" ? "Needs review" : "Completed quietly"}</small>
          </div>
          <ChevronRight className="activity-row__chevron" aria-hidden="true" />
        </div>
        <div className="activity-row">
          <Database aria-hidden="true" />
          <div>
            <strong>Checked {activity?.retrievedCount ?? 0} sources</strong>
            <small>{activity?.surfacedCount ?? 0} meaningful changes</small>
          </div>
          <ChevronRight className="activity-row__chevron" aria-hidden="true" />
        </div>
        <div className="activity-row activity-row--budget">
          <WalletCards aria-hidden="true" />
          <div>
            <strong>AI budget</strong>
            <small>
              ${spentDollars.toFixed(2)} of ${limitDollars.toFixed(2)}
            </small>
            <div className="budget-meter" aria-label={`${usedPercent.toFixed(0)}% of AI budget used`}>
              <span style={{ width: `${usedPercent}%` }} />
            </div>
          </div>
          <ChevronRight className="activity-row__chevron" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
