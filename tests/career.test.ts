import { describe, expect, it } from "vitest";
import { deterministicEvaluate } from "@/workflows/career/deterministic-evaluator";
import { passesDeterministicCareerFilter } from "@/workflows/career/filters";
import { fingerprintCareerListing } from "@/workflows/career/fingerprint";
import { demoCareerListings } from "@/workflows/career/fixtures";

describe("Career workflow", () => {
  it("produces a stable fingerprint until source data changes", () => {
    const listing = demoCareerListings[0];
    const first = fingerprintCareerListing(listing);
    expect(fingerprintCareerListing({ ...listing })).toBe(first);
    expect(fingerprintCareerListing({ ...listing, compensation: "$1 more" })).not.toBe(first);
  });

  it("filters obvious mismatches before judgment", () => {
    const candidate = {
      ...demoCareerListings[2],
      fingerprint: fingerprintCareerListing(demoCareerListings[2]),
    };
    expect(passesDeterministicCareerFilter(candidate)).toBe(false);
  });

  it("surfaces only candidates meeting the attention threshold", () => {
    const candidates = demoCareerListings.slice(0, 2).map((listing) => ({
      ...listing,
      fingerprint: fingerprintCareerListing(listing),
    }));
    const evaluations = deterministicEvaluate(candidates);
    expect(evaluations.map((item) => item.fitScore)).toEqual([91, 84]);
    expect(evaluations.every((item) => item.fitScore >= 75)).toBe(true);
  });
});
