"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    Paperclip, 
    MoreHorizontal,
    Plus,
    Filter,
    Search,
    RefreshCw,
    ShieldCheck,
    Zap,
    Layout,
    Columns,
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

const STATUS_ICONS: Record<string, any> = {
    "Done": CheckCircle2,
    "In Progress": Zap,
    "In Review": RefreshCw,
    "To Do": Clock,
};

function TaskCard({ task, i }: { task: any, i: number }) {
    const StatusIcon = STATUS_ICONS[task.status] || Clock;
    const priority = (task.priority || "medium").toLowerCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-[#24FF7C]/30 transition-all cursor-pointer group relative overflow-hidden active:scale-98 shadow-xl"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#24FF7C]/[0.05] blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn("w-3.5 h-3.5", task.status === 'In Progress' ? "text-[#24FF7C]" : "text-white/40")} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{task.issue_key}</span>
                </div>
                <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium)}>
                    {task.priority || "Medium"}
                </div>
            </div>

            <h4 className="text-[14px] font-bold text-white mb-6 group-hover:text-[#24FF7C] transition-colors leading-snug min-h-[40px]">
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

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/50 ring-2 ring-[#0A0C10] uppercase">
                    {(task.assignee_name || "??").slice(0, 2)}
                </div>
            </div>
        </motion.div>
    );
}

const SCRUM_COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

export function KanbanBoard() {
    const [issues, setIssues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [projectFilter, setProjectFilter] = useState("all");

    useEffect(() => {
        fetchIssues();

        // INSTALL THE LIVE PULSE: Subscribe to Realtime Updates
        const channel = supabase
            .channel('jira-board-live')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'jira_issues' 
            }, (payload) => {
                console.log('Jira Change Detected:', payload);
                fetchIssues(); // Refresh data when anything changes in DB
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchIssues = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("jira_issues")
                .select("*")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            setIssues(data || []);
        } catch (err: any) {
            toast.error("Failed to load Scrum board data");
        } finally {
            setIsLoading(false);
        }
    };

    const boardData = useMemo(() => {
        const columns: Record<string, any[]> = {
            "To Do": [],
            "In Progress": [],
            "In Review": [],
            "Done": []
        };

        const filtered = projectFilter === "all" 
            ? issues 
            : issues.filter(i => i.project_key === projectFilter);

        filtered.forEach(issue => {
            const status = issue.status || "To Do";
            // Map common Jira statuses to our columns
            let column = "To Do";
            if (["done", "closed", "resolved"].includes(status.toLowerCase())) column = "Done";
            else if (["in progress", "development", "active"].includes(status.toLowerCase())) column = "In Progress";
            else if (["in review", "testing", "quality assurance"].includes(status.toLowerCase())) column = "In Review";
            
            if (columns[column]) {
                columns[column].push(issue);
            } else {
                // If status doesn't match, put it in the closest column or keep it in To Do
                columns["To Do"].push(issue);
            }
        });

        return columns;
    }, [issues, projectFilter]);

    const projectOptions = useMemo(() => {
        const projects = [...new Set(issues.map(i => i.project_key))];
        return [
            { value: "all", label: "All Projects", icon: Layout },
            ...projects.map(p => ({ value: p, label: p, icon: Cpu }))
        ];
    }, [issues]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Synchronizing Neural Board...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Agile Board">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="h-full flex flex-col space-y-8"
            >
                {/* Board Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            SCRUM ANALYTICS
                        </h1>
                        <p className="text-[11px] font-black text-[#24FF7C] uppercase tracking-[0.3em] mt-1 italic">
                            Live 1:1 Jira Pulse Active
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <CustomDropdown 
                            options={projectOptions}
                            value={projectFilter}
                            onChange={setProjectFilter}
                            className="w-48"
                        />
                        <button 
                            onClick={fetchIssues}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:rotate-180 duration-500"
                        >
                            <RefreshCw className="w-5 h-5 text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Columns Container */}
                <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
                    <div className="flex gap-8 h-full min-w-max px-2">
                        {SCRUM_COLUMNS.map((column, colIdx) => (
                            <div key={column} className="w-80 flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            column === "To Do" ? "bg-white/20" : 
                                            column === "In Progress" ? "bg-[#24FF7C]" :
                                            column === "In Review" ? "bg-blue-400" : "bg-emerald-400"
                                        )} />
                                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">{column}</h3>
                                        <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded-md">
                                            {boardData[column]?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4 h-[calc(100vh-220px)] overflow-y-auto p-2 pr-4 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/[0.03] custom-scrollbar">
                                    <AnimatePresence mode="popLayout">
                                        {boardData[column]?.map((task, i) => (
                                            <TaskCard key={task.issue_key} task={task} i={i} />
                                        ))}
                                    </AnimatePresence>
                                    
                                    {boardData[column]?.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center border border-dashed border-white/[0.02] rounded-[2rem] opacity-20">
                                            <p className="text-[9px] font-black uppercase tracking-widest italic">Empty Sector</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
