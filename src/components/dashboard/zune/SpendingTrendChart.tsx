"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface SpendingTrendChartProps {
    data?: any[];
}

const MOCK_DATA = [
    { name: "MON", planned: 21, completed: 14 },
    { name: "TUE", planned: 18, completed: 22 },
    { name: "WED", planned: 24, completed: 16 },
    { name: "THU", planned: 31, completed: 19 },
    { name: "FRI", planned: 28, completed: 24 },
    { name: "SAT", planned: 15, completed: 31 },
    { name: "SUN", planned: 12, completed: 8 },
];

export function SpendingTrendChart({ data: liveData }: SpendingTrendChartProps) {
    const [isMounted, setIsMounted] = useState(false);
    const chartData = liveData || MOCK_DATA;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="glass-panel p-8 rounded-[2rem] h-[340px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-panel p-6 rounded-[2rem] flex flex-col h-full min-h-[340px]"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Sprint Progress.
                </h3>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#8B5CF6]/30" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-white/40">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF8A8A]" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-white/40">Completed</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                        barGap={-24}
                    >
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                            dy={15}
                        />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ 
                                backgroundColor: '#17181C', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '1.25rem',
                                padding: '1rem',
                                color: '#fff'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar 
                            dataKey="income" 
                            name="Planned Tasks"
                            fill="#8B5CF6" 
                            radius={[12, 12, 0, 0]} 
                            barSize={32}
                            opacity={0.2}
                            isAnimationActive={true}
                        />
                        <Bar 
                            dataKey="expenses" 
                            name="Completed Tasks"
                            fill="#FF8A8A" 
                            radius={[12, 12, 0, 0]} 
                            barSize={32}
                            isAnimationActive={true}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
