// ============================================================
// @flowra/types — Single source of truth for shared types
// Used by both apps/web (Next.js) and apps/engine (Node.js)
// ============================================================

// ─── Integration ─────────────────────────────────────────────
export type ServiceName = 'github' | 'jira' | 'slack' | 'discord' | 'telegram';

export interface Integration {
  id: string;
  user_id: string;
  service_name: ServiceName;
  status: 'active' | 'inactive' | 'error';
  access_token?: string;
  refresh_token?: string;
  token_expiry?: string;
  installation_id?: number;
  workspace_id?: string;
  workspace_name?: string;
  bot_token?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// ─── Approval Request ────────────────────────────────────────
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export interface ApprovalRequest {
  id: string;
  user_id: string;
  integration_id: string;
  issue_key: string;
  issue_summary?: string;
  target_status: string;
  current_status: string;
  ai_reasoning?: string;
  status: ApprovalStatus;
  created_at: string;
  reviewed_at?: string;
}

// ─── Analysis Run ────────────────────────────────────────────
export type AnalysisType = 'risk' | 'evaluation' | 'provision_metrics' | 'jira' | 'jira_sync';

export interface AnalysisRun {
  id: string;
  user_id: string;
  analysis_type: AnalysisType;
  status: 'running' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
  started_at: string;
  completed_at?: string;
}

// ─── Integration Member ──────────────────────────────────────
export interface IntegrationMember {
  id: string;
  integration_id: string;
  user_id: string;
  external_id: string;
  external_username?: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  role?: string;
  merged_profile_id?: string;
  created_at: string;
}

// ─── API Responses ───────────────────────────────────────────
export interface ApiOkResponse {
  ok: true;
}

export interface ApiErrorResponse {
  error: string;
}

export type ApiResponse<T> = T | ApiErrorResponse;

// ─── Engine API Types ─────────────────────────────────────────
export interface GithubSyncRequest {
  integration_id: string;
  installation_id: number;
  user_id: string;
}

export interface AnalysisRunRequest {
  user_id: string;
  analysis_type: AnalysisType;
  sync_only?: boolean;
}

export interface JiraExecuteApprovalRequest {
  user_id: string;
  issue_key: string;
  target_status: string;
  approval_id?: string;
}
