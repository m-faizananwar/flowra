const test = require("node:test");
const assert = require("node:assert/strict");
const { assertFileExists, readSource } = require("../helpers/source.cjs");

const sprintCoverage = [
  ["SCRUM-26 landing page", "src/app/page.js"],
  ["SCRUM-27 login page", "src/app/login/page.js"],
  ["SCRUM-27 signup page", "src/app/signup/page.js"],
  ["SCRUM-32 communication integrations", "src/components/integrations/SlackConnectorModal.tsx"],
  ["SCRUM-36 GitHub connection", "src/components/integrations/GitHubConnectorModal.tsx"],
  ["SCRUM-40 risk assessment", "src/components/risk/RiskContent.tsx"],
  ["SCRUM-44 member evaluation", "src/components/performance/PerformanceContent.tsx"],
  ["SCRUM-52 team analytics", "src/components/analytics/AnalyticsContent.tsx"],
  ["SCRUM-118 notifications", "src/components/layout/NotificationsPanel.tsx"],
  ["SCRUM-119 recommended updates", "src/components/jira/JiraContent.tsx"],
  ["SCRUM-122 sprint monitoring", "src/app/(dashboard)/sprints/page.js"],
  ["SCRUM-123 Jira approvals", "src/app/api/jira/execute-approval/route.js"],
];

test("System coverage maps sprint tasks to implemented frontend surfaces", () => {
  for (const [, file] of sprintCoverage) assertFileExists(file);
  assert.equal(sprintCoverage.length, 12);
});

test("Main dashboard layout exposes sprint MVP navigation paths", () => {
  const sidebar = readSource("src/components/layout/Sidebar.tsx");
  for (const route of ["/dashboard", "/integrations", "/jira", "/performance", "/risk", "/sprints", "/settings"]) {
    assert.match(sidebar, new RegExp(route.replace("/", "\\/")), `sidebar should link ${route}`);
  }
});

test("MVP workflow has frontend path from evidence and recommendations to human approval", () => {
  const jira = readSource("src/components/jira/JiraContent.tsx");
  const risk = readSource("src/components/risk/RiskContent.tsx");
  const notifications = readSource("src/components/layout/NotificationsPanel.tsx");

  assert.match(jira, /Engine Reasoning/);
  assert.match(jira, /Approve & Move/);
  assert.match(risk, /Strategic Mitigation Roadmap/);
  assert.match(risk, /Mitigate & Archive/);
  assert.match(notifications, /Review/);
});
