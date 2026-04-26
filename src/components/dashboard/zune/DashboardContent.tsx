"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { RecentTransactions } from "./RecentTransactions";
import { SummaryCards } from "./SummaryCards";
import { ExpenseChart } from "./ExpenseChart";
import { SpendingTrendChart } from "./SpendingTrendChart";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";
import { SpendingHeatmap } from "./SpendingHeatmap";
import { PendingCommitments } from "./PendingCommitments";

export function DashboardContent() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for that premium feel
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[1.5px] opacity-20" />
                    <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Syncing workflow.</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#24FF7C]">One moment.</p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="dashboard">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Row 1: Core Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <TotalBalanceCard />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <SummaryCards />
                        </motion.div>
                    </div>
                </div>

                {/* Row 2: Sprint Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <SpendingTrendChart />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <CategoryBreakdownChart />
                        </motion.div>
                    </div>
                </div>

                {/* Row 3: Detail Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <ExpenseChart />
                        </motion.div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <RecentTransactions />
                        </motion.div>
                    </div>
                </div>

                {/* Row 4: Performance & Pending */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <SpendingHeatmap />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <PendingCommitments />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
