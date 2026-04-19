"use client";

import { motion } from "framer-motion";
import { 
    Github, 
    Slack, 
    Layout, 
    MessageSquare, 
    ArrowRight, 
    Settings2, 
    RefreshCw, 
    CheckCircle2,
    Zap,
    Box,
    Terminal,
    Search,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_INTEGRATIONS = [
    { id: "gh", name: "GitHub", category: "Version Control", icon: Github, status: "connected", lastSync: "2m ago", color: "text-white" },
    { id: "jira", name: "Jira Cloud", category: "Project Management", icon: Layout, status: "connected", lastSync: "15s ago", color: "text-blue-400" },
    { id: "slack", name: "Slack Enterprise", category: "Communications", icon: Slack, status: "connected", lastSync: "Live", color: "text-purple-400" },
    { id: "linear", name: "Linear", category: "Issue Tracking", icon: Box, status: "not_connected", lastSync: "N/A", color: "text-indigo-400" },
    { id: "vercel", name: "Vercel", category: "Deployment", icon: Terminal, status: "connected", lastSync: "1h ago", color: "text-white" },
    { id: "notion", name: "Notion", category: "Documentation", icon: MessageSquare, status: "not_connected", lastSync: "N/A", color: "text-rose-400" },
];

export function IntegrationsContent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Handshaking Protocols...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Integrations">
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
                            CONNECTIVITY HUB
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Unified systems and external state management</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search marketplace..."
                                className="h-12 w-64 bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-400/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Hero Feature Card */}
                <motion.div 
                    variants={staggerItem}
                    className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Active Neural Sync</h2>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Automated cross-platform state reconciliation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div className="space-y-1">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Links</p>
                                 <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)] italic tracking-tighter">12/32</p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Status</p>
                                 <div className="flex items-center gap-2">
                                     <span className="text-3xl font-black text-[#24FF7C] font-[family-name:var(--font-outfit)] italic tracking-tighter">Healthy</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </motion.div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {MOCK_INTEGRATIONS.map((app, i) => {
                        const Icon = app.icon;
                        const isConnected = app.status === "connected";

                        return (
                            <motion.div
                                key={app.id}
                                variants={staggerItem}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors", app.color)}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                         <div className={cn(
                                             "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                             isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/10"
                                         )}>
                                             {isConnected ? "Connected" : "Not Linked"}
                                         </div>
                                         <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-2">{app.lastSync}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-xl font-black text-white group-hover:text-[#24FF7C] transition-colors">{app.name}</h4>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{app.category}</p>
                                </div>

                                <div className="pt-6 border-t border-white/[0.03] flex items-center justify-between">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Configure
                                    </button>
                                    {isConnected ? (
                                        <div className="flex items-center gap-2 text-[#24FF7C]">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-1.5 text-blue-400 group/btn">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </PageTransition>
    );
}
