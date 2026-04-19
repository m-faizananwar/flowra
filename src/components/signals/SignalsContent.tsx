"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, 
    Zap, 
    AlertTriangle, 
    ShieldCheck, 
    Globe, 
    Cpu, 
    ChevronRight,
    RefreshCw,
    Terminal,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_SIGNALS = [
    { id: "sig-102", title: "API Latency Spike", system: "Jira Cloud Connector", type: "warning", magnitude: "high", timestamp: "Just now" },
    { id: "sig-101", title: "Auth Protocol Verified", system: "Neural Shield", type: "success", magnitude: "low", timestamp: "2m ago" },
    { id: "sig-98", title: "Commit Pattern Drift", system: "Cognitive Engine", type: "alert", magnitude: "medium", timestamp: "15m ago" },
    { id: "sig-94", title: "Vercel Build Queue Purge", system: "Cloud Ops", type: "info", magnitude: "low", timestamp: "1h ago" },
    { id: "sig-89", title: "Unusual Sync Frequency", system: "GitHub Sync", type: "warning", magnitude: "medium", timestamp: "3h ago" },
];

const SIGNAL_COLORS: Record<string, string> = {
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    success: "text-[#24FF7C] bg-[#24FF7C]/10 border-[#24FF7C]/20",
    alert: "text-red-400 bg-red-500/10 border-red-500/20",
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export function SignalsContent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Awaiting Signal Synchronization...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Signals">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            NEURAL SIGNALS
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Direct stream of cross-system anomalies</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/60 hover:bg-white/[0.08] hover:text-white transition-all group">
                             <Terminal className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                             Raw Stream
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 flex items-center justify-center">
                             <Activity className="w-6 h-6 text-[#24FF7C]" />
                         </div>
                         <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Signal Intensity</p>
                             <p className="text-2xl font-black text-white italic tracking-tighter">Normal</p>
                         </div>
                     </motion.div>

                     <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                             <Globe className="w-6 h-6 text-blue-400" />
                         </div>
                         <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Reach</p>
                             <p className="text-2xl font-black text-white italic tracking-tighter">12 Zones</p>
                         </div>
                     </motion.div>

                     <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                             <Cpu className="w-6 h-6 text-purple-400" />
                         </div>
                         <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Neural Load</p>
                             <p className="text-2xl font-black text-white italic tracking-tighter">Balanced</p>
                         </div>
                     </motion.div>

                     <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex flex-col items-center text-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                             <Zap className="w-6 h-6 text-amber-500" />
                         </div>
                         <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Alerts</p>
                             <p className="text-2xl font-black text-amber-500 italic tracking-tighter">02 Issues</p>
                         </div>
                     </motion.div>
                </div>

                {/* Signals Feed Container */}
                <motion.div 
                    variants={staggerItem}
                    className="rounded-[3rem] bg-gradient-to-b from-[#1A1B1F] to-[#121316] border border-white/5 shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between px-10 py-7 border-b border-white/[0.03] relative z-10">
                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#24FF7C] animate-pulse" />
                            Live Neural Stream
                        </h3>
                        <div className="flex items-center gap-4">
                             <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-white/20 transition-all">
                                 <RefreshCw className="w-4 h-4" />
                             </button>
                        </div>
                    </div>

                    <div className="divide-y divide-white/[0.02] relative z-10 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {MOCK_SIGNALS.map((sig, i) => (
                                <motion.div
                                    key={sig.id}
                                    layout
                                    className="flex items-center justify-between px-10 py-8 hover:bg-white/[0.02] transition-all group"
                                >
                                    <div className="flex items-center gap-10 flex-1">
                                        <div className="text-[12px] font-bold text-white/20 font-mono w-24">{sig.timestamp}</div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", SIGNAL_COLORS[sig.type])}>
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white tracking-tight group-hover:text-[#24FF7C] transition-colors">{sig.title}</h4>
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{sig.system}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 pr-10">
                                         <div className="text-right">
                                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Magnitude</p>
                                             <span className={cn(
                                                 "text-[10px] font-black uppercase tracking-widest",
                                                 sig.magnitude === 'high' ? "text-red-400" : sig.magnitude === 'medium' ? "text-amber-400" : "text-white/40"
                                             )}>
                                                 {sig.magnitude} σ
                                             </span>
                                         </div>
                                         <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.08] transition-all">
                                             <ChevronRight className="w-5 h-5" />
                                         </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="px-10 py-6 border-t border-white/[0.03] bg-white/[0.01] relative z-10 flex justify-center">
                         <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                             Load Exhaustive Stream
                         </button>
                    </div>
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
