const test = require("node:test");
const { readSource, assertContains } = require("../helpers/source.cjs");

test("Analysis API accepts only supported Sprint 1 and Sprint 2 analysis types before forwarding to the engine", () => {
  const source = readSource("src/app/api/analysis/run/route.js");

  assertContains(source, [
    /\['risk', 'evaluation', 'provision_metrics', 'jira'\]/,
    /analysis_type must be risk, evaluation, provision_metrics, or jira/,
    /userClient\.auth\.getUser\(\)/,
    /FLOWRA_ENGINE_URL/,
    /\/api\/analysis\/run/,
    /sync_only/,
  ], "analysis route");
});

test("Jira approval API validates auth, required fields, and forwards ownership-scoped payload to Flowra Engine", () => {
  const source = readSource("src/app/api/jira/execute-approval/route.js");

  assertContains(source, [
    /userClient\.auth\.getUser\(\)/,
    /FLOWRA_ENGINE_URL/,
    /issue_key and target_status are required/,
    /\/api\/jira\/execute-approval/,
    /user_id: user\.id/,
    /approval_id/,
  ], "execute approval route");
});

test("Overview data API integrates sprints, Jira issues, approvals, notifications, risks, evaluations, and GitHub events", () => {
  const source = readSource("src/app/api/overview/data/route.js");

  assertContains(source, [
    /from\('sprints'\)/,
    /from\('jira_issues'\)/,
    /from\('approval_requests'\)/,
    /from\('notifications'\)/,
    /from\('analysis_runs'\)/,
    /from\('member_evaluations'\)/,
    /from\('risk_assessments'\)/,
    /from\('github_events'\)/,
    /statusBucket/,
    /completionPercent/,
    /teamPerformance/,
    /pendingCommitments/,
  ], "overview route");
});

test("Sprint data API returns active sprint, velocity history, and Jira issues for sprint monitoring", () => {
  const source = readSource("src/app/api/sprints/data/route.js");

  assertContains(source, [
    /activeSprint/,
    /pastSprints/,
    /jiraIssues/,
    /state', 'active'/,
    /state', 'closed'/,
    /project_key/,
  ], "sprints route");
});
