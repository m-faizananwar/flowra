"use client";

import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import {
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";

function EvaluationRadar({ data, heightClass = "h-44" }: { data: any[], heightClass?: string }) {
    if (!data || data.length < 3) return null;
    return (
        <div className={cn("w-full my-2", heightClass)}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis 
                        dataKey="name" 
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 'bold' }} 
                    />
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#24FF7C"
                        fill="#24FF7C"
                        fillOpacity={0.15}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TeamPerformanceRoster({ teamPerformance = [] }: { teamPerformance?: any[] }) {
    if (!teamPerformance || teamPerformance.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-panel p-8 rounded-[2.5rem] flex flex-col w-full"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Team Performance Roster.
                    </h3>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Latest Intelligence Evaluations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamPerformance.map((member) => {
                    const score = Number(member.score || 0);
                    const color = score >= 75 ? "text-[#24FF7C]" : score >= 50 ? "text-[#F59E0B]" : "text-[#FF8A8A]";

                    return (
                        <div key={member.id} className="flex flex-col gap-3 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle className="w-6 h-6 text-white/20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white truncate">{member.name}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest truncate">{member.role}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={cn("text-2xl font-black leading-none", color)} style={{ fontFamily: "Outfit, sans-serif" }}>
                                        {score.toFixed(0)}
                                    </span>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Score</span>
                                </div>
                            </div>
                            
                            {member.metrics && member.metrics.length >= 3 && (
                                <div className="pt-4 border-t border-white/[0.04] mt-2">
                                    <EvaluationRadar data={member.metrics} heightClass="h-36" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
