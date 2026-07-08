"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { UserCircle } from "lucide-react";
import { staggerItem } from "@/components/animations/PageTransition";

interface TeamMembersWidgetProps {
    members: any[];
    evaluations: any[];
}

export function TeamMembersWidget({ members, evaluations }: TeamMembersWidgetProps) {
    return (
        <motion.div
            variants={staggerItem}
            className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#24FF7C]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#24FF7C]" />
                </div>
                <div>
                    <h3 className="text-base font-black text-white uppercase tracking-widest">Team Members</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.1em]">{members.length} in workspace</p>
                </div>
            </div>

            {members.length === 0 ? (
                <p className="text-sm text-white/25">No members in workspace yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {members.map((member) => {
                        const latestEval = evaluations.find((e) => e.members?.id === member.id && e.status === "approved");
                        return (
                            <motion.div
                                key={member.id}
                                whileHover={{ y: -4 }}
                                className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {member.avatar_url ? (
                                            <Image src={member.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/10" width={40} height={40} unoptimized />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#24FF7C]/20 to-[#24FF7C]/5 border border-white/10 flex items-center justify-center">
                                                <UserCircle className="w-6 h-6 text-white/30" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white truncate">{member.full_name || member.alias}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{member.role || "Unassigned"}</p>
                                        </div>
                                    </div>
                                    {latestEval && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-xl font-black text-[#24FF7C] flex-shrink-0"
                                        >
                                            {Number(latestEval.total_score).toFixed(1)}
                                        </motion.span>
                                    )}
                                </div>
                                {!latestEval && (
                                    <p className="text-[10px] text-white/25 italic">No evaluation yet</p>
                                )}
                                {latestEval && (
                                    <p className="text-[10px] text-white/35 line-clamp-2">{latestEval.summary}</p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
