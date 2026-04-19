"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    Target, 
    ArrowRight, 
    ShieldCheck, 
    AlertCircle, 
    MessageSquare, 
    Clock, 
    Command,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_TRIAGE_ITEMS = [
    { id: "TR-1", title: "Jira API Connection Drift", priority: "critical", system: "Integrations", desc: "System detected a 320ms latency increase in Jira fetch protocols. Requires re-handshake." },
    { id: "TR-2", title: "Verify PR-452 (Faizan)", priority: "high", system: "PR Neural Audit", desc: "Automated verification pass complete. Manual sign-off required for master merge." },
    { id: "TR-3", title: "Anomaly in Sprint Velocity", priority: "medium", system: "Analytics", desc: "Current throughput is 12% below forecasted baseline for Alpha Node focus." },
];

export function TriageHubContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeItem, setActiveItem] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Initializing Mission Control...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Triage Hub">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="h-full flex flex-col space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            TRIAGE CENTER
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">High-focus resolution and state clearance</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 text-[10px] font-black uppercase tracking-widest text-[#24FF7C]">
                             Next Item Ready
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
                    {/* Resolution Focus Area */}
                    <motion.div 
                        variants={staggerItem}
                        className="lg:col-span-2 rounded-[3.5rem] bg-white/[0.02] border border-white/5 p-12 relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#24FF7C]/5 blur-[120px] pointer-events-none" />
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10 relative z-10"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            MOCK_TRIAGE_ITEMS[activeItem].priority === 'critical' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-[#24FF7C]/10 text-[#24FF7C] border-[#24FF7C]/20"
                                        )}>
                                            {MOCK_TRIAGE_ITEMS[activeItem].priority} Priority
                                        </div>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{MOCK_TRIAGE_ITEMS[activeItem].system}</span>
                                    </div>
                                    <h2 className="text-5xl font-black text-white italic tracking-tighter leading-[0.9] font-[family-name:var(--font-outfit)]">
                                        {MOCK_TRIAGE_ITEMS[activeItem].title}
                                    </h2>
                                </div>

                                <p className="text-xl font-medium text-white/40 leading-relaxed max-w-xl">
                                    {MOCK_TRIAGE_ITEMS[activeItem].desc}
                                </p>

                                <div className="pt-10 flex items-center gap-6">
                                     <button className="flex items-center gap-3 px-10 h-16 rounded-[1.5rem] bg-[#24FF7C] text-black text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-[0_4px_30px_rgba(36,255,124,0.2)] transition-all active:scale-95 group">
                                         Initiate Resolution
                                         <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                     </button>
                                     <button className="px-8 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 text-white/40 text-xs font-black uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all">
                                         Delegate Item
                                     </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-12 border-t border-white/[0.05] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C]" />
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Neural Link Synchronized</p>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Command className="w-4 h-4 text-white/10" />
                                 <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Press ⌘+ENT to Execute</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pending Queue Sidebar */}
                    <motion.div variants={staggerItem} className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em]">Queue Capacity</h3>
                            <span className="text-[10px] font-black text-[#24FF7C]">{MOCK_TRIAGE_ITEMS.length} items</span>
                        </div>

                        <div className="space-y-4">
                            {MOCK_TRIAGE_ITEMS.map((item, i) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveItem(i)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-[2rem] border transition-all active:scale-[0.98] group relative overflow-hidden",
                                        activeItem === i 
                                            ? "bg-white/[0.06] border-[#24FF7C]/30 shadow-[0_0_20px_rgba(36,255,124,0.05)]" 
                                            : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                                    )}
                                >
                                    {activeItem === i && (
                                        <motion.div 
                                            layoutId="active-indicator"
                                            className="absolute left-0 top-0 w-1 h-full bg-[#24FF7C]"
                                        />
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <p className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            activeItem === i ? "text-[#24FF7C]" : "text-white/20"
                                        )}>{item.id}</p>
                                        <h4 className={cn(
                                            "text-sm font-black transition-colors",
                                            activeItem === i ? "text-white" : "text-white/40 group-hover:text-white/60"
                                        )}>{item.title}</h4>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Insights */}
                        <div className="p-8 rounded-[2.5rem] bg-indigo-500/[0.03] border border-indigo-500/10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Resolution Rate</p>
                                    <p className="text-xl font-black text-white italic">+14.2%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
