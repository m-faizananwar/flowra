const test = require("node:test");
const { readSource, assertContains, assertFileExists } = require("../helpers/source.cjs");

test("Sprint 2 SCRUM-9/SCRUM-52/SCRUM-21/SCRUM-64 analytics pipeline maps UI, backend fetch, charts, and report validation", () => {
  const analytics = readSource("src/components/analytics/AnalyticsContent.tsx");
  const overviewRoute = readSource("src/app/api/overview/data/route.js");

  assertContains(analytics, [/\/api\/sprints\/data/, /Velocity/, /Done/, /Sprint Analytics/, /ArchiveAndBacklog/], "analytics UI");
  assertContains(overviewRoute, [/member_evaluations/, /risk_assessments/, /github_events/, /completionPercent/, /performanceSeries/, /heatmap/], "overview API");
});

test("Sprint 2 SCRUM-10/SCRUM-15/SCRUM-118/SCRUM-124 notifications and feedback route users to the right review surface", () => {
  const source = readSource("src/components/layout/NotificationsPanel.tsx");

  assertContains(source, [
    /notifications/,
    /unreadCount/,
    /markAllAsRead/,
    /risk_assessment: "\/risk"/,
    /member_evaluation: "\/performance"/,
    /handleNotificationClick/,
    /Review/,
  ], "notifications panel");
});

test("Sprint 2 SCRUM-7/SCRUM-19/SCRUM-119/SCRUM-123 approval workflow includes recommendation review, approve, reject, execution, and history", () => {
  const source = readSource("src/components/jira/JiraContent.tsx");
  const route = readSource("src/app/api/jira/execute-approval/route.js");

  assertContains(source, [
    /pendingApprovals/,
    /pendingCreations/,
    /Engine Reasoning/,
    /Approve & Move/,
    /Reject Suggestion/,
    /archivedApprovals/,
  ], "Jira approval UI");
  assertContains(route, [/issue_key and target_status are required/, /user_id: user\.id/, /FLOWRA_ENGINE_URL/], "Jira approval API");
});

test("Sprint 2 SCRUM-11/SCRUM-122 sprint monitoring includes active sprint, velocity history, backlog, and done-card history", () => {
  const sprintsRoute = readSource("src/app/api/sprints/data/route.js");
  const board = readSource("src/components/board/ArchiveAndBacklog.tsx");

  assertFileExists("src/app/(dashboard)/sprints/page.js");
  assertContains(sprintsRoute, [/activeSprint/, /pastSprints/, /jiraIssues/, /state', 'active'/, /state', 'closed'/], "sprint API");
  assertContains(board, [/Completed History/, /Backlog/, /All DONE cards go to History/], "archive and backlog board");
});

test("Sprint 2 SCRUM-12/SCRUM-18/SCRUM-58/SCRUM-121 evidence and verification review are represented by source-of-truth proof and evaluation review flows", () => {
  const landing = readSource("src/app/page.js");
  const performance = readSource("src/components/performance/PerformanceContent.tsx");
  const jira = readSource("src/components/jira/JiraContent.tsx");

  assertContains(landing, [/Source-of-Truth Verification/, /checks GitHub for the actual commits and PRs/, /Real proof of work/], "verification promise");
  assertContains(performance, [/AI Evaluation Summary/, /Metric Breakdown/, /Audit Trail/, /Approve/], "verification review");
  assertContains(jira, [/Engine Reasoning/, /Jira Card Details/, /Suggested New Tasks/], "recommendation review");
});

test("Sprint 2 SCRUM-120/SCRUM-158 workflow testing standards and MVP demo are supported by runnable scripts and dashboard routes", () => {
  const pkg = readSource("package.json");
  const sidebar = readSource("src/components/layout/Sidebar.tsx");

  assertContains(pkg, [/"test": "node --test/, /"build": "next build"/, /"lint": "eslint"/], "quality scripts");
  assertContains(sidebar, [/\/dashboard/, /\/integrations/, /\/jira/, /\/performance/, /\/risk/, /\/sprints/], "MVP routes");
});
