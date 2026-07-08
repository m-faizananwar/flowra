"use client";

import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";

interface ExpenseChartProps {
    className?: string;
    data?: any[];
}

const COLORS = ["#24FF7C", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F43F5E", "#06B6D4"];

export function ExpenseChart({ className, data: liveData }: ExpenseChartProps) {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const chartData = useMemo(() => liveData || [], [liveData]);

    const memberKeys = useMemo(() => {
        const keys = new Set<string>();
        chartData.forEach((day: any) => {
            Object.keys(day).forEach(k => {
                if (k !== 'name' && !k.endsWith('_name')) {
                    keys.add(k);
                }
            });
        });
        return Array.from(keys);
    }, [chartData]);

    if (!isMounted) return <div className="w-full h-[400px] rounded-[2rem] glass-panel bg-white/5 animate-pulse" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
                "w-full h-[400px] rounded-[2rem] p-6 flex flex-col glass-panel",
                className
            )}
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        TEAM PERFORMANCE TRAJECTORY
                    </h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <Users className="w-3 h-3 text-white/40" />
                        AI-Evaluated Member Trends
                    </p>
                </div>

                <button className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.08] hover:text-white transition-all">
                    Last 7 Days
                    <ChevronDown className="w-4 h-4 text-white/20" />
                </button>
            </div>

            <div className="flex-1 w-full relative group min-h-[250px]">
                {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/20 text-sm italic uppercase tracking-widest">
                        Awaiting team metrics...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", fontFamily: "Outfit, sans-serif" }} 
                                dy={10} 
                            />
                            <YAxis 
                                hide 
                                domain={[0, 100]} 
                            />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="glass-panel p-4 rounded-2xl border-white/10 shadow-2xl min-w-[180px] bg-[#17181C]">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">{label}</p>
                                                <div className="space-y-2.5">
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-[11px] font-black text-white italic truncate max-w-[100px]">{entry.payload[`${entry.dataKey}_name`]}</span>
                                                            </div>
                                                            <span className="text-[13px] font-black text-white" style={{ fontFamily: "Outfit, sans-serif", color: entry.color }}>{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {memberKeys.map((key, i) => (
                                <Line 
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={COLORS[i % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: "#0F0F12" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    connectNulls
                                    animationDuration={1500}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}
