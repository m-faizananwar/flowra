"use client";

import { useState } from "react";
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
    Columns
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_BOARD_DATA = {
    "TO DO": [
        { id: "FLW-102", title: "Implement Auth Middleware", priority: "high", assignee: "AN", status: "synced", comments: 4, files: 2 },
        { id: "FLW-105", title: "Refactor Shader Engine", priority: "medium", assignee: "FS", status: "queued", comments: 0, files: 1 },
        { id: "FLW-109", title: "Audit Log Compression", priority: "low", assignee: "ML", status: "pending", comments: 2, files: 0 },
    ],
    "IN PROGRESS": [
        { id: "FLW-98", title: "ZuneFlow CSS Migration", priority: "highest", assignee: "AI", status: "active", comments: 12, files: 8 },
        { id: "FLW-101", title: "Websocket Reconnection Logic", priority: "medium", assignee: "FS", status: "active", comments: 3, files: 2 },
    ],
    "IN REVIEW": [
        { id: "FLW-94", title: "Telemetry Data Aggregation", priority: "high", assignee: "AN", status: "verifying", comments: 7, files: 4 },
    ],
    "DONE": [
        { id: "FLW-89", title: "Sidebar Modernization", priority: "high", assignee: "AI", status: "synced", comments: 5, files: 2 },
        { id: "FLW-82", title: "Base Layout Infrastructure", priority: "medium", assignee: "FS", status: "synced", comments: 1, files: 5 },
    ]
};

const PRIORITY_COLORS: Record<string, string> = {
    highest: "text-red-400 bg-red-500/10 border-red-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const STATUS_ICONS: Record<string, any> = {
    synced: ShieldCheck,
    active: Zap,
    verifying: RefreshCw,
    queued: Clock,
    pending: AlertCircle,
};

function TaskCard({ task, i }: { task: any, i: number }) {
    const StatusIcon = STATUS_ICONS[task.status] || Clock;

    return (
        <motion.div
            variants={staggerItem}
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden active:scale-98"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn("w-3.5 h-3.5", task.status === 'active' ? "text-[#24FF7C]" : "text-white/40")} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{task.id}</span>
                </div>
                <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", PRIORITY_COLORS[task.priority])}>
                    {task.priority}
                </div>
            </div>

            <h4 className="text-[14px] font-bold text-white mb-6 group-hover:text-[#24FF7C] transition-colors leading-snug">
                {task.title}
            </h4>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] relative z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/20">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-black">{task.comments}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/20">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-[10px] font-black">{task.files}</span>
                    </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/50 ring-2 ring-[#17181C]">
                    {task.assignee}
                </div>
            </div>
        </motion.div>
    );
}

export function KanbanBoard() {
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
                            JIRA SYNC BOARD
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Simulated 1:1 project orchestration</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-2xl mr-4">
                            <button className="p-2.5 rounded-xl bg-[#24FF7C] text-black shadow-[0_0_15px_rgba(36,255,124,0.3)] transition-all">
                                <Layout className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                <Columns className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#24FF7C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search sprint..."
                                className="h-12 w-48 bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all font-bold"
                            />
                        </div>
                        <button className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-[0_4px_20px_rgba(36,255,124,0.15)] active:scale-95 transition-all">
                            <Plus className="w-4 h-4 stroke-[3px]" />
                            Create Issue
                        </button>
                    </div>
                </div>

                {/* Columns Container */}
                <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar scrollbar-none">
                    <div className="flex gap-8 h-full min-w-max">
                        {Object.entries(MOCK_BOARD_DATA).map(([column, tasks], colIdx) => (
                            <div key={column} className="w-80 flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            column === "TO DO" ? "bg-white/20" : 
                                            column === "IN PROGRESS" ? "bg-[#24FF7C]" :
                                            column === "IN REVIEW" ? "bg-blue-400" : "bg-emerald-400"
                                        )} />
                                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">{column}</h3>
                                        <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded-md">{tasks.length}</span>
                                    </div>
                                    <button className="p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    {tasks.map((task, i) => (
                                        <TaskCard key={task.id} task={task} i={i + colIdx * 3} />
                                    ))}
                                    <button className="group w-full py-4 rounded-[1.5rem] border border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] flex items-center justify-center gap-2 text-white/10 hover:text-white/40 transition-all active:scale-98">
                                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Task</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
