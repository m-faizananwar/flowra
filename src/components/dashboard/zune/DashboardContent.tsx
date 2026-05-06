"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { supabase } from "@/lib/supabase";
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
    const [overview, setOverview] = useState<any>(null);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch("/api/overview/data", {
                    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`Failed to load overview data: ${res.status}`);
                }
                const payload = await res.json();
                setOverview(payload);
            } catch (err) {
                console.error("[DashboardContent] overview fetch failed:", err);
                setOverview(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadOverview();
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
                            <TotalBalanceCard
                                sprintVelocity={overview?.kpis?.sprintVelocity}
                                completed={overview?.kpis?.completed}
                                inReview={overview?.kpis?.inReview}
                                blocked={overview?.kpis?.blocked}
                            />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <SummaryCards
                                totalSaved={overview?.kpis?.verifiedActions}
                                totalSpent={overview?.kpis?.totalWorkload}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Row 2: Sprint Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <SpendingTrendChart data={overview?.charts?.sprintTrend} />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <CategoryBreakdownChart data={overview?.charts?.categoryBreakdown} />
                        </motion.div>
                    </div>
                </div>

                {/* Row 3: Detail Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <ExpenseChart data={overview?.charts?.performanceSeries} />
                        </motion.div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <RecentTransactions transactions={overview?.feeds?.recentActivity} />
                        </motion.div>
                    </div>
                </div>

                {/* Row 4: Performance & Pending */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div variants={staggerItem}>
                            <SpendingHeatmap data={overview?.charts?.heatmap} />
                        </motion.div>
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div variants={staggerItem} className="h-full">
                            <PendingCommitments commitmentsData={overview?.feeds?.pendingCommitments} />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
