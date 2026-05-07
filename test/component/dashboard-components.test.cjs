const test = require("node:test");
const { readSource, assertContains, assertFileExists } = require("../helpers/source.cjs");

test("Sprint 2 analytics dashboard components are present for performance reports", () => {
  [
    "src/components/analytics/AnalyticsCharts.tsx",
    "src/components/analytics/AnalyticsContent.tsx",
    "src/components/analytics/KpiCards.tsx",
    "src/components/dashboard/zune/TeamPerformanceRoster.tsx",
    "src/app/(dashboard)/performance/page.js",
  ].forEach(assertFileExists);

  const analytics = readSource("src/components/analytics/AnalyticsContent.tsx");
  assertContains(analytics, [/\/api\/sprints\/data/, /Velocity/, /Done/, /ArchiveAndBacklog/], "analytics content");
});

test("Sprint 2 notification component supports unread count, mark-all-read, and review routing", () => {
  const source = readSource("src/components/layout/NotificationsPanel.tsx");

  assertContains(source, [
    /unreadCount/,
    /markAllAsRead/,
    /markAsRead/,
    /TYPE_ROUTE/,
    /risk_assessment: "\/risk"/,
    /member_evaluation: "\/performance"/,
    /router\.push\(route\)/,
  ], "notifications panel");
});

test("Sprint 2 Jira approval component exposes pending transitions, creations, approval, rejection, and history", () => {
  const source = readSource("src/components/jira/JiraContent.tsx");

  assertContains(source, [
    /pendingApprovals/,
    /pendingCreations/,
    /approveJira/,
    /rejectJira/,
    /\/api\/jira\/execute-approval/,
    /\/api\/analysis\/run/,
    /archivedApprovals/,
    /Approve & Create Task/,
    /Reject Suggestion/,
  ], "jira component");
});

test("Sprint 1 and 2 risk component supports risk triage, mitigation, editing, charts, and audit history", () => {
  const source = readSource("src/components/risk/RiskContent.tsx");

  assertContains(source, [
    /SEVERITY_OPTIONS/,
    /CATEGORY_OPTIONS/,
    /runRiskAssessment/,
    /approveRisk/,
    /edit_history/,
    /RiskRadar/,
    /PieChart/,
    /Test Coverage/,
    /Build Stability/,
  ], "risk component");
});
