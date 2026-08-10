import { GreenhouseCareerSource } from "../src/workflows/career/greenhouse";
import { runCareerWorkflow } from "../src/workflows/career/run";
import type { CareerSourceAdapter } from "../src/workflows/career/types";

const boardConfig = parseBoardConfig(process.env.GREENHOUSE_BOARDS);
const sources: CareerSourceAdapter[] | undefined =
  boardConfig.length > 0
    ? boardConfig.map(({ token, company }) => new GreenhouseCareerSource(token, company))
    : undefined;

const result = await runCareerWorkflow({ sources, trigger: "manual" });
console.log(JSON.stringify(result, null, 2));

function parseBoardConfig(value: string | undefined): Array<{ token: string; company: string }> {
  if (!value) return [];
  return value.split(",").flatMap((entry) => {
    const [token, company] = entry.split(":").map((part) => part.trim());
    return token && company ? [{ token, company }] : [];
  });
}
