import { runCareerWorkflow } from "../src/workflows/career/run";

const result = await runCareerWorkflow({ trigger: "seed" });
console.log(
  `Career seed complete: ${result.retrieved} retrieved, ${result.filtered} filtered, ${result.surfaced} surfaced.`,
);
if (result.aiSkippedReason) console.log(`AI: ${result.aiSkippedReason}`);
