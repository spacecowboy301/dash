import { ArrowUpRight, Building2, Clock3 } from "lucide-react";
import { updateFindingStatus } from "@/app/actions";
import type { DashboardFinding } from "@/domain/findings/types";

type FindingRowProps = {
  finding: DashboardFinding;
  featured?: boolean;
};

export function FindingRow({ finding, featured = false }: FindingRowProps) {
  const fitScore = finding.details.fitScore ?? Math.round((finding.confidence ?? 0) * 100);
  const primaryStatus = finding.status === "reviewed" ? "acted" : "reviewed";
  const primaryLabel = finding.status === "reviewed" ? "Mark acted" : "Review";

  return (
    <article className={`finding finding--${finding.priority}${featured ? " finding--featured" : ""}`}>
      <div className="finding__rail" aria-hidden="true" />
      <div className="finding__body">
        <header className="finding__header">
          <div>
            <h3>
              {finding.sourceUrl ? (
                <a href={finding.sourceUrl} target="_blank" rel="noreferrer">
                  {finding.title}
                </a>
              ) : (
                finding.title
              )}
            </h3>
            <p className="finding__company">
              <Building2 aria-hidden="true" />
              {finding.subtitle}
            </p>
          </div>
          <div className="finding__meta">
            <span className="finding__priority">{capitalize(finding.priority)}</span>
            <time dateTime={finding.createdAt.toISOString()}>{relativeTime(finding.createdAt)}</time>
          </div>
        </header>

        <div className="finding__explanation">
          <p>
            <Clock3 aria-hidden="true" />
            <span>{finding.whatChanged}</span>
          </p>
          {finding.recommendation ? (
            <p className="finding__recommendation">
              <ArrowUpRight aria-hidden="true" />
              <span>{finding.recommendation}</span>
            </p>
          ) : null}
        </div>

        <div className="fit-meter" aria-label={`${fitScore}% fit`}>
          <span>{fitScore}% fit</span>
          <div className="fit-meter__track" aria-hidden="true">
            <div className="fit-meter__fill" style={{ width: `${fitScore}%` }} />
          </div>
        </div>

        {featured ? (
          <form className="finding__actions" action={updateFindingStatus}>
            <input type="hidden" name="findingId" value={finding.id} />
            <button className="button button--primary" type="submit" name="status" value={primaryStatus}>
              {primaryLabel}
            </button>
            <button className="button" type="submit" name="status" value="dismissed">
              Dismiss
            </button>
            <button className="button" type="submit" name="status" value="snoozed">
              Later
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

function relativeTime(date: Date): string {
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3_600_000));
  if (hours === 0) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
