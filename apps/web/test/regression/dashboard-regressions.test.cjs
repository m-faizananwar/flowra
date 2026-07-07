const test = require("node:test");
const assert = require("node:assert/strict");
const { readSource } = require("../helpers/source.cjs");

test("Overview route keeps blocked work separate from review work", () => {
  const source = readSource("src/app/api/overview/data/route.js");

  assert.match(source, /blocked.*stalled/s);
  assert.match(source, /review.*in progress.*testing.*qa/s);
  assert.match(source, /statusCounts = \{ done: 0, inReview: 0, blocked: 0, todo: 0 \}/);
});

test("Overview completion percentage falls back to sprint metrics when there are no cached Jira issues", () => {
  const source = readSource("src/app/api/overview/data/route.js");

  assert.match(source, /totalIssues > 0\s*\?\s*Math\.round\(\(statusCounts\.done \/ totalIssues\) \* 100\)\s*:\s*Number\(latestMetrics\?\.completion_rate \|\| 0\)/);
});

test("Jira approval UI preserves rejected and executed records in review history", () => {
  const source = readSource("src/components/jira/JiraContent.tsx");

  assert.match(source, /a\.status === "approved" \|\| a\.status === "rejected" \|\| a\.status === "executed"/);
  assert.match(source, /historySearch/);
});
