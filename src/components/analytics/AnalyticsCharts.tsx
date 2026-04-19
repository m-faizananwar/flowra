"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Area, AreaChart, Bar, BarChart, Cell,
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label, mode = 'area' }: any) => {
    return (
        <AnimatePresence>
            {active && payload && payload.length && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="bg-[#17181C] border border-white/10 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-3xl z-50 pointer-events-auto"
                >
                    <div className="flex items-center justify-between gap-8 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label} Analytics</span>
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#24FF7C] text-[9px] font-black uppercase">Synced</div>
                    </div>
                    
                    <div className="space-y-4 mb-5">
                        {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{entry.name}</span>
                                </div>
                                <span className="text-xl font-black font-[family-name:var(--font-outfit)] text-white italic">
                                    {entry.value} {entry.name.includes("Velocity") ? "pts" : "%"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                        Deep Dive Sprint
                        <ArrowUpRight className="w-3 h-3 text-[#24FF7C]" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const DEFAULT_COLORS = ["#24FF7C", "#3b82f6", "#a855f7", "#f97316", "#eab308", "#ec4899", "#6b7280"];

const MOCK_TREND_DATA = [
    { date: "Sprint 1", velocity: 32, commitment: 28 },
    { date: "Sprint 2", velocity: 38, commitment: 35 },
    { date: "Sprint 3", velocity: 35, commitment: 40 },
    { date: "Sprint 4", velocity: 45, commitment: 42 },
    { date: "Sprint 5", velocity: 52, commitment: 48 },
    { date: "Sprint 6", velocity: 48, commitment: 50 },
];

const MOCK_CATEGORY_DATA = [
    { name: "Frontend", amount: 45 },
    { name: "Backend", amount: 32 },
    { name: "Design", amount: 15 },
    { name: "Infra", amount: 38 },
    { name: "Tests", amount: 12 },
];

export function AnalyticsCharts() {
    const categoryChartData = MOCK_CATEGORY_DATA.map((cat, idx) => ({
        ...cat,
        fill: DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2.5rem] p-8 flex flex-col glass-panel lg:col-span-2 border border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            VELOCITY VS COMMITMENT
                        </h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Sprint performance trajectory</p>
                    </div>
                    <button className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.08] hover:text-white transition-all">
                        H1 2026
                        <ChevronDown className="w-4 h-4 text-white/20" />
                    </button>
                </div>

                <div className="flex gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#24FF7C]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Velocity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Commitment</span>
                    </div>
                </div>

                <div className="flex-1 min-h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#24FF7C" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#24FF7C" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900 }}
                            />
                            <Tooltip
                                content={<CustomTooltip mode="area" />}
                                cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="velocity" name="Velocity" stroke="#24FF7C" strokeWidth={4} fillOpacity={1} fill="url(#colorVel)" />
                            <Area type="monotone" dataKey="commitment" name="Commitment" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCom)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[2.5rem] p-8 flex flex-col glass-panel lg:col-span-1 border border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                            RESOURCE LOAD
                        </h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Cross-functional intensity</p>
                    </div>
                </div>

                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 900 }}
                            />
                            <Tooltip
                                content={<CustomTooltip mode="bar" />}
                                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                            />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={24}>
                                {categoryChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-white/5">
                    {categoryChartData.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                            <span>{cat.name}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
