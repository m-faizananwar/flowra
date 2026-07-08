"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Save, Trophy, UserCircle, History, ChevronDown } from "lucide-react";
import { staggerItem } from "@/components/animations/PageTransition";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PendingEvaluationsWidgetProps {
    pendingEvaluations: any[];
    activeEvaluation: any | null;
    draftScores: any[];
    metrics: any[];
    onSelectEvaluation: (evaluation: any) => void;
    onUpdateDraftScore: (metricId: string, value: number) => void;
    onSaveEvaluation: (status: string) => void;
    calculateTotal: (scores: any[], metrics: any[]) => number;
}

export function PendingEvaluationsWidget({
    pendingEvaluations,
    activeEvaluation,
    draftScores,
    metrics,
    onSelectEvaluation,
    onUpdateDraftScore,
    onSaveEvaluation,
    calculateTotal,
}: PendingEvaluationsWidgetProps) {
    const [showEditHistory, setShowEditHistory] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending List */}
            <motion.div
                variants={staggerItem}
                className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl lg:col-span-1"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-white uppercase tracking-widest">Pending Reviews</h3>
                    <motion.span
                        key={pendingEvaluations.length}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-[#24FF7C] text-black text-[10px] font-black flex items-center justify-center"
                    >
                        {pendingEvaluations.length}
                    </motion.span>
                </div>

                <div className="space-y-2 max-h-[560px] overflow-y-auto custom-scrollbar">
                    {pendingEvaluations.length === 0 ? (
                        <p className="text-sm text-white/35 p-4 rounded-xl border border-dashed border-white/10">No pending evaluations.</p>
                    ) : (
                        pendingEvaluations.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 4 }}
                                onClick={() => onSelectEvaluation(item)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all",
                                    activeEvaluation?.id === item.id
                                        ? "bg-[#24FF7C]/10 border-[#24FF7C]/30 shadow-[0_0_20px_rgba(36,255,124,0.1)]"
                                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                                )}
                            >
                                <p className="text-sm font-black text-white">{item.members?.full_name || item.members?.alias || "Member"}</p>
                                <p className="text-[10px] text-white/35 mt-1 line-clamp-1">{item.summary || "Pending evaluation"}</p>
                                <p className="text-xl font-black text-[#24FF7C] mt-3">{Number(item.total_score).toFixed(1)}</p>
                            </motion.button>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Review Panel */}
            <motion.div
                variants={staggerItem}
                className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl lg:col-span-2"
            >
                {activeEvaluation ? (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {activeEvaluation.members?.avatar_url ? (
                                    <Image
                                        src={activeEvaluation.members.avatar_url}
                                        alt=""
                                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/10"
                                        width={56} height={56} unoptimized
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#24FF7C]/20 to-[#24FF7C]/5 border border-white/10 flex items-center justify-center">
                                        <UserCircle className="w-8 h-8 text-white/30" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-2xl font-black text-white">{activeEvaluation.members?.full_name || "Member"}</h3>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{activeEvaluation.members?.role || "Unassigned role"}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">Weighted total</p>
                                <motion.p
                                    key={calculateTotal(draftScores, metrics)}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-5xl font-black text-[#24FF7C]"
                                >
                                    {calculateTotal(draftScores, metrics).toFixed(1)}
                                </motion.p>
                            </div>
                        </div>

                        <p className="text-sm text-white/45 leading-relaxed">{activeEvaluation.summary}</p>

                        <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                            {draftScores.map((score) => (
                                <motion.div
                                    key={score.metric_id}
                                    whileHover={{ y: -2 }}
                                    className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-white">{score.name}</p>
                                            <p className="text-xs text-white/35 mt-1">{score.rationale}</p>
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={Math.round(Number(score.score || 0))}
                                            onChange={(event) => onUpdateDraftScore(score.metric_id, Number(event.target.value))}
                                            className="w-24 h-10 rounded-lg bg-white/[0.06] border border-white/10 hover:border-white/20 px-3 text-right text-sm font-black text-white transition-colors"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                onClick={() => onSaveEvaluation("pending")}
                                className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                            >
                                <Save className="w-4 h-4" /> Save Edits
                            </button>
                            <button
                                onClick={() => onSaveEvaluation("approved")}
                                className="h-11 px-5 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#24FF7C]/90 transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Approve Evaluation
                            </button>
                        </div>

                        {(activeEvaluation.edit_history || []).length > 0 && (
                            <div className="border border-white/10 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setShowEditHistory((v) => !v)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                        <History className="w-3.5 h-3.5" />
                                        Edit History ({(activeEvaluation.edit_history || []).length})
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 text-white/20 transition-transform",
                                            showEditHistory && "rotate-180"
                                        )}
                                    />
                                </button>
                                {showEditHistory && (
                                    <div className="divide-y divide-white/[0.04] max-h-[200px] overflow-y-auto">
                                        {[...(activeEvaluation.edit_history || [])].reverse().map((entry: any, i: number) => (
                                            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
                                                <div>
                                                    <span
                                                        className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            entry.action === "approved" ? "text-[#24FF7C]" : "text-white/40"
                                                        )}
                                                    >
                                                        {entry.action}
                                                    </span>
                                                    <p className="text-[11px] text-white/20 mt-0.5">
                                                        {new Date(entry.edited_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className="text-lg font-black text-white/40">
                                                    {Number(entry.snapshot?.total_score || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-4">
                        <Trophy className="w-16 h-16 text-white/5" />
                        <div>
                            <p className="text-sm font-black text-white/50">No active evaluation</p>
                            <p className="text-[10px] text-white/25 mt-1">Select from pending reviews or run a new evaluation</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
