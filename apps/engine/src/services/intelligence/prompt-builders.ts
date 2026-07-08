import { compactJson } from "./json-utils";

function sharedContextBlock(context) {
  return `
PROJECT MEMORY (orientation only; do not use as direct scoring evidence):
${context.projectMemoryText || "No prior project memory is available yet."}

ASSESSMENT WINDOW:
${context.windowStart} to ${context.windowEnd}

CANONICAL MEMBER IDENTITY MAP:
${compactJson(context.identityMap)}

DAILY EVIDENCE CHUNKS:
${compactJson(context.chunks)}
`.trim();
}

function buildRiskPrompt(context) {
  return `
You are Flowra's project risk analyst. Your primary directive is to identify tactical and systemic risks across the project.

Strategic Directives:
- CODEBASE HEALTH: Analyze GitHub evidence for [BUILD] failures, [CI/CD] bottlenecks, and frequent [PR] reverts. Identify "hot files" or repositories with high bug density based on commit patterns and issue activity.
- DELIVERY VECTORS: Identify potential deadline misses or throughput drops based on activity velocity.
- TEAM SYNC: Detect communication gaps or misalignment in chat chunks.

Rules:
- Use only DAILY EVIDENCE CHUNKS as evidence for risks.
- Use PROJECT MEMORY only to understand what the project is about.
- Return strict JSON only.
- Every risk must cite evidence_refs from the provided chunks.
- For codebase risks, specify the affected repository UUID in affected_repo_ids.

${sharedContextBlock(context)}

Return this JSON shape:
{
  "risks": [
    {
      "title": "short risk title (e.g. Build Instability in [Repo Name])",
      "description": "what could go wrong and why",
      "category": "project|delivery|quality|security|communication|process",
      "severity": "low|medium|high|critical",
      "confidence": 0.0,
      "affected_member_ids": ["member uuid"],
      "affected_repo_ids": ["repository uuid"],
      "recommendations": ["actionable tactical recommendation"],
      "evidence_refs": [{"type":"context_chunk","id":"chunk uuid","summary":"why this evidence matters"}]
    }
  ]
}
`.trim();
}

function buildEvaluationPrompt(context) {
  return `
You are Flowra's member evaluation analyst.

Rules:
- Score each listed member from 0 to 100 for each of their APPLICABLE METRICS only.
- Each member has their own metric set based on their role (see MEMBER EVALUATION SPECS).
- Use only DAILY EVIDENCE CHUNKS from the assessment window as scoring evidence.
- Project memory is orientation only and must not create credit or penalty by itself.
- If a member has no evidence in the window, assign a score of 0 with that limitation stated (No activity observed).
- Return strict JSON only.
- Every metric rationale should cite evidence_refs where possible.

${sharedContextBlock(context)}

MEMBER EVALUATION SPECS (each member's role and their applicable metrics):
${compactJson(context.memberEvalSpecs || [])}

Return this JSON shape — include every member_id from MEMBER EVALUATION SPECS, using only their applicable_metrics:
{
  "evaluations": [
    {
      "member_id": "member uuid",
      "summary": "brief daily evaluation summary",
      "metrics": [
        {
          "metric_id": "metric uuid",
          "name": "metric name",
          "score": 0,
          "rationale": "evidence-bound rationale",
          "evidence_refs": [{"type":"context_chunk","id":"chunk uuid","summary":"why this evidence matters"}]
        }
      ]
    }
  ]
}
`.trim();
}

function buildMemoryPrompt(context) {
  return `
You are Flowra's project memory maintainer.

Update the rolling project memory using the previous memory and today's compact evidence.
This memory is for future orientation, not for direct member scoring.
Return strict JSON only.

PREVIOUS MEMORY:
${context.projectMemoryText || "No previous memory."}

TODAY'S EVIDENCE CHUNKS:
${compactJson(context.chunks)}

Return this JSON shape:
{
  "project_summary": "",
  "completed_work": "",
  "remaining_work": "",
  "decisions": "",
  "open_blockers": "",
  "recurring_risks": "",
  "source_refs": [{"type":"context_chunk","id":"chunk uuid","summary":"source"}]
}
`.trim();
}

function buildJiraPrompt(context) {
  // 1. Build a readable summary of Jira cards known from D1 enrichment
  let jiraCardContext = "";
  if (context.jiraCards && Object.keys(context.jiraCards).length > 0) {
    jiraCardContext = "\n\nKNOWN JIRA CARD DETAILS (live from Jira):\n";
    for (const [key, card] of Object.entries(context.jiraCards)) {
      const c: any = card;
      jiraCardContext += `\n• ${key}: "${c.summary}" | Status: ${c.status} | Priority: ${c.priority || "Medium"}`;
      if (c.assigneeName) jiraCardContext += ` | Assignee: ${c.assigneeName}`;
      if (c.description) jiraCardContext += `\n  Description: ${c.description.slice(0, 200)}`;
    }
  } else {
    jiraCardContext = "\n\nNo Jira card details available (identify cards from issue keys or semantic matching).";
  }

  // 2. Build full available task menu for Zero-Key semantic matching
  let availableTaskMenu = "";
  if (context.availableCards && context.availableCards.length > 0) {
    availableTaskMenu = "\n\nAVAILABLE PROJECT TASK MENU (for semantic matching when no key is mentioned):\n";
    context.availableCards.forEach((card) => {
      availableTaskMenu += `• ${card.issue_key}: "${card.summary}" | Status: ${card.status}`;
      if (card.assignee_name) availableTaskMenu += ` | Assignee: ${card.assignee_name}`;
      availableTaskMenu += `\n`;
    });
  }

  // 3. Active sprint context so the AI understands current delivery state
  let sprintContext = "";
  if (context.sprintSummary) {
    sprintContext = `\n\nACTIVE SPRINT CONTEXT:\n${context.sprintSummary}`;
  }

  // 4. Rejection memory to prevent the AI from re-suggesting what humans already declined
  let rejectedHistoryBlock = "";
  if (context.rejectedHistory && context.rejectedHistory.length > 0) {
    rejectedHistoryBlock = "\n\nREJECTED DECISIONS HISTORY (Do NOT re-suggest unless substantial NEW evidence exists after the rejection timestamp):\n";
    context.rejectedHistory.forEach((r) => {
      rejectedHistoryBlock += `• ${r.issue_key} → ${r.target_status} (Rejected at: ${r.rejected_at})\n`;
    });
  }

  return `
You are Flowra's Jira Agile Orchestrator. Your job is to analyze recent GitHub and chat activity and suggest precise, evidence-backed Jira card transitions.

════════════════════════════════════════
PHASE 1 — CHAIN OF THOUGHT (Internal Reasoning)
Before producing JSON, reason step-by-step through the evidence:

For each piece of evidence in the DAILY EVIDENCE CHUNKS:
  1. Identify: Who performed the action? (use CANONICAL MEMBER IDENTITY MAP to resolve names)
  2. Identify: What was the action? (commit, PR open/merge/close, chat message, branch creation)
  3. Map: Does this action clearly relate to a known Jira card (by key in text) or semantically match a card in the AVAILABLE PROJECT TASK MENU?
  4. Determine: What transition does this imply?
     - Branch created / PR opened → TO DO → IN PROGRESS
     - PR merged (merged:true) → IN PROGRESS → DONE
     - PR closed without merge (merged:false) → IN PROGRESS → TO DO (blocked/abandoned)
     - User says "finished", "deployed", "done" → → DONE
     - User says "pausing", "blocked", "reverting" → → TO DO
  5. Check: Is the card already in the target status? If yes, skip.
  6. Check: Is this transition in the REJECTED HISTORY? If yes, skip unless there is new evidence AFTER the rejection timestamp.
  7. Confirm: Do you have at least ONE specific, citable evidence chunk (with its ID) to back this transition?
════════════════════════════════════════

PHASE 2 — OUTPUT RULES:
- Every transition MUST have at least one evidence_ref with a non-empty summary explaining WHY this evidence implies the transition.
- The "reason" field MUST follow this format: "[Actor name] [action verb] [what they did] based on [evidence source]. This implies [card] should move to [status]."
  Example: "m-faizananwar merged PR #12 'Fix authentication bug' into main. This implies PROJ-7 should move to Done."
- "confidence" must reflect how certain you are (0.0-1.0). Use 0.9+ only for explicit PR merges. Use 0.6-0.8 for semantic matches.
- ZERO-KEY MATCHING: If no issue key is in the evidence but the work clearly matches a card, use semantic matching and lower confidence (0.5-0.7).
- Do NOT suggest transitions for cards already in the target status.
- Do NOT re-suggest transitions from REJECTED DECISIONS HISTORY without new post-rejection evidence.

════════════════════════════════════════
PHASE 3 — NEW TASK DETECTION:
After processing all transitions, scan the evidence for any work that was discussed but has NO match in the AVAILABLE PROJECT TASK MENU and does NOT match any existing Jira card.

Rules for creating new tasks:
- The discussed work must be CONCRETE and ACTIONABLE (not casual conversation).
- The work must be NEW — not already tracked in any form in the AVAILABLE PROJECT TASK MENU.
- Examples that SHOULD trigger a creation:
  * "We need to add push notification support" (new feature discussed in a team chat)
  * "I found a bug in the payment gateway, creating a fix now" (new bug mentioned with no existing ticket)
- Examples that should NOT trigger a creation:
  * "I finished working on the login page" (existing work, this is a transition, not a creation)
  * "Good morning, see you at standup" (casual chat, no actionable work)
- For issue_type, infer from context: "Bug" for defects, "Story" for features, "Task" for general work.
- For priority, infer from urgency: "Highest"/"High" if someone says "urgent", "critical", "blocking". Default to "Medium".
- Use confidence 0.5-0.7 for new tasks (creation is always less certain than a transition).
- Return ONLY valid JSON — no markdown, no commentary.
════════════════════════════════════════
${jiraCardContext}
${availableTaskMenu}
${sprintContext}
${rejectedHistoryBlock}

${sharedContextBlock(context)}

Return this JSON shape:
{
  "transitions": [
    {
      "issue_key": "PROJ-123",
      "target_status": "Done",
      "confidence": 0.95,
      "reason": "m-faizananwar merged PR #12 'Fix login bug' into main (merged:true). This implies PROJ-7 should move to Done as the associated work is complete.",
      "evidence_refs": [
        {
          "type": "context_chunk",
          "id": "chunk-uuid-here",
          "summary": "PR #12 merged into main by m-faizananwar at 2026-05-07T03:15Z — explicit merge event confirming task completion."
        }
      ]
    }
  ],
  "creations": [
    {
      "summary": "Add push notification support for mobile users",
      "description": "Team discussed the need for push notifications in the Telegram standup. No existing card tracks this work.",
      "issue_type": "Story",
      "priority": "Medium",
      "confidence": 0.65,
      "reason": "m-faizananwar mentioned 'we need push notifications for the app' in the team chat on 2026-05-07. No existing Jira card was found for this feature.",
      "evidence_refs": [
        {
          "type": "context_chunk",
          "id": "chunk-uuid-here",
          "summary": "Telegram message from m-faizananwar explicitly requesting push notification feature with no existing ticket found."
        }
      ]
    }
  ]
}
`.trim();
}

export {
  buildRiskPrompt,
  buildEvaluationPrompt,
  buildMemoryPrompt,
  buildJiraPrompt,
};
