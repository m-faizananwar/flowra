"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    GitPullRequest, 
    ShieldCheck, 
    ShieldAlert, 
    RefreshCw, 
    ChevronRight, 
    Search, 
    Filter,
    ArrowUpDown,
    MoreVertical,
    CheckCircle2,
    Clock,
    User,
    Activity,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_PRS = [
    { id: "PR-452", title: "Feat: Add glassmorphic sidebar", author: "Faizan", system: "GitHub", status: "verified", reviews: 4, drift: "0.2%", date: "2m ago" },
    { id: "PR-451", title: "Fix: Auth token expiration", author: "Muneeb", system: "GitHub", status: "scanning", reviews: 2, drift: "0.0%", date: "15m ago" },
    { id: "PR-449", title: "Refactor: Shader pipeline", author: "Ayesha", system: "GitLab", status: "at_risk", reviews: 1, drift: "4.8%", date: "1h ago" },
    { id: "PR-445", title: "Chore: Update dependencies", author: "Muneeb", system: "GitHub", status: "verified", reviews: 3, drift: "0.1%", date: "4h ago" },
    { id: "PR-442", title: "WIP: Mobile navigation", author: "Zain", system: "GitHub", status: "pending", reviews: 0, drift: "1.2%", date: "Yesterday" },
];

const STATUS_CONFIG: Record<string, any> = {
    verified: { icon: ShieldCheck, color: "text-[#24FF7C] bg-[#24FF7C]/10 border-[#24FF7C]/20", label: "Neural Pass" },
    scanning: { icon: RefreshCw, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Analyzing" },
    at_risk: { icon: ShieldAlert, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Drift Detect" },
    pending: { icon: Clock, color: "text-white/30 bg-white/5 border-white/10", label: "Queued" },
};

export function PrVerificationContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredPrs = useMemo(() => {
        return MOCK_PRS.filter(pr => 
            pr.title.toLowerCase().includes(search.toLowerCase()) || 
            pr.author.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Auditing Pull Requests...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="PR Verification">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-10 pb-12"
            >
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search PRs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 w-full md:w-80 bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-400/50 transition-all font-bold"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                            <Filter className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filter</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                         <div className="flex gap-1.5 items-center bg-[#24FF7C]/5 px-4 py-2 rounded-xl border border-[#24FF7C]/10">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C] animate-pulse" />
                             <span className="text-[9px] font-black text-[#24FF7C]/60 uppercase tracking-widest">Neural Link Active</span>
                         </div>
                    </div>
                </div>

                {/* Verification Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={staggerItem} className="p-7 rounded-[2.5rem] bg-indigo-500/5 border border-white/5 flex flex-col gap-3 group hover:bg-indigo-500/10 transition-all">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Total Monitored</p>
                            <GitPullRequest className="w-4 h-4 text-indigo-400/40" />
                        </div>
                        <p className="text-3xl font-black text-white italic tracking-tight">148 PRs</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                            <span className="text-[10px] font-black text-white/20">75%</span>
                        </div>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="p-7 rounded-[2.5rem] bg-[#24FF7C]/5 border border-white/5 flex flex-col gap-3 group hover:bg-[#24FF7C]/10 transition-all">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-[#24FF7C] uppercase tracking-widest">Verification Rate</p>
                            <Activity className="w-4 h-4 text-[#24FF7C]/40" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-white italic tracking-tight">92.4%</p>
                            <span className="text-[10px] font-black text-[#24FF7C]">Optimal</span>
                        </div>
                        <div className="w-full h-8 flex items-end gap-1 mt-1 opacity-20">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#24FF7C] rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="p-7 rounded-[2.5rem] bg-red-500/5 border border-white/5 flex flex-col gap-3 group hover:bg-red-500/10 transition-all">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Drift Anomalies</p>
                            <ShieldAlert className="w-4 h-4 text-red-500/40" />
                        </div>
                        <p className="text-3xl font-black text-white italic tracking-tight">3 Alerts</p>
                        <div className="flex gap-1.5 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="p-7 rounded-[2.5rem] bg-blue-500/5 border border-white/5 flex flex-col gap-3 group hover:bg-blue-500/10 transition-all">
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">System Health</p>
                            <CheckCircle2 className="w-4 h-4 text-blue-400/40" />
                        </div>
                        <p className="text-3xl font-black text-white italic tracking-tight uppercase">Optimal</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                            <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-widest">Core Synchronized</span>
                        </div>
                    </motion.div>
                </div>

                {/* PR Table */}
                <motion.div 
                    variants={staggerItem}
                    className="rounded-[2.5rem] bg-gradient-to-b from-[#1A1B1F] to-[#121316] border border-white/5 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_0.2fr] gap-4 px-10 py-7 text-white/20 text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/[0.03]">
                        <span>Timestamp & ID</span>
                        <span>Pull Request Header</span>
                        <span>Source</span>
                        <span>Neural Status</span>
                        <span className="text-right">Code Drift</span>
                        <span className="sr-only">Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.02]">
                        {filteredPrs.map((pr, i) => {
                            const config = STATUS_CONFIG[pr.status] || STATUS_CONFIG.pending;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={pr.id}
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr_1fr_1fr_0.2fr] gap-4 px-10 py-8 hover:bg-white/[0.02] transition-all group items-center"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white/50">{pr.date}</span>
                                        <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mt-1">{pr.id}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-black text-white group-hover:text-blue-400 transition-colors tracking-tight leading-snug">
                                            {pr.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                                                <User className="w-2.5 h-2.5 text-white/40" />
                                            </div>
                                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                                {pr.author}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <GitPullRequest className="w-4 h-4 text-white/30" />
                                        </div>
                                        <span className="text-sm font-bold text-white/70">{pr.system}</span>
                                    </div>

                                    <div>
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            config.color
                                        )}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <span className={cn(
                                            "text-2xl font-black font-[family-name:var(--font-outfit)] italic tracking-tighter",
                                            pr.drift === "0.0%" ? "text-white/20" : pr.status === 'at_risk' ? "text-red-400" : "text-white/80"
                                        )}>
                                            {pr.drift}
                                        </span>
                                    </div>

                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4 text-white/20 hover:text-white cursor-pointer" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-6 border-t border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Live cross-platform stream enabled</p>
                        <div className="flex items-center gap-3">
                             <div className="flex gap-1.5 items-center bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C] animate-pulse" />
                                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Neural Link Active</span>
                             </div>
                             <button className="p-3 text-white/20 hover:text-white transition-colors"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
