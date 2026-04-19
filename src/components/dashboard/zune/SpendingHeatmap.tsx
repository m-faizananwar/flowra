"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

// Mock Data: Activity intensity for the last 4 weeks (28 days)
const WEEKS = 4;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;

const spendData = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const seed = i + 1;
    const pseudoRandom = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
    const amount = pseudoRandom < 0.2 ? 0 : Math.floor(pseudoRandom * 800);
    return { day: i, amount };
});

const getIntensity = (amount: number) => {
    if (amount === 0) return "bg-white/[0.03]";
    if (amount < 200) return "bg-emerald-500/20";
    if (amount < 500) return "bg-emerald-500/40";
    if (amount < 800) return "bg-emerald-500/60";
    return "bg-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
};

interface SpendingHeatmapProps {
    data?: { day: number; amount: number; date?: string }[];
}

export function SpendingHeatmap({ data: liveData }: SpendingHeatmapProps) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const currentData = liveData || spendData;

    if (!isMounted) return <div className="w-full h-[480px] bg-white/[0.03] rounded-[2rem] animate-pulse" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full rounded-[2rem] p-6 glass-panel flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        SIGNAL HEATMAP
                    </h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Cross-system interaction density</p>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-[#24FF7C]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live Flow</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-[350px]">
                <div className="flex gap-2 relative z-20">
                    <div className="flex gap-2 min-w-max px-2 w-full justify-between sm:justify-start">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-2 pr-4 text-[10px] font-black text-white/20 uppercase tracking-tighter justify-between py-1">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                        <span>Sun</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex gap-2">
                        {Array.from({ length: WEEKS }).map((_, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-2">
                                {Array.from({ length: DAYS_PER_WEEK }).map((_, dIdx) => {
                                    const dataIdx = wIdx * DAYS_PER_WEEK + dIdx;
                                    const data = currentData[dataIdx] || { day: dataIdx, amount: 0 };
                                    const isHovered = hoveredDay === dataIdx;

                                    return (
                                        <div 
                                            key={dIdx} 
                                            className="relative"
                                            onMouseEnter={() => setHoveredDay(dataIdx)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 + (dataIdx * 0.02) }}
                                                whileHover={{ scale: 1.2, zIndex: 10 }}
                                                className={cn(
                                                    "w-6 h-6 rounded-[8px] transition-all duration-300 relative cursor-pointer border border-white/5",
                                                    getIntensity(data.amount)
                                                )}
                                            />

                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10, scale: 0.95, x: wIdx === 0 ? "0%" : wIdx === WEEKS - 1 ? "0%" : "-50%" }}
                                                        animate={{ opacity: 1, y: 0, scale: 1, x: wIdx === 0 ? "0%" : wIdx === WEEKS - 1 ? "0%" : "-50%" }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95, x: wIdx === 0 ? "0%" : wIdx === WEEKS - 1 ? "0%" : "-50%" }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                        style={{ transformOrigin: wIdx === 0 ? "bottom left" : wIdx === WEEKS - 1 ? "bottom right" : "bottom center" }}
                                                        className={cn(
                                                            "absolute bottom-[calc(100%+12px)] w-48 p-4 rounded-3xl bg-[#17181C] backdrop-blur-3xl border border-white/10 shadow-2xl pointer-events-none z-50",
                                                            wIdx === 0 ? "left-[-8px]" : wIdx === WEEKS - 1 ? "right-[-8px]" : "left-1/2"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Entry #{data.day + 1}</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C]" />
                                                        </div>
                                                        
                                                        <div className="flex flex-col mb-4 mt-2">
                                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Impact Level</span>
                                                            <span className="text-2xl font-black text-white italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                                                {data.amount === 0 ? "STABLE" : `${data.amount} Units`}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-2 pt-2 border-t border-white/5 mb-4">
                                                            <div className="flex items-center justify-between">
                                                                 <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Status</span>
                                                                 <span className={cn("text-[10px] font-black uppercase", data.amount > 0 ? "text-[#24FF7C]" : "text-white/20")}>
                                                                     {data.amount > 0 ? "Active" : "Idle"}
                                                                 </span>
                                                             </div>
                                                             <div className="flex items-center justify-between">
                                                                 <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Reliability</span>
                                                                 <span className="text-[10px] text-indigo-400 font-black">99.2%</span>
                                                             </div>
                                                         </div>

                                                         <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 pointer-events-auto">
                                                            View Signal Log
                                                            <ArrowUpRight className="w-3 h-3 text-[#24FF7C]" />
                                                        </button>

                                                        <div className={cn(
                                                            "absolute top-full w-3 h-3 border-l border-t border-white/10 bg-[#17181C] rotate-[225deg] -mt-[6px]",
                                                            wIdx === 0 ? "left-4" : wIdx === WEEKS - 1 ? "right-4" : "left-1/2 -translate-x-1/2"
                                                        )} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

                <div className="mt-4 flex items-center justify-end gap-2 pr-2">
                    <span className="text-[10px] font-black text-white/20 uppercase">Less</span>
                    <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-[4px] bg-white/[0.03]" />
                        <div className="w-4 h-4 rounded-[4px] bg-emerald-500/20" />
                        <div className="w-4 h-4 rounded-[4px] bg-emerald-500/40" />
                        <div className="w-4 h-4 rounded-[4px] bg-emerald-500/60" />
                        <div className="w-4 h-4 rounded-[4px] bg-[#24FF7C]" />
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase">More</span>
                </div>
            </div>
        </motion.div>
    );
}
