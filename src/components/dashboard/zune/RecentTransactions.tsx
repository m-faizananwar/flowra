"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ShoppingBag, Coffee, Home, Zap, ArrowRight, Wallet } from "lucide-react";

type Transaction = {
    id: string;
    title: string;
    amount: number;
    date: Date | string;
    category: "shopping" | "food" | "home" | "utilities" | "other";
    type: "income" | "expense";
};

const CATEGORY_ICONS = {
    shopping: ShoppingBag,
    food: Coffee,
    home: Home,
    utilities: Zap,
    other: Wallet,
};

const CATEGORY_COLORS = {
    shopping: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    food: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    home: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    utilities: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    other: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', title: 'Apple Store', amount: 999.00, date: new Date(), category: 'shopping', type: 'expense' },
    { id: '2', title: 'Starbucks', amount: 6.50, date: new Date(), category: 'food', type: 'expense' },
    { id: '3', title: 'Zune Subscription', amount: 15.00, date: new Date(), category: 'utilities', type: 'expense' },
    { id: '4', title: 'Rent Payment', amount: 2400.00, date: new Date(), category: 'home', type: 'expense' },
    { id: '5', title: 'Salary Deposit', amount: 8500.00, date: new Date(), category: 'other', type: 'income' },
];

interface RecentTransactionsProps {
    transactions?: Transaction[];
}

export function RecentTransactions({ transactions = MOCK_TRANSACTIONS }: RecentTransactionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-[2rem] p-6 h-full flex flex-col glass-panel"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Recent Activity
                </h3>
                <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white flex items-center gap-2 transition-all group">
                    View All
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {transactions.map((tx, i) => {
                    const Icon = CATEGORY_ICONS[tx.category] || Wallet;
                    const colorClass = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.other;
                    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);

                    return (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClass}`}>
                                    <Icon className="w-5 h-5 stroke-[1.5px]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-[#24FF7C] transition-colors tracking-tight">
                                        {tx.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                                        {format(txDate, "MMM dd • p")}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`text-[1.1rem] font-black tracking-tight ${tx.type === 'expense' ? 'text-white' : 'text-[#24FF7C]'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                                    {tx.type === 'expense' ? '-' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
