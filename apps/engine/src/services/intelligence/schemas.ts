import { z } from "zod";

const EvidenceRefSchema = z.object({
  type: z.enum(["message", "github_event", "context_chunk", "memory"]).catch("context_chunk"),
  id: z.string().min(1).catch("unknown"),
  summary: z.string().optional().default(""),
});

const RiskResponseSchema = z.object({
  risks: z.array(z.object({
    title: z.string().min(3),
    description: z.string().min(8),
    category: z.string().min(2).default("project"),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    confidence: z.number().min(0).max(1).default(0.5),
    affected_member_ids: z.array(z.string()).default([]),
    affected_repo_ids: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
    evidence_refs: z.array(EvidenceRefSchema).default([]),
  })).default([]),
});

const EvaluationResponseSchema = z.object({
  evaluations: z.array(z.object({
    member_id: z.string().min(1),
    summary: z.string().default(""),
    metrics: z.array(z.object({
      metric_id: z.string().min(1),
      name: z.string().min(1),
      score: z.number().min(0).max(100),
      rationale: z.string().default(""),
      evidence_refs: z.array(EvidenceRefSchema).default([]),
    })).default([]),
  })).default([]),
});

const MemoryResponseSchema = z.object({
  project_summary: z.string().default(""),
  completed_work: z.string().default(""),
  remaining_work: z.string().default(""),
  decisions: z.string().default(""),
  open_blockers: z.string().default(""),
  recurring_risks: z.string().default(""),
  source_refs: z.array(EvidenceRefSchema).default([]),
});

const JiraResponseSchema = z.object({
  transitions: z.array(z.object({
    issue_key: z.string().min(1),
    target_status: z.string().min(1),
    reason: z.string().min(20),
    confidence: z.number().min(0).max(1).default(0.7),
    evidence_refs: z.array(z.object({
      type: z.enum(["message", "github_event", "context_chunk", "memory"]).catch("context_chunk"),
      id: z.string().min(1).catch("unknown"),
      summary: z.string().min(5).catch("evidence observed"),
    })).min(1),
  })).default([]),
  creations: z.array(z.object({
    summary: z.string().min(5),
    description: z.string().default(""),
    issue_type: z.string().default("Task"),
    priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).default("Medium"),
    reason: z.string().min(20),
    confidence: z.number().min(0).max(1).default(0.6),
    evidence_refs: z.array(z.object({
      type: z.enum(["message", "github_event", "context_chunk", "memory"]).catch("context_chunk"),
      id: z.string().min(1).catch("unknown"),
      summary: z.string().min(5).catch("evidence observed"),
    })).min(1),
  })).default([]),
});

export {
  EvidenceRefSchema,
  RiskResponseSchema,
  EvaluationResponseSchema,
  MemoryResponseSchema,
  JiraResponseSchema,
};
