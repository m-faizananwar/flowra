"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Zap, Activity, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityItem = {
    id: string;
    title: string;
    amount: number;
    date: Date | string;
    category: "utilities" | "other";
    type: "income" | "expense";
};

const MOCK_ACTIVITY: ActivityItem[] = [
    { id: '1', title: 'New Risk Detected', amount: 0, date: new Date(), category: 'utilities', type: 'expense' },
    { id: '2', title: 'Evaluation Approved', amount: 0, date: new Date(), category: 'utilities', type: 'income' },
];

interface RecentActivityProps {
    transactions?: ActivityItem[];
}

export function RecentTransactions({ transactions = MOCK_ACTIVITY }: RecentActivityProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full h-full flex flex-col space-y-4"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Recent Activity
                        </h3>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Global Event Feed</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/40">Event Volume</span>
                        <span className="text-indigo-400">
                            {transactions.length} Events
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `100%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-[1.5rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col relative min-h-[500px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-none p-5 space-y-3 relative z-10">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Latest Feed
                    </h4>

                    {transactions.map((tx, i) => {
                        const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
                        const isCompleted = tx.type === 'income';
                        
                        return (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i }}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:bg-white/[0.04]",
                                    isCompleted ? "border-emerald-500/10 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                    </div>
                                    
                                    <div>
                                        <p className={cn(
                                            "text-[14px] font-bold tracking-tight transition-colors",
                                            isCompleted ? "text-emerald-400" : "text-white group-hover:text-indigo-400"
                                        )}>
                                            {tx.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                                {format(txDate, "MMM dd • p")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right relative z-10">
                                    <p className={cn(
                                        "text-[12px] font-black uppercase tracking-widest",
                                        isCompleted ? "text-emerald-400" : "text-white/50"
                                    )}>
                                        {isCompleted ? "Completed" : "Logged"}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between z-20 backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Total History</span>
                        <span className="text-[14px] font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {transactions.length} Records
                        </span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                        View All
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
