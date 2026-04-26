"use client";

import { motion } from "framer-motion";
import { 
    ArrowRight, 
    Settings2, 
    RefreshCw, 
    CheckCircle2,
    Zap,
    Search,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_INTEGRATIONS = [
    { id: "gh", name: "GitHub", category: "Version Control", icon: "https://cdn.simpleicons.org/github/white", status: "connected", lastSync: "2m ago", color: "text-white" },
    { id: "jira", name: "Jira Cloud", category: "Project Management", icon: "https://cdn.simpleicons.org/jira/0052CC", status: "connected", lastSync: "15s ago", color: "text-blue-400" },
    { id: "slack", name: "Slack Enterprise", category: "Communications", icon: "https://www.vectorlogo.zone/logos/slack/slack-icon.svg", status: "connected", lastSync: "Live", color: "text-purple-400" },
    { id: "linear", name: "Linear", category: "Issue Tracking", icon: "https://cdn.simpleicons.org/linear/white", status: "not_connected", lastSync: "N/A", color: "text-indigo-400" },
    { id: "vercel", name: "Vercel", category: "Deployment", icon: "https://cdn.simpleicons.org/vercel/white", status: "connected", lastSync: "1h ago", color: "text-white" },
    { id: "notion", name: "Notion", category: "Documentation", icon: "https://cdn.simpleicons.org/notion/white", status: "not_connected", lastSync: "N/A", color: "text-rose-400" },
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
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
                            CONNECTIVITY HUB
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Unified systems and external state management</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="relative group">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5CF6] transition-colors" />
                            <input
                                 type="text"
                                 placeholder="Search marketplace..."
                                 className="h-12 w-64 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Hero Feature Card */}
                <motion.div 
                    variants={staggerItem}
                    className="p-10 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 blur-[120px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#8B5CF6]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Neural Sync</h2>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Automated cross-platform state reconciliation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div className="space-y-1">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Links</p>
                                 <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tighter">12/32</p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Status</p>
                                 <div className="flex items-center gap-2">
                                     <span className="text-3xl font-black text-[#8B5CF6] font-[family-name:var(--font-outfit)] tracking-tighter">Healthy</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </motion.div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {MOCK_INTEGRATIONS.map((app, i) => {
                        const isConnected = app.status === "connected";

                        return (
                            <motion.div
                                key={app.id}
                                variants={staggerItem}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className="p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/5 hover:border-white/10 hover:bg-white transition-all duration-500 cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/5 flex items-center justify-center transition-colors")}>
                                        <img src={app.icon} alt={app.name} className="w-7 h-7 opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                         <div className={cn(
                                              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md transition-colors",
                                              isConnected ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20 group-hover:bg-black/5 group-hover:text-black group-hover:border-black/5" : "bg-white/5 text-white/20 border-white/10 group-hover:bg-black/5 group-hover:text-black/40 group-hover:border-black/5"
                                         )}>
                                              {isConnected ? "Connected" : "Not Linked"}
                                         </div>
                                         <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-2 group-hover:text-black/20 transition-colors">{app.lastSync}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-xl font-black text-white group-hover:text-black transition-colors">{app.name}</h4>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 group-hover:text-black/40 transition-colors">{app.category}</p>
                                </div>

                                <div className="pt-6 border-t border-white/[0.03] group-hover:border-black/5 flex items-center justify-between transition-colors">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white group-hover:text-black/40 group-hover:hover:text-black transition-colors">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Configure
                                    </button>
                                     {isConnected ? (
                                        <div className="flex items-center gap-2 text-[#8B5CF6] group-hover:text-black transition-colors">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                        </div>
                                    ) : (
                                        <button className="flex items-center gap-1.5 text-[#8B5CF6] group/btn group-hover:text-black transition-colors">
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
