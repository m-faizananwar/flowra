"use client";

import { motion } from "framer-motion";
import { 
    Trophy, 
    TrendingUp, 
    Zap, 
    Users, 
    Star, 
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";

const MOCK_LEADERBOARD = [
    { name: "Faizan", role: "Lead Architect", velocity: 84, impact: 92, avatar: "F", color: "from-emerald-500 to-teal-500" },
    { name: "Ayesha", role: "Frontend Dev", velocity: 78, impact: 85, avatar: "A", color: "from-blue-500 to-indigo-500" },
    { name: "Muneeb", role: "Backend Lead", velocity: 72, impact: 88, avatar: "M", color: "from-purple-500 to-pink-500" },
    { name: "Zain", role: "Infra Engineer", velocity: 68, impact: 75, avatar: "Z", color: "from-amber-500 to-orange-500" },
];

export function PerformanceContent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-[#24FF7C] animate-spin opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Synthesizing Metrics...</p>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Performance">
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
                            TEAM INTENSITY
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Real-time velocity and contribution telemetry</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/60 hover:bg-white/[0.08] hover:text-white transition-all group">
                            Full Team View
                        </button>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-[#24FF7C]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Team Success Rate</h4>
                                <p className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tighter italic">98.2%</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 blur-[60px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-[#3B82F6]/60 uppercase tracking-widest">Current Velocity</h4>
                                <p className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tighter italic">42.5 pts</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-purple-500/60 uppercase tracking-widest">Active Focus</h4>
                                <p className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tighter italic">Alpha Node</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Leaderboard Table / Section */}
                <motion.div variants={staggerItem} className="rounded-[3rem] bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">Intensity Leaderboard</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">High-impact contributors this sprint</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#24FF7C]">Top Tier</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {MOCK_LEADERBOARD.map((user, i) => (
                            <motion.div 
                                key={user.name}
                                whileHover={{ scale: 1.01, x: 10 }}
                                className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#24FF7C]/20 transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="text-2xl font-black text-white/10 italic w-8">0{i+1}</div>
                                    <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg shadow-xl", user.color)}>
                                        {user.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white tracking-tight group-hover:text-[#24FF7C] transition-colors">{user.name}</h4>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{user.role}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-20 pr-10">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Velocity</p>
                                        <p className="text-xl font-black text-white font-[family-name:var(--font-outfit)] italic">{user.velocity}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Impact</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-black text-[#24FF7C] font-[family-name:var(--font-outfit)] italic">{user.impact}%</p>
                                            <ArrowUpRight className="w-4 h-4 text-[#24FF7C]" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Resource Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-1 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center text-center space-y-6">
                        <Star className="w-10 h-10 text-indigo-400" />
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Sprint Highlight</p>
                            <h4 className="text-lg font-black text-white leading-tight">Muneeb resolved <br/> 12 high-priority PRs</h4>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="lg:col-span-3 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-full w-96 bg-gradient-to-l from-[#24FF7C]/5 to-transparent pointer-none" />
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 flex items-center justify-center">
                                <Users className="w-8 h-8 text-[#24FF7C]" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white tracking-tight">Team cohesion increased by <span className="text-[#24FF7C]">14%</span></h4>
                                <p className="text-xs font-bold text-white/30 uppercase mt-1 tracking-widest">Aggregated from PR comments and code reviews</p>
                            </div>
                        </div>
                        <button className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-[#24FF7C] group-hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
