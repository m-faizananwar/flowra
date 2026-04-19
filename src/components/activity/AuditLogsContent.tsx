"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, History, Zap, Sparkles, Activity, Target, ShieldCheck, AlertCircle, RefreshCw, ChevronRight, MoreVertical, Plus, Filter, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const EVENT_ICONS: Record<string, any> = {
    sync: RefreshCw,
    verify: ShieldCheck,
    alert: AlertCircle,
    log: History,
    spark: Sparkles,
};

const EVENT_COLORS: Record<string, string> = {
    sync: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    verify: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    alert: "text-red-400 bg-red-500/10 border-red-500/20",
    log: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    spark: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const MOCK_EVENTS = [
    { id: '1', date: new Date(), title: "Jira Issue Sync", system: "Jira Enterprise", type: "sync", status: "completed", impact: 42, icon: RefreshCw },
    { id: '2', date: new Date(Date.now() - 3600000), title: "PR Verification PASS", system: "GitHub Flow", type: "verify", status: "completed", impact: 12, icon: ShieldCheck },
    { id: '3', date: new Date(Date.now() - 7200000), title: "Anomaly Detected", system: "Neural Monitor", type: "alert", status: "pending", impact: 88, icon: AlertCircle },
    { id: '4', date: new Date(Date.now() - 86400000), title: "Sprint Log Rotation", system: "Flowra Core", type: "log", status: "completed", impact: 5, icon: History },
    { id: '5', date: new Date(Date.now() - 86400000 * 1.5), title: "AI Decision Sync", system: "Cognitive Engine", type: "spark", status: "completed", impact: 124, icon: Sparkles },
    { id: '6', date: new Date(Date.now() - 86400000 * 2), title: "Team Status Digest", system: "Slack Connect", type: "sync", status: "completed", impact: 18, icon: RefreshCw },
];

export function AuditLogsContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredEvents = useMemo(() => {
        return MOCK_EVENTS.filter(ev => {
            const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase()) || 
                                 ev.system.toLowerCase().includes(search.toLowerCase());
            const matchesTab = activeTab === "all" || ev.type === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [search, activeTab]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Parsing Event Logs...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Audit Logs">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            EVENT LEDGER
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Immutable system activity logs</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#24FF7C] transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search logs..."
                                className="h-12 w-64 bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all font-bold"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
                    {['all', 'sync', 'verify', 'alert', 'log'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                                activeTab === tab ? "bg-[#24FF7C] text-black shadow-[0_0_15px_rgba(36,255,124,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table Layout */}
                <motion.div 
                    variants={staggerItem}
                    className="rounded-[2.5rem] bg-gradient-to-b from-[#1A1B1F] to-[#121316] border border-white/5 shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />
                    
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-[1.2fr_2fr_1.5fr_1fr_1fr_0.2fr] gap-4 px-10 py-7 text-white/20 text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/[0.03] relative z-10">
                        <span>Timestamp</span>
                        <span>Activity Header</span>
                        <span>Source System</span>
                        <span>Classification</span>
                        <span className="text-right">Signal Intensity</span>
                        <span className="sr-only">Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/[0.02] relative z-10">
                        {filteredEvents.map((ev, i) => {
                            const Icon = EVENT_ICONS[ev.type] || Activity;
                            return (
                                <motion.div
                                    key={ev.id}
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.5fr_1fr_1fr_0.2fr] gap-4 px-10 py-7 hover:bg-white/[0.02] transition-all group items-center"
                                >
                                    <div className="text-[12px] font-bold text-white/40 font-mono">
                                        {ev.date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })} 
                                        <span className="opacity-40 ml-2">[{ev.date.toLocaleDateString()}]</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-black text-white group-hover:text-[#24FF7C] transition-colors tracking-tight">
                                            {ev.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border", EVENT_COLORS[ev.type])}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-white/70 capitalize">{ev.system}</span>
                                    </div>

                                    <div>
                                        <span className={cn(
                                            "inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            ev.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {ev.type}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-2xl font-black font-[family-name:var(--font-outfit)] italic text-white/80 group-hover:text-white transition-colors">
                                            {ev.impact}
                                        </span>
                                        <span className="text-[10px] font-black text-white/20 lowercase ml-1">σ</span>
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
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">End of immutable chain • Shifting to archive</p>
                        <div className="flex items-center gap-3">
                             <button className="p-3 text-white/20 hover:text-white transition-colors rotate-180"><ChevronRight className="w-5 h-5"/></button>
                             <div className="flex gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-[#24FF7C]" />
                                 <div className="w-2 h-2 rounded-full bg-white/10" />
                                 <div className="w-2 h-2 rounded-full bg-white/10" />
                             </div>
                             <button className="p-3 text-white/20 hover:text-white transition-colors"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
