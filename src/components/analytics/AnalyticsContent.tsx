"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, Target, Activity, Share2 } from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { KpiCards } from "./KpiCards";
import { AnalyticsCharts } from "./AnalyticsCharts";

export function AnalyticsContent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[1.5px] opacity-20" />
                    <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Aggregating</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#24FF7C]">Telemetry Data</p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Sprint Analytics">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            PERFORMANCE INDEX
                        </h1>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Cross-system velocity telemetry</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/60 hover:bg-white/[0.08] hover:text-white transition-all group">
                            <Calendar className="w-4 h-4 text-white/20 group-hover:text-[#24FF7C] transition-colors" />
                            Current Sprint
                        </button>
                        <button className="flex items-center gap-2.5 px-6 h-12 rounded-2xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(36,255,124,0.15)] active:scale-95">
                            <Share2 className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* KPI Section */}
                <motion.div variants={staggerItem}>
                    <KpiCards />
                </motion.div>

                {/* Quick Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-1 p-6 rounded-[2rem] bg-[#24FF7C]/5 border border-[#24FF7C]/10 flex flex-col justify-between group hover:bg-[#24FF7C]/10 transition-all cursor-pointer">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-[#24FF7C] flex items-center justify-center mb-4">
                                <Target className="w-5 h-5 text-black" />
                            </div>
                            <p className="text-[10px] font-black uppercase text-[#24FF7C] tracking-widest mb-1">Sprint Status</p>
                            <h4 className="text-lg font-black text-white leading-tight">Ahead of schedule <br/> by 4.2 hours</h4>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase mt-4">Simulated Projection</p>
                    </motion.div>

                    <div className="lg:col-span-3">
                        <motion.div variants={staggerItem} className="h-full">
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 h-full flex items-center gap-8 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#24FF7C]/5 to-transparent pointer-none" />
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <Activity className="w-8 h-8 text-[#24FF7C] opacity-50" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-1">Aggregated Focus</p>
                                    <h4 className="text-xl font-black text-white tracking-tight">System bottlenecks have decreased by <span className="text-[#24FF7C]">12%</span> since last cycle.</h4>
                                    <p className="text-xs font-bold text-white/40 mt-1">AI Recommendation: Increase PR review concurrency for @backend team.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Primary Charts */}
                <motion.div variants={staggerItem}>
                    <AnalyticsCharts />
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
