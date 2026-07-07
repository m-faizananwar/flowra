"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, 
    CheckCircle2, 
    MessageSquare, 
    RefreshCw,
    Zap,
    Layout,
    Cpu,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const PRIORITY_COLORS: Record<string, string> = {
    highest: "text-red-400 bg-red-500/10 border-red-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const COLUMN_COLORS: Record<string, { dot: string; badge: string; card: string }> = {
    "To Do":      { dot: "bg-white/20",      badge: "border-white/20 text-white/50",       card: "hover:border-white/20" },
    "In Progress":{ dot: "bg-[#F59E0B]",     badge: "border-[#F59E0B]/40 text-[#F59E0B]",  card: "hover:border-[#F59E0B]/30" },
    "In Review":  { dot: "bg-blue-400",      badge: "border-blue-400/40 text-blue-400",     card: "hover:border-blue-400/30" },
    "Done":       { dot: "bg-[#24FF7C]",     badge: "border-[#24FF7C]/40 text-[#24FF7C]",  card: "hover:border-[#24FF7C]/30" },
};

/** Normalize any Jira status string to our 4 canonical column names */
function normalizeStatus(raw: string): string {
    const s = (raw || "").toLowerCase().trim();
    if (["done", "closed", "resolved", "completed", "deployed", "released"].some(k => s.includes(k))) return "Done";
    if (["review", "testing", "qa", "quality assurance", "code review"].some(k => s.includes(k))) return "In Review";
    if (["progress", "development", "active", "started", "in progress"].some(k => s.includes(k))) return "In Progress";
    return "To Do";
}

function TaskCard({ task, i, columnStyle }: { task: any; i: number; columnStyle: string }) {
    const priority = (task.priority || "medium").toLowerCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className={cn(
                "p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 transition-all cursor-pointer group relative overflow-hidden shadow-xl",
                columnStyle
            )}
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.03] blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{task.issue_key}</span>
                <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium)}>
                    {task.priority || "Medium"}
                </div>
            </div>

            <h4 className="text-[13px] font-bold text-white mb-5 group-hover:text-white/90 transition-colors leading-snug min-h-[36px] line-clamp-2 relative z-10">
                {task.summary}
            </h4>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/20">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-black">{task.comments || 0}</span>
                    </div>
                    {task.story_points && (
                        <div className="flex items-center gap-1.5 text-[#24FF7C]/40">
                            <Zap className="w-3 h-3" />
                            <span className="text-[10px] font-black">{task.story_points} SP</span>
                        </div>
                    )}
                </div>
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/50 uppercase">
                    {(task.assignee_name || "??").slice(0, 2)}
                </div>
            </div>
        </motion.div>
    );
}

const ORDERED_COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

export function KanbanBoard() {
    const [allIssues, setAllIssues] = useState<any[]>([]);
    const [activeSprint, setActiveSprint] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"board" | "list">("board");

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [sprintRes, issuesRes] = await Promise.all([
                supabase
                    .from("sprints")
                    .select("id, name, jira_sprint_id, project_key, start_date, end_date, goal")
                    .eq("user_id", user.id)
                    .eq("state", "active")
                    .order("last_synced_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from("jira_issues")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("updated_at", { ascending: false }),
            ]);

            if (issuesRes.error) throw issuesRes.error;
            setAllIssues(issuesRes.data || []);
            setActiveSprint(sprintRes.data || null);
        } catch (err: any) {
            toast.error("Failed to load Scrum board data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(fetchData);

        const channel = supabase
            .channel('jira-board-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jira_issues' }, () => {
                fetchData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    /** Filter to ONLY the active sprint's issues using String() coercion to avoid type mismatch */
    const sprintIssues = useMemo(() => {
        if (!activeSprint?.jira_sprint_id) return allIssues;
        return allIssues.filter(i => String(i.sprint_jira_id) === String(activeSprint.jira_sprint_id));
    }, [allIssues, activeSprint]);

    /** Group sprint issues into the 4 canonical columns */
    const boardData = useMemo(() => {
        const columns: Record<string, any[]> = {
            "To Do": [], "In Progress": [], "In Review": [], "Done": []
        };
        for (const issue of sprintIssues) {
            const col = normalizeStatus(issue.status);
            columns[col].push(issue);
        }
        return columns;
    }, [sprintIssues]);

    const completionPct = useMemo(() => {
        const total = sprintIssues.length;
        if (!total) return 0;
        return Math.round((boardData["Done"].length / total) * 100);
    }, [sprintIssues, boardData]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Synchronizing Sprint Board...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Agile Board">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="h-full flex flex-col space-y-8">

                {/* ── Board Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            {activeSprint?.name ? activeSprint.name.toUpperCase() : "SCRUM ANALYTICS"}
                        </h1>
                        <p className="text-[11px] font-black text-[#24FF7C] uppercase tracking-[0.3em] mt-1 italic">
                            {activeSprint ? `Live Sprint · ${completionPct}% Complete · ${sprintIssues.length} Issues` : "No Active Sprint Found"}
                        </p>
                        {activeSprint?.goal && (
                            <p className="text-xs text-white/30 mt-1 italic max-w-lg">Goal: {activeSprint.goal}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                            <button
                                onClick={() => setViewMode("board")}
                                className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "board" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
                            >
                                Board
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white")}
                            >
                                List
                            </button>
                        </div>
                        <button
                            onClick={fetchData}
                            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:rotate-180 duration-500"
                        >
                            <RefreshCw className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                </div>

                {/* ── Sprint completion bar ── */}
                {sprintIssues.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Sprint Progress</span>
                            <span className="text-[#24FF7C]">{boardData["Done"].length} / {sprintIssues.length} Done</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-[#24FF7C] shadow-[0_0_10px_rgba(36,255,124,0.5)]"
                            />
                        </div>
                    </div>
                )}

                {/* ── Board View ── */}
                {viewMode === "board" && (
                    <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
                        <div className="flex gap-6 h-full min-w-max px-1">
                            {ORDERED_COLUMNS.map((column) => {
                                const style = COLUMN_COLORS[column] || COLUMN_COLORS["To Do"];
                                return (
                                    <div key={column} className="w-80 flex flex-col gap-4">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2 h-2 rounded-full", style.dot)} />
                                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">{column}</h3>
                                                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border", style.badge)}>
                                                    {boardData[column]?.length || 0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-3 h-[calc(100vh-340px)] overflow-y-auto p-3 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/[0.04] custom-scrollbar">
                                            <AnimatePresence mode="popLayout">
                                                {boardData[column]?.map((task, i) => (
                                                    <TaskCard key={task.issue_key} task={task} i={i} columnStyle={style.card} />
                                                ))}
                                            </AnimatePresence>

                                            {boardData[column]?.length === 0 && (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-20 py-10">
                                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-white/20" />
                                                    </div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest italic">Empty</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── List View ── */}
                {viewMode === "list" && (
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2 mb-4">
                            Sprint Issues ({sprintIssues.length})
                        </div>
                        {ORDERED_COLUMNS.map(column => (
                            boardData[column].length > 0 && (
                                <div key={column} className="space-y-1">
                                    <div className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-2", COLUMN_COLORS[column]?.badge.split(' ')[2])}>
                                        {column} · {boardData[column].length}
                                    </div>
                                    {boardData[column].map(task => {
                                        const style = COLUMN_COLORS[column] || COLUMN_COLORS["To Do"];
                                        return (
                                            <div key={task.issue_key} className={cn("flex items-center justify-between px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all", style.card)}>
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest shrink-0 border px-2 py-0.5 rounded", style.badge)}>{task.issue_key}</span>
                                                    <p className="text-sm font-bold text-white truncate">{task.summary}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {task.assignee_name && <span className="text-[10px] text-white/30 uppercase">{task.assignee_name}</span>}
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border", style.badge)}>{task.status}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ))}
                        {sprintIssues.length === 0 && (
                            <div className="flex items-center justify-center py-20 text-white/20 text-sm italic uppercase tracking-widest">
                                No issues in active sprint
                            </div>
                        )}
                    </div>
                )}

            </motion.div>
        </PageTransition>
    );
}
