import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const allowedEnvFiles = new Set([".env.example", ".env.sample"]);
const forbiddenPaths = files.filter((file) => {
  const name = basename(file);
  return (name.startsWith(".env") && !allowedEnvFiles.has(name)) ||
    /\.(?:key|pem|p12|pfx)$/i.test(name) ||
    file.startsWith(".github/workflows/");
});

const secretPatterns = [
  ["OpenAI API key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
];
const findings = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
  }
}

if (forbiddenPaths.length || findings.length) {
  console.error("Cost-safety audit failed.");
  for (const file of forbiddenPaths) console.error(`Tracked sensitive file: ${file}`);
  for (const finding of findings) console.error(finding);
  process.exit(1);
}

console.log(`Cost-safety audit passed (${files.length} tracked files checked).`);
