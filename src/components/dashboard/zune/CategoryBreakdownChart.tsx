"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CategoryBreakdownChartProps {
    data?: any[];
}

const DEFAULT_COLORS = ["#A78BFA", "#24FF7C", "#FF8A8A", "#4B5563", "#6366F1", "#EC4899"];

const MOCK_DATA = [
    { name: "Development", value: 4500 },
    { name: "Operations", value: 2800 },
    { name: "Marketing", value: 1500 },
    { name: "Research", value: 1200 },
];

export function CategoryBreakdownChart({ data: liveData }: CategoryBreakdownChartProps) {
    const chartData = (liveData || MOCK_DATA).map((item, idx) => ({
        ...item,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
    }));

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-panel p-6 rounded-[2rem] flex flex-col h-full min-h-[340px]"
        >
            <h3 className="text-xl font-black text-white tracking-tight mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 Resource Allocation
            </h3>

            <div className="flex-1 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {totalValue > 0 ? "100%" : "0%"}
                    </span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Efficiency</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[11px] font-black uppercase tracking-wider text-white/60">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-white tracking-wider">
                            {totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>

        </motion.div>
    );
}
