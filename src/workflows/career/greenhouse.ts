import type { CareerSourceAdapter, RawCareerListing } from "./types";

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  location: { name: string };
  content: string;
  metadata: Array<{ name: string; value: string | string[] | null }>;
};

export class GreenhouseCareerSource implements CareerSourceAdapter {
  readonly name: string;

  constructor(
    private readonly boardToken: string,
    private readonly company: string,
  ) {
    this.name = `greenhouse:${boardToken}`;
  }

  async fetch(): Promise<RawCareerListing[]> {
    const response = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(this.boardToken)}/jobs?content=true`,
      { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok) {
      throw new Error(`Greenhouse returned ${response.status} for ${this.boardToken}.`);
    }
    const payload = (await response.json()) as { jobs: GreenhouseJob[] };
    return payload.jobs.map((job) => ({
      source: this.name,
      externalId: `${this.boardToken}:${job.id}`,
      company: this.company,
      title: job.title,
      location: job.location.name,
      compensation: extractCompensation(job.metadata),
      description: stripHtml(job.content),
      url: job.absolute_url,
      updatedAt: job.updated_at,
    }));
  }
}

function extractCompensation(metadata: GreenhouseJob["metadata"]): string | undefined {
  const field = metadata.find((item) => item.name.toLowerCase().includes("compensation"));
  if (!field?.value) return undefined;
  return Array.isArray(field.value) ? field.value.join(" – ") : field.value;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
