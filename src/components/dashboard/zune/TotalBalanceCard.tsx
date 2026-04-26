"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Zap } from "lucide-react";

interface TotalBalanceCardProps {
    totalBalance?: number;
    totalCash?: number;
    pending?: number;
    savings?: number;
    currency?: string;
}

const MathIcon = () => (
    <div className="w-6 h-6 rounded-[6px] bg-[#7C3AED] flex items-center justify-center">
        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
            <span className="text-[8px] text-white leading-none font-bold">−</span>
            <span className="text-[8px] text-white leading-none font-bold">×</span>
            <span className="text-[8px] text-white leading-none font-bold">+</span>
            <span className="text-[8px] text-white leading-none font-bold">=</span>
        </div>
    </div>
);

export function TotalBalanceCard({
    totalBalance = 42550.75,
    totalCash = 58200.00,
    pending = 12450.00,
    savings = 3199.25,
    currency = "$"
}: TotalBalanceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden p-8 flex flex-col justify-between group glass-panel rounded-[2.5rem] shadow-2xl min-h-[420px]"
        >
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-zinc-400 font-semibold text-base">Core Sprint Velocity</h3>
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-6xl lg:text-[4.5rem] font-black text-white tracking-tighter leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        84%
                    </h2>

                    <div className="flex items-center gap-2.5 text-zinc-400 text-lg font-medium pt-1">
                        <Zap className="w-5 h-5 text-[#24FF7C]" />
                        <span className="tracking-tight opacity-70 text-sm md:text-base italic">Steady progress. Engineered for every task.</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.05] grid grid-cols-3 gap-8">
                <div className="space-y-2">
                    <p className="text-zinc-500 text-[0.7rem] font-black uppercase tracking-[0.2em]">Completed</p>
                    <p className="text-[2.25rem] font-bold text-[#75D69C] leading-none tracking-tighter">
                        128
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-zinc-500 text-[0.7rem] font-black uppercase tracking-[0.2em]">In Review</p>
                    <p className="text-[2.25rem] font-bold text-[#FF9B9B] leading-none tracking-tighter">
                        24
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-zinc-500 text-[0.7rem] font-black uppercase tracking-[0.2em]">Blocked</p>
                    <p className="text-[2.25rem] font-bold text-[#A78BFA] leading-none tracking-tighter">
                        7
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
