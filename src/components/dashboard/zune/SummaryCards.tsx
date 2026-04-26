"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: number;
    icon: any;
    iconColor: string;
    iconBgColor: string;
    badge?: {
        text: string;
        color: string;
        bgColor: string;
    };
    delay?: number;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBgColor, badge, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass-panel p-6 rounded-[2rem] space-y-4 flex-1"
        >
            <div className="flex items-center justify-between">
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center", iconBgColor)}>
                    <Icon className={cn("w-6 h-6", iconColor)} />
                </div>
                {badge && (
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", badge.bgColor, badge.color)}>
                        {badge.text}
                    </div>
                )}
            </div>
            <div className="space-y-0.5">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
                <h4 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {value.toLocaleString('en-US')}
                </h4>
            </div>
        </motion.div>
    );
}

export function SummaryCards({ totalSaved = 412, totalSpent = 842 }: { totalSaved?: number, totalSpent?: number }) {
    return (
        <div className="flex flex-col gap-6 h-full">
            <StatCard
                label="Verified Actions"
                value={totalSaved}
                icon={TrendingUp}
                iconColor="text-[#24FF7C]"
                iconBgColor="bg-[#24FF7C]/10"
                badge={{
                    text: "Proof of Work",
                    color: "text-[#24FF7C]",
                    bgColor: "bg-[#24FF7C]/10"
                }}
                delay={0.2}
            />
            <StatCard
                label="Total Workload"
                value={totalSpent}
                icon={ShoppingCart}
                iconColor="text-[#FF8A8A]"
                iconBgColor="bg-[#FF8A8A]/10"
                badge={{
                    text: "Sprint Load",
                    color: "text-white/40",
                    bgColor: "bg-white/5"
                }}
                delay={0.3}
            />
        </div>
    );
}
