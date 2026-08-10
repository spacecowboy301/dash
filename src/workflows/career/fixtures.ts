import type { CareerSourceAdapter, RawCareerListing } from "./types";

export const demoCareerListings: RawCareerListing[] = [
  {
    source: "fixture",
    externalId: "linear-staff-product-designer",
    company: "Linear",
    title: "Staff Product Designer",
    location: "New York or Remote",
    compensation: "$190,000–$245,000",
    description:
      "Lead product design for high-leverage collaboration workflows. Partner closely with product and engineering, shape systems, and bring AI-assisted experiences from concept to launch.",
    url: "https://linear.app/careers",
    updatedAt: "2026-08-09T12:00:00.000Z",
    demoFitScore: 91,
    changeSummary: "A strong match appeared 3 hours ago.",
  },
  {
    source: "fixture",
    externalId: "notion-ai-product-lead",
    company: "Notion",
    title: "AI Product Lead",
    location: "New York, NY",
    compensation: "$205,000–$280,000",
    description:
      "Own the strategy and execution of AI product experiences. Work across research, design, engineering, and go-to-market to deliver thoughtful tools for knowledge workers.",
    url: "https://www.notion.com/careers",
    updatedAt: "2026-08-09T10:00:00.000Z",
    demoFitScore: 84,
    changeSummary: "Compensation details were added.",
  },
  {
    source: "fixture",
    externalId: "example-growth-intern",
    company: "Example Co",
    title: "Growth Intern",
    location: "Remote",
    description: "Unpaid internship focused on outbound growth experiments.",
    url: "https://example.com/jobs/growth-intern",
    updatedAt: "2026-08-09T09:00:00.000Z",
    demoFitScore: 20,
  },
];

export class FixtureCareerSource implements CareerSourceAdapter {
  readonly name = "fixture";

  async fetch(): Promise<RawCareerListing[]> {
    const deterministicNoise = Array.from({ length: 15 }, (_, index) => ({
      source: "fixture",
      externalId: `demo-filtered-${index + 1}`,
      company: `Demo Company ${index + 1}`,
      title: index % 2 === 0 ? "Account Executive" : "Operations Coordinator",
      location: "Remote",
      description: "A deliberately low-signal demo listing used to verify deterministic filtering.",
      url: "https://example.com/careers",
      updatedAt: "2026-08-09T08:00:00.000Z",
      demoFitScore: 30,
    } satisfies RawCareerListing));
    return structuredClone([...demoCareerListings, ...deterministicNoise]);
  }
}
