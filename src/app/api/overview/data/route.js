import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function buildRecentDays(count) {
  const days = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(new Date(now.getTime() - i * DAY_MS));
  }
  return days;
}

function statusBucket(status = '') {
  const s = String(status).toLowerCase();
  if (['done', 'closed', 'resolved', 'completed'].some((k) => s.includes(k))) return 'done';
  if (['review', 'in progress', 'progress', 'testing', 'qa'].some((k) => s.includes(k))) return 'inReview';
  if (['blocked', 'stalled'].some((k) => s.includes(k))) return 'blocked';
  return 'todo';
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [
      activeSprintRes,
      jiraIssuesRes,
      approvalsRes,
      notificationsRes,
      analysisRunsRes,
      memberEvaluationsRes,
      riskAssessmentsRes,
      githubEventsRes,
    ] = await Promise.all([
      serviceClient
        .from('sprints')
        .select('*, sprint_metrics(*)')
        .eq('user_id', user.id)
        .eq('state', 'active')
        .order('last_synced_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      serviceClient
        .from('jira_issues')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(800),
      serviceClient
        .from('approval_requests')
        .select('id, request_type, status, title, summary, payload, created_at, reviewed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500),
      serviceClient
        .from('notifications')
        .select('id, type, title, body, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      serviceClient
        .from('analysis_runs')
        .select('id, analysis_type, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(400),
      serviceClient
        .from('member_evaluations')
        .select('id, status, total_score, metric_scores, created_at, members(id, full_name, alias, avatar_url, role)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200),
      serviceClient
        .from('risk_assessments')
        .select('id, status, severity, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200),
      serviceClient
        .from('github_events')
        .select('id, title, event_type, occurred_at')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(1500),
    ]);

    if (activeSprintRes.error) throw activeSprintRes.error;
    if (jiraIssuesRes.error) throw jiraIssuesRes.error;
    if (approvalsRes.error) throw approvalsRes.error;
    if (notificationsRes.error) throw notificationsRes.error;
    if (analysisRunsRes.error) throw analysisRunsRes.error;
    if (memberEvaluationsRes.error) throw memberEvaluationsRes.error;
    if (riskAssessmentsRes.error) throw riskAssessmentsRes.error;
    if (githubEventsRes.error) throw githubEventsRes.error;

    const activeSprint = activeSprintRes.data || null;
    const latestMetrics = activeSprint?.sprint_metrics?.[activeSprint.sprint_metrics.length - 1] || null;
    const jiraIssuesRaw = jiraIssuesRes.data || [];
    const jiraIssues = activeSprint?.jira_sprint_id
      ? jiraIssuesRaw.filter((i) => String(i.sprint_jira_id) === String(activeSprint.jira_sprint_id))
      : jiraIssuesRaw;

    const statusCounts = { done: 0, inReview: 0, blocked: 0, todo: 0 };
    for (const issue of jiraIssues) {
      statusCounts[statusBucket(issue.status)] += 1;
    }
    const totalIssues = jiraIssues.length;
    const completionPercent = totalIssues > 0
      ? Math.round((statusCounts.done / totalIssues) * 100)
      : Number(latestMetrics?.completion_rate || 0);
    const verifiedActions = (approvalsRes.data || []).filter((a) => a.status === 'approved').length;

    const last7Days = buildRecentDays(7);
    const trendByDay = Object.fromEntries(
      last7Days.map((d) => [dateKey(d), { planned: 0, completed: 0, amount: 0 }])
    );

    for (const issue of jiraIssues) {
      const created = issue.created_at ? dateKey(issue.created_at) : null;
      if (created && trendByDay[created]) trendByDay[created].planned += 1;
      if (statusBucket(issue.status) === 'done') {
        const completedAt = issue.updated_at ? dateKey(issue.updated_at) : created;
        if (completedAt && trendByDay[completedAt]) trendByDay[completedAt].completed += 1;
      }
    }

    const sprintTrend = last7Days.map((d) => {
      const key = dateKey(d);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        income: trendByDay[key].planned,
        expenses: trendByDay[key].completed,
      };
    });

    const performanceSeries = last7Days.map((d) => {
      const key = dateKey(d);
      const result = { name: d.toLocaleDateString('en-US', { weekday: 'short' }) };
      const dayEvals = (memberEvaluationsRes.data || []).filter((e) => e.status === 'approved' && dateKey(e.created_at) === key);
      
      const memberSums = {};
      const memberCounts = {};
      const memberNames = {};
      
      for (const e of dayEvals) {
        const member = e.members || {};
        const memberKey = `id:${member.id || 'unknown'}`;
        if (!memberSums[memberKey]) {
          memberSums[memberKey] = 0;
          memberCounts[memberKey] = 0;
          memberNames[memberKey] = member.full_name || member.alias || 'Unknown';
        }
        memberSums[memberKey] += Number(e.total_score || 0);
        memberCounts[memberKey] += 1;
      }
      
      for (const mId in memberSums) {
         result[mId] = Math.round(memberSums[mId] / memberCounts[mId]);
         result[`${mId}_name`] = memberNames[mId];
      }
      
      return result;
    });

    const teamPerformanceMap = new Map();
    for (const e of memberEvaluationsRes.data || []) {
      if (e.status !== 'approved') continue;
      
      const member = e.members || {};
      const alias = (member.alias || '').trim().toLowerCase();
      const fullName = (member.full_name || '').trim().toLowerCase();
      const role = (member.role || '').trim().toLowerCase();
      let key = `id:${member.id || 'unknown'}`;
      if (alias) key = `alias:${alias}|role:${role}`;
      else if (fullName) key = `name:${fullName}|role:${role}`;

      if (!teamPerformanceMap.has(key) || new Date(e.created_at) > new Date(teamPerformanceMap.get(key).created_at)) {
        teamPerformanceMap.set(key, {
          id: member.id,
          name: member.full_name || member.alias,
          role: member.role || 'No role',
          avatar_url: member.avatar_url,
          score: e.total_score,
          metrics: (e.metric_scores || []).map((m) => ({ name: m.name, score: m.score })),
          created_at: e.created_at,
        });
      }
    }
    const teamPerformance = Array.from(teamPerformanceMap.values()).sort((a, b) => b.score - a.score);

    const categoryMap = new Map();
    for (const issue of jiraIssues) {
      const key = issue.issue_type || 'Unspecified';
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const recentActivity = [
      ...(notificationsRes.data || []).map((n) => ({
        id: `n-${n.id}`,
        title: n.title || 'Notification',
        amount: 0,
        date: n.created_at,
        category: 'other',
        type: 'income',
      })),
      ...(approvalsRes.data || []).slice(0, 12).map((a) => ({
        id: `a-${a.id}`,
        title: a.title || a.request_type,
        amount: 0,
        date: a.created_at,
        category: 'utilities',
        type: a.status === 'approved' ? 'income' : 'expense',
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    const heatDays = buildRecentDays(28);
    const eventCounts = Object.fromEntries(heatDays.map((d, idx) => [dateKey(d), { day: idx, amount: 0, date: dateKey(d), scoreSum: 0, evalCount: 0, risks: 0, jiraUpdates: 0 }]));
    
    for (const event of githubEventsRes.data || []) {
      const key = dateKey(event.occurred_at);
      if (eventCounts[key]) {
        eventCounts[key].amount += 1;
      }
    }
    
    for (const r of riskAssessmentsRes.data || []) {
      const key = dateKey(r.created_at);
      if (eventCounts[key]) {
        eventCounts[key].risks += 1;
        eventCounts[key].amount += 1;
      }
    }
    
    for (const e of memberEvaluationsRes.data || []) {
      const key = dateKey(e.created_at);
      if (eventCounts[key]) {
        eventCounts[key].scoreSum += (e.total_score || 0);
        eventCounts[key].evalCount += 1;
        eventCounts[key].amount += 1;
      }
    }
    
    for (const issue of jiraIssuesRaw || []) {
      const key = dateKey(issue.updated_at);
      if (eventCounts[key]) {
        eventCounts[key].jiraUpdates += 1;
        eventCounts[key].amount += 1;
      }
    }
    
    const heatmap = heatDays.map((d) => {
      const data = eventCounts[dateKey(d)];
      return {
        day: data.day,
        amount: data.amount, // Total interaction density
        date: data.date,
        score: data.evalCount > 0 ? Math.round(data.scoreSum / data.evalCount) : 0,
        risks: data.risks,
        jiraUpdates: data.jiraUpdates,
      };
    });

    const pendingCommitments = [
      ...(approvalsRes.data || [])
        .filter((a) => a.status === 'pending')
        .slice(0, 8)
        .map((a, idx) => ({
          id: `p-${a.id}`,
          merchant: a.title || a.request_type || `Pending #${idx + 1}`,
          amount: 0,
          dueDate: a.created_at,
          status: 'pending',
          isAuto: true,
        })),
      ...(riskAssessmentsRes.data || [])
        .filter((r) => r.status === 'pending' && ['high', 'critical'].includes((r.severity || '').toLowerCase()))
        .slice(0, 4)
        .map((r) => ({
          id: `r-${r.id}`,
          merchant: r.title || `Risk: ${r.severity}`,
          amount: 0,
          dueDate: r.created_at,
          status: 'overdue',
          isAuto: true,
        })),
    ].slice(0, 12);

    return NextResponse.json({
      kpis: {
        sprintVelocity: completionPercent,
        completed: statusCounts.done,
        inReview: statusCounts.inReview,
        blocked: statusCounts.blocked,
        verifiedActions,
        totalWorkload: totalIssues || Number(latestMetrics?.total_issues || 0),
      },
      charts: {
        sprintTrend,
        categoryBreakdown,
        performanceSeries,
        heatmap,
      },
      feeds: {
        recentActivity,
        pendingCommitments,
      },
      performance: {
        team: teamPerformance,
      },
      meta: {
        activeSprintName: activeSprint?.name || null,
        projectKey: activeSprint?.project_key || null,
      },
    });
  } catch (err) {
    console.error('[/api/overview/data] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
