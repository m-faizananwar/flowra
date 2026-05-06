"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    History, 
    Archive, 
    ChevronDown, 
    ChevronUp, 
    Clock, 
    CheckCircle2,
    Zap,
    MessageSquare,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: any;
    i: number;
}

const PRIORITY_COLORS: Record<string, string> = {
    highest: "text-red-400 bg-red-500/10 border-red-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function TaskCard({ task, i }: TaskCardProps) {
    const priority = (task.priority || "medium").toLowerCase();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default group"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{task.issue_key}</span>
                <div className={cn("px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border", PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium)}>
                    {task.priority || "Medium"}
                </div>
            </div>
            <h5 className="text-[12px] font-bold text-white/70 group-hover:text-white transition-colors leading-tight mb-3">
                {task.summary}
            </h5>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 opacity-30">
                    <div className="flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span className="text-[9px] font-bold">{task.comments || 0}</span>
                    </div>
                </div>
                <div className="text-[9px] font-bold text-white/20 italic">
                    {task.status}
                </div>
            </div>
        </motion.div>
    );
}

interface ArchiveAndBacklogProps {
    issues: any[];
}

export function ArchiveAndBacklog({ issues }: ArchiveAndBacklogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const data = useMemo(() => {
        const completed: any[] = [];
        const backlog: any[] = [];

        issues.forEach(issue => {
            const status = (issue.status || "").toLowerCase();
            const isDone = ["done", "closed", "resolved", "completed", "finalized"].includes(status);
            const hasSprintAssignment = !!(issue.sprint_name || issue.sprint_jira_id);

            // RULE 1: All DONE cards go to History (no matter what)
            if (isDone) {
                completed.push(issue);
            } 
            // RULE 2: Not Done AND No Sprint = Backlog
            else if (!hasSprintAssignment) {
                backlog.push(issue);
            }
            // (Cards that are NOT Done but HAVE a sprint are in the Live Board above)
        });

        // Filter by search
        const filterFn = (i: any) => 
            i.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
            i.issue_key.toLowerCase().includes(searchQuery.toLowerCase());

        return {
            completed: completed.filter(filterFn),
            backlog: backlog.filter(filterFn)
        };
    }, [issues, searchQuery]);

    return (
        <div className="mt-12 space-y-4">
            {/* Toggle Header */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group mt-8"
            >
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <Archive className="w-4 h-4 text-[#24FF7C]/60" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/70">Inventory & Roadmap</span>
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] ml-2">
                    {data.completed.length} Done · {data.backlog.length} Backlog
                </span>
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter italic">
                    {isOpen ? "Click to Collapse" : "Click to Expand"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search archive or backlog..."
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Completed Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Completed History</h4>
                                    </div>
                                    <div className="h-[400px] overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-3">
                                        {data.completed.map((task, i) => (
                                            <TaskCard key={task.issue_key} task={task} i={i} />
                                        ))}
                                        {data.completed.length === 0 && (
                                            <div className="flex-1 flex items-center justify-center border border-dashed border-white/[0.03] rounded-3xl opacity-20">
                                                <p className="text-[10px] font-black uppercase tracking-widest italic">No finished records</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Backlog Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Project Backlog</h4>
                                    </div>
                                    <div className="h-[400px] overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-3">
                                        {data.backlog.map((task, i) => (
                                            <TaskCard key={task.issue_key} task={task} i={i} />
                                        ))}
                                        {data.backlog.length === 0 && (
                                            <div className="flex-1 flex items-center justify-center border border-dashed border-white/[0.03] rounded-3xl opacity-20">
                                                <p className="text-[10px] font-black uppercase tracking-widest italic">Backlog cleared</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
