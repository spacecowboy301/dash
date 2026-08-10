import { createHash } from "node:crypto";
import type { RawCareerListing } from "./types";

export function fingerprintCareerListing(listing: RawCareerListing): string {
  const normalized = JSON.stringify({
    company: listing.company.trim().toLowerCase(),
    title: listing.title.trim().toLowerCase(),
    location: listing.location.trim().toLowerCase(),
    compensation: listing.compensation?.trim().toLowerCase() ?? null,
    description: listing.description.replace(/\s+/g, " ").trim(),
    url: listing.url,
    updatedAt: listing.updatedAt,
  });
  return createHash("sha256").update(normalized).digest("hex");
}
