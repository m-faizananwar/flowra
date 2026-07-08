"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import {
  CheckCircle2, Clock, AlertCircle, RefreshCw, Zap, Target,
  ChevronDown, LayoutGrid, List, TrendingUp, Activity,
  Loader2, CircleDot, Circle
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { ArchiveAndBacklog } from "../board/ArchiveAndBacklog";

// ─── Column config ────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    icon: Circle,
    accent: "text-white/50",
    dotColor: "bg-white/30",
    headerBg: "bg-white/[0.04]",
    cardBorder: "border-white/[0.07]",
    cardHover: "hover:border-white/20 hover:bg-white/[0.05]",
    countBg: "bg-white/[0.06] text-white/40",
    emptyIcon: "text-white/10",
  },
  {
    id: "inprogress",
    label: "In Progress",
    icon: Clock,
    accent: "text-blue-400",
    dotColor: "bg-blue-400",
    headerBg: "bg-blue-500/[0.07]",
    cardBorder: "border-blue-500/[0.12]",
    cardHover: "hover:border-blue-400/30 hover:bg-blue-500/[0.06]",
    countBg: "bg-blue-500/10 text-blue-400/70",
    emptyIcon: "text-blue-400/20",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    accent: "text-emerald-400",
    dotColor: "bg-emerald-400",
    headerBg: "bg-emerald-500/[0.07]",
    cardBorder: "border-emerald-500/[0.12]",
    cardHover: "hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]",
    countBg: "bg-emerald-500/10 text-emerald-400/70",
    emptyIcon: "text-emerald-400/20",
  },
];

// ─── Issue card ───────────────────────────────────────────────────────────────
function IssueCard({ item, col, index }: { item: any; col: typeof COLUMNS[0]; index: number }) {
  const Icon = col.icon;
  return (
    <motion.div
      layoutId={item.issue_key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 28 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`p-4 rounded-2xl bg-white/[0.03] border ${col.cardBorder} ${col.cardHover} transition-all duration-200 cursor-pointer group`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[10px] font-semibold font-mono ${col.accent} opacity-70`}>
          {item.issue_key}
        </span>
        {item.assignee_name && (
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[7px] font-black uppercase ${col.countBg} border-current/20 shrink-0`}>
            {item.assignee_name.charAt(0)}
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-[12px] text-white/70 font-medium leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor} opacity-70`} />
        <span className={`text-[10px] font-medium ${col.accent} opacity-60`}>
          {item.status}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Board Column ─────────────────────────────────────────────────────────────
function BoardColumn({ col, items }: { col: typeof COLUMNS[0]; items: any[] }) {
  const Icon = col.icon;
  return (
    <motion.div
      variants={staggerItem}
      className="flex flex-col rounded-[1.75rem] bg-white/[0.02] border border-white/[0.06] overflow-hidden min-h-[440px]"
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between px-5 py-4 ${col.headerBg} border-b border-white/[0.05]`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
          <h3 className={`text-[12px] font-bold tracking-wide ${col.accent}`}>
            {col.label}
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.countBg}`}>
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar scrollbar-none">
        {items.length > 0 ? (
          items.map((item, i) => <IssueCard key={item.issue_key} item={item} col={col} index={i} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-3 opacity-30">
            <Icon className={`w-8 h-8 ${col.emptyIcon}`} />
            <p className="text-xs font-semibold text-white/30">Empty</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bgColor, borderColor }: any) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border ${borderColor} p-5 flex flex-col gap-3`}
      style={{ background: bgColor }}
    >
      <div className={`w-9 h-9 rounded-xl border ${borderColor} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-white/40 mb-1">{label}</p>
        <p className={`text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight ${color}`}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-white/25 mt-1 font-bold">{sub}</p>}
      </div>
      {/* subtle glow */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${color.replace("text-", "bg-")} opacity-[0.08] blur-2xl pointer-events-none`} />
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyticsContent() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
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
      const res = await fetch("/api/sprints/data", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
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
    Promise.resolve().then(fetchData);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const channel = supabase
      .channel("jira-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "jira_issues" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ analysis_type: "jira", sync_only: true }),
      });
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <AnimatedLoader />;

  const sprint = data?.activeSprint;
  const metrics = sprint?.sprint_metrics?.[sprint.sprint_metrics.length - 1];
  const issues: any[] = data?.jiraIssues || [];
  const pastSprints: any[] = data?.pastSprints || [];

  const getBoardData = () => {
    const columns = { todo: [] as any[], inprogress: [] as any[], done: [] as any[] };
    issues.forEach(issue => {
      if (sprint?.jira_sprint_id && issue.sprint_jira_id !== sprint.jira_sprint_id) return;
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
  const maxVelocity = Math.max(...pastSprints.map((s: any) => s.sprint_metrics?.[s.sprint_metrics.length - 1]?.velocity ?? 0), 1);

  return (
    <PageTransition pageTitle="Sprint Analytics">
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-16">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight">
              Sprint Analytics
            </h1>
            <p className="text-xs font-medium text-white/35 mt-1.5">
              {sprint ? `Active · ${sprint.name} · ${sprint.project_key}` : "No active sprint"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.07]">
              {([["board", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  whileTap={{ scale: 0.94 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === mode
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode}
                </motion.button>
              ))}
            </div>

            {/* Refresh */}
            <motion.button
              onClick={handleManualRefresh}
              disabled={isSyncing || isLoading}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/10 hover:text-white/80 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing…" : "Refresh"}
            </motion.button>
          </div>
        </motion.div>

        {/* ── No Data ────────────────────────────────────────────────────── */}
        {!sprint && (
          <motion.div variants={staggerItem} className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-14 h-14 rounded-2xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#24FF7C]/50" />
            </div>
            <p className="text-white/50 font-bold text-sm">No active sprint found</p>
            <p className="text-white/25 text-xs text-center max-w-xs">
              Sync Jira on the Jira page to pull your first sprint into Flowra.
            </p>
          </motion.div>
        )}

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        {metrics && (
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Velocity"
              value={`${metrics.velocity}%`}
              sub="Sprint completion rate"
              icon={TrendingUp}
              color="text-blue-400"
              bgColor="rgba(59,130,246,0.04)"
              borderColor="border-blue-500/15"
            />
            <KpiCard
              label="Completed"
              value={metrics.completed_issues}
              sub={`of ${metrics.total_issues} issues`}
              icon={CheckCircle2}
              color="text-emerald-400"
              bgColor="rgba(16,185,129,0.04)"
              borderColor="border-emerald-500/15"
            />
            <KpiCard
              label="In Progress"
              value={boardData.inprogress.length}
              sub="Active issues"
              icon={Activity}
              color="text-amber-400"
              bgColor="rgba(245,158,11,0.04)"
              borderColor="border-amber-500/15"
            />
            <KpiCard
              label="Backlog"
              value={boardData.todo.length}
              sub="Pending issues"
              icon={CircleDot}
              color="text-white/50"
              bgColor="rgba(255,255,255,0.02)"
              borderColor="border-white/8"
            />
          </motion.div>
        )}

        {/* ── Live Board ─────────────────────────────────────────────────── */}
        {issues.length > 0 && (
          <motion.div variants={staggerItem} className="space-y-4">
            {/* Accordion Toggle */}
            <motion.button
              onClick={() => setIsBoardExpanded(!isBoardExpanded)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.997 }}
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
            >
              <div className="w-2 h-2 rounded-full bg-[#24FF7C] shadow-[0_0_8px_rgba(36,255,124,0.6)]" />
              <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">
                Live Sprint Board
              </span>
              <span className="text-[10px] font-bold text-white/20 ml-1">
                ({issues.length} issues)
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <motion.div
                animate={{ rotate: isBoardExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              >
                <ChevronDown className="w-4 h-4 text-white/25" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isBoardExpanded && (
                <motion.div
                  key="board-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  {viewMode === "list" ? (
                    /* ── List View ──────────────────────────────────────── */
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      className="rounded-2xl bg-white/[0.02] border border-white/[0.07] overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                        <p className="text-xs font-semibold text-white/35">
                          All Issues · {issues.length}
                        </p>
                      </div>
                      <div className="divide-y divide-white/[0.04]">
                        {issues.map((issue: any, i: number) => {
                          const s = (issue.status || "").toLowerCase();
                          const isDone = ["done", "closed", "resolved", "completed"].includes(s);
                          const isInProg = ["in progress", "under review", "development", "testing", "blocked"].some(kw => s.includes(kw));
                          const col = isDone ? COLUMNS[2] : isInProg ? COLUMNS[1] : COLUMNS[0];
                          return (
                            <motion.div
                              key={issue.issue_key}
                              variants={staggerItem}
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                              className="flex items-center justify-between px-5 py-3.5 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`text-[10px] font-black font-mono shrink-0 ${col.accent}`}>
                                  {issue.issue_key}
                                </span>
                                <span className="text-sm text-white/60 font-medium truncate group-hover:text-white/80 transition-colors">
                                  {issue.summary}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 shrink-0 ml-4">
                                {issue.assignee_name && (
                                  <span className="text-[10px] text-white/25 hidden sm:block">{issue.assignee_name}</span>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                                  <span className={`text-[10px] font-medium ${col.accent} opacity-70`}>
                                    {issue.status}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Board View ─────────────────────────────────────── */
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                    >
                      {COLUMNS.map(col => (
                        <BoardColumn
                          key={col.id}
                          col={col}
                          items={(boardData as any)[col.id]}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Inventory & Roadmap ────────────────────────────────────────── */}
        <ArchiveAndBacklog issues={issues} />

        {/* ── Past Sprint Velocity ───────────────────────────────────────── */}
        {pastSprints.length > 0 && (
          <motion.div variants={staggerItem} className="rounded-2xl bg-white/[0.02] border border-white/[0.07] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center gap-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#24FF7C]/60" />
              <p className="text-xs font-semibold text-white/40">
                Past Sprint Velocity
              </p>
            </div>
            <div className="p-6 space-y-4">
              {pastSprints.map((s: any, i: number) => {
                const m = s.sprint_metrics?.[s.sprint_metrics.length - 1];
                const v = m?.velocity ?? 0;
                const pct = Math.round((v / maxVelocity) * 100);
                return (
                  <motion.div
                    key={s.jira_sprint_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-[10px] text-white/35 w-28 shrink-0 truncate font-bold">{s.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#24FF7C] to-[#3B82F6]"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06 + 0.2, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-[#24FF7C] w-9 text-right">{v}%</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <motion.div variants={staggerItem} className="p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400/80 text-sm font-bold">
            {error}
          </motion.div>
        )}

      </motion.div>
    </PageTransition>
  );
}

