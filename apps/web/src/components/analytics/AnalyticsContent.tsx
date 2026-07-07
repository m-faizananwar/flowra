"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Target, Activity, Zap, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { createClient } from "@supabase/supabase-js";
import { ArchiveAndBacklog } from "../board/ArchiveAndBacklog";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  "Done":        { color: "text-emerald-400", icon: CheckCircle2, label: "Done" },
  "In Progress": { color: "text-blue-400",    icon: Clock,        label: "In Progress" },
  "To Do":       { color: "text-white/40",    icon: AlertCircle,  label: "To Do" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { color: "text-white/40", icon: AlertCircle, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

export function AnalyticsContent() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [isBoardExpanded, setIsBoardExpanded] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/sprints/data', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up Realtime listener for live updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('jira-live-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jira_issues' },
        () => {
          console.log('Realtime update detected: Syncing dashboard...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[1.5px] opacity-20" />
          <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Aggregating</p>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#24FF7C]">Sprint Telemetry</p>
        </div>
      </div>
    );
  }

  const sprint = data?.activeSprint;
  const metrics = sprint?.sprint_metrics?.[sprint.sprint_metrics.length - 1];
  const issues: any[] = data?.jiraIssues || [];
  const pastSprints: any[] = data?.pastSprints || [];

  const hasNoData = !sprint;

  // Helper: Bucket issues into board columns
  const getBoardData = () => {
    const columns = {
      todo: [] as any[],
      inprogress: [] as any[],
      done: [] as any[]
    };

    issues.forEach(issue => {
      // ONLY show issues in the live board if they belong to the active sprint
      if (sprint?.jira_sprint_id && issue.sprint_jira_id !== sprint.jira_sprint_id) {
        return;
      }

      const s = (issue.status || "").toLowerCase();
      if (["done", "closed", "resolved", "completed"].includes(s)) {
        columns.done.push(issue);
      } else if (["in progress", "under review", "development", "testing", "blocked", "progress"].some(kw => s.includes(kw))) {
        columns.inprogress.push(issue);
      } else {
        columns.todo.push(issue);
      }
    });

    return columns;
  };

  const boardData = getBoardData();

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      
      // Trigger Fast Sync (No AI)
      await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ analysis_type: 'jira', sync_only: true })
      });
      
      // Now fetch the updated data
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <PageTransition pageTitle="Sprint Analytics">
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div>
            <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
              SPRINT ANALYTICS
            </h1>
            <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">
              {sprint ? `Active: ${sprint.name} · ${sprint.project_key}` : 'No active sprint found'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
              <button 
                onClick={() => setViewMode("list")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode("board")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === "board" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                Board
              </button>
            </div>
            <button 
              onClick={handleManualRefresh} 
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(36,255,124,0.15)] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
              {isLoading ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* No Data Banner */}
        {hasNoData && (
          <motion.div variants={staggerItem} className="p-8 rounded-[2rem] bg-[#24FF7C]/5 border border-[#24FF7C]/10 text-center">
            <Zap className="w-10 h-10 text-[#24FF7C]/40 mx-auto mb-3" />
            <p className="text-white/60 font-bold">No active sprint data yet.</p>
            <p className="text-white/30 text-sm mt-1">Click &quot;Sync Jira Now&quot; on the Jira page to pull your first sprint.</p>
          </motion.div>
        )}

        {/* KPI Cards */}
        {metrics && (
          <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Velocity",   value: `${metrics.velocity}%`,       icon: Zap,    color: "text-blue-400",    border: "border-blue-500/20",    grad: "from-blue-500/20 to-blue-500/5" },
              { label: "Done",       value: `${metrics.completed_issues}/${metrics.total_issues}`, icon: CheckCircle2, color: "text-purple-400", border: "border-purple-500/20", grad: "from-purple-500/20 to-purple-500/5" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className={`rounded-[2rem] bg-gradient-to-br ${kpi.grad} border border-white/5 p-6`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border ${kpi.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                  <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">{kpi.value}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Dynamic Content: List vs Board */}
        {issues.length > 0 && (
          <motion.div variants={staggerItem} className="space-y-4">
            {/* Board Accordion Toggle */}
            <button 
              onClick={() => setIsBoardExpanded(!isBoardExpanded)}
              className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group"
            >
              <div className={`transition-transform duration-300 ${isBoardExpanded ? "rotate-180" : ""}`}>
                <RefreshCw className="w-4 h-4 text-[#24FF7C]/60" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/70">Live Sprint Board</span>
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter italic">
                {isBoardExpanded ? "Click to Collapse" : "Click to Expand"}
              </span>
            </button>

            {isBoardExpanded && (
              <div className="mt-4">
                {viewMode === "list" ? (
                  <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Sprint Issues ({issues.length})</p>
                    <div className="space-y-2">
                      {issues.map((issue: any) => (
                        <div key={issue.issue_key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[#24FF7C] font-mono">{issue.issue_key}</span>
                            <span className="text-sm text-white/70 font-medium truncate max-w-xs">{issue.summary}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {issue.assignee_name && (
                              <span className="text-[10px] text-white/30 hidden sm:block">{issue.assignee_name}</span>
                            )}
                            <StatusBadge status={issue.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columns */}
                    {[
                      { id: "todo",       label: "To Do",       items: boardData.todo,       color: "bg-white/5" },
                      { id: "inprogress", label: "In Progress", items: boardData.inprogress, color: "bg-blue-500/5" },
                      { id: "done",       label: "Done",       items: boardData.done,       color: "bg-emerald-500/5" }
                    ].map((col) => (
                      <div key={col.id} className={`flex flex-col gap-4 p-5 rounded-[2.5rem] ${col.color} border border-white/5 min-h-[400px]`}>
                        <div className="flex items-center justify-between px-3 mb-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white/60 italic">{col.label}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40">
                            {col.items.length}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {col.items.map((item: any) => (
                            <motion.div 
                              layoutId={item.issue_key}
                              key={item.issue_key}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-[#24FF7C] tracking-tighter italic">{item.issue_key}</span>
                                {item.assignee_name && (
                                  <div className="w-5 h-5 rounded-full bg-[#24FF7C]/20 border border-[#24FF7C]/40 flex items-center justify-center text-[8px] font-black text-[#24FF7C] uppercase">
                                    {item.assignee_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-white/80 font-medium leading-relaxed group-hover:text-white transition-colors">
                                {item.summary}
                              </p>
                              <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                  {item.status}
                                </span>
                                <Zap className="w-3 h-3 text-[#24FF7C]/30" />
                              </div>
                            </motion.div>
                          ))}
                          {col.items.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                              <Target className="w-8 h-8 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-center">Empty</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Inventory & Roadmap (History + Backlog) Section */}
        <ArchiveAndBacklog issues={issues} />

        {/* Velocity History */}
        {pastSprints.length > 0 && (
          <motion.div variants={staggerItem} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
            <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Past Sprint Velocity</p>
            <div className="space-y-2">
              {pastSprints.map((s: any) => {
                const m = s.sprint_metrics?.[s.sprint_metrics.length - 1];
                const v = m?.velocity ?? 0;
                return (
                  <div key={s.jira_sprint_id} className="flex items-center gap-4">
                    <span className="text-[10px] text-white/40 w-24 shrink-0 truncate">{s.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5">
                      <div className="h-2 rounded-full bg-[#24FF7C] transition-all" style={{ width: `${v}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-[#24FF7C] w-10 text-right">{v}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div variants={staggerItem} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
            Error loading sprint data: {error}
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

