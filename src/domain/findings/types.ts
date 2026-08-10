export const FINDING_STATUSES = ["new", "reviewed", "dismissed", "snoozed", "acted"] as const;

export type FindingStatus = (typeof FINDING_STATUSES)[number];
export type FindingPriority = "high" | "medium" | "low";

export type FindingDetails = {
  company?: string;
  location?: string;
  compensation?: string;
  fitScore?: number;
  concerns?: string[];
};

export type DashboardFinding = {
  id: number;
  title: string;
  subtitle: string | null;
  priority: FindingPriority;
  whatChanged: string;
  whyItMatters: string;
  recommendation: string | null;
  confidence: number | null;
  status: FindingStatus;
  createdAt: Date;
  sourceUrl: string | null;
  details: FindingDetails;
};
