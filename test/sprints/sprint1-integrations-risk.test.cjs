const test = require("node:test");
const { readSource, assertContains, assertFileExists } = require("../helpers/source.cjs");

test("Sprint 1 SCRUM-13/SCRUM-36/SCRUM-49 GitHub connection covers install, claim, repository sync, and member mapping", () => {
  const source = readSource("src/components/integrations/GitHubConnectorModal.tsx");

  assertContains(source, [
    /\/api\/auth\/github\/install/,
    /\/api\/github\/installations/,
    /\/api\/github\/claim/,
    /github_repositories/,
    /installation_id/,
    /Verify Connection/,
    /Re-Sync/,
  ], "GitHub connector");
});

test("Sprint 1 SCRUM-32/SCRUM-48 communication channel connectivity covers Slack setup and message-sync state", () => {
  const source = readSource("src/components/integrations/SlackConnectorModal.tsx");

  assertContains(source, [
    /service_name: 'slack'/,
    /Sync Channels/,
    /channels/,
    /channel_id/,
    /Slack is Linked/,
    /stop all message syncing/,
    /channels:history/,
  ], "Slack connector");
});

test("Sprint 1 SCRUM-40/SCRUM-50 risk assessment has review, mitigation, schedule, and archive coverage", () => {
  const source = readSource("src/components/risk/RiskContent.tsx");

  assertContains(source, [
    /risk_assessments/,
    /runRiskAssessment/,
    /analysis_type: "risk"/,
    /approveRisk/,
    /risk_run_time/,
    /SEVERITY_OPTIONS/,
    /Strategic Mitigation Roadmap/,
    /Audit Trail/,
  ], "risk assessment UI");
});

test("Sprint 1 SCRUM-44/SCRUM-51 member evaluation covers KPI definition, reports, approval, and history", () => {
  const source = readSource("src/components/performance/PerformanceContent.tsx");

  assertContains(source, [
    /evaluation_metrics/,
    /member_evaluations/,
    /runEvaluation/,
    /analysis_type: "evaluation"/,
    /calculateTotal/,
    /saveEvaluationDraft/,
    /Evaluation History/,
    /Metric Breakdown/,
  ], "member evaluation UI");
});

test("Sprint 1 integration dashboard exposes Jira, GitHub, Slack, Discord, Telegram, and member management surfaces", () => {
  [
    "src/components/integrations/IntegrationsContent.tsx",
    "src/components/integrations/JiraConnectorModal.tsx",
    "src/components/integrations/MembersModal.tsx",
  ].forEach(assertFileExists);

  const source = readSource("src/components/integrations/IntegrationsContent.tsx");
  assertContains(source, [/GitHub/, /Jira Cloud/, /Slack Enterprise/, /Discord/, /Telegram/, /Manage Members/], "integrations dashboard");
});
