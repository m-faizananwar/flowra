"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Target, Zap } from "lucide-react";

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((v - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

const SPARKLINES: Record<string, number[]> = {
    "Success Rate": [80, 85, 82, 90, 88, 95, 92],
    "Avg Velocity": [30, 32, 35, 33, 38, 42, 40],
    "PR Completion": [60, 65, 70, 68, 75, 80, 78],
    "System Load": [40, 45, 50, 48, 55, 60, 58],
};

const KpiItems = [
    {
        label: "Success Rate",
        value: "94.2%",
        change: "+2.4%",
        positive: true,
        icon: Target,
        gradient: "from-emerald-500/20 to-emerald-500/5",
        accent: "text-emerald-400",
        borderAccent: "border-emerald-500/20",
    },
    {
        label: "Avg Velocity",
        value: "42.5",
        change: "Optimal",
        positive: true,
        icon: Zap,
        gradient: "from-blue-500/20 to-blue-500/5",
        accent: "text-blue-400",
        borderAccent: "border-blue-500/20",
    },
    {
        label: "PR Completion",
        value: "82",
        change: "Active",
        positive: true,
        icon: Activity,
        gradient: "from-purple-500/20 to-purple-500/5",
        accent: "text-purple-400",
        borderAccent: "border-purple-500/20",
    },
    {
        label: "System Load",
        value: "64%",
        change: "Balanced",
        positive: true,
        icon: TrendingUp,
        gradient: "from-amber-500/20 to-amber-500/5",
        accent: "text-amber-400",
        borderAccent: "border-amber-500/20",
    },
];

export function KpiCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {KpiItems.map((kpi, i) => (
                <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-[2rem] bg-gradient-to-br ${kpi.gradient} border border-white/5 p-6 backdrop-blur-xl group hover:border-white/10 transition-all`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 border ${kpi.borderAccent} flex items-center justify-center`}>
                            <kpi.icon className={`w-6 h-6 ${kpi.accent}`} />
                        </div>
                        <MiniSparkline
                            data={SPARKLINES[kpi.label] || [10, 20, 15, 25, 20, 30]}
                            color={kpi.accent.includes('emerald') ? '#34d399' : kpi.accent.includes('blue') ? '#60a5fa' : kpi.accent.includes('purple') ? '#a78bfa' : '#fbbf24'}
                        />
                    </div>

                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">{kpi.value}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${kpi.accent}`}>{kpi.change}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
