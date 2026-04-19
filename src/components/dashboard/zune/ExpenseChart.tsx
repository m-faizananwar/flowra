"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ExpenseChartProps {
    className?: string;
    data?: any[];
}

const MOCK_DATA = [
    { name: "Mon", amount: 4200 },
    { name: "Tue", amount: 3800 },
    { name: "Wed", amount: 5100 },
    { name: "Thu", amount: 4600 },
    { name: "Fri", amount: 6200 },
    { name: "Sat", amount: 5800 },
    { name: "Sun", amount: 4900 },
];

export function ExpenseChart({ className, data: liveData }: ExpenseChartProps) {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = liveData || MOCK_DATA;

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
                        PERFORMANCE ANALYTICS
                    </h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Resource Utilization Trajectory</p>
                </div>

                <button className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.08] hover:text-white transition-all">
                    Last 7 Days
                    <ChevronDown className="w-4 h-4 text-white/20" />
                </button>
            </div>

            <div className="flex-1 w-full relative group min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#24FF7C" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#24FF7C" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="5 5" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#24FF7C"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-[#17181C] border border-white/10 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-3xl z-50 transition-all"
        >
            <div className="flex items-center justify-between gap-8 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label} Metrics</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-white italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {payload[0].value.toLocaleString()} Units
                </span>
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Aggregated Output</span>
            </div>
        </motion.div>
    );
};
