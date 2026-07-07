"use client";

import { motion } from "framer-motion";
import { Plus, SlidersHorizontal } from "lucide-react";
import { staggerItem } from "@/components/animations/PageTransition";

interface MetricsDefinitionWidgetProps {
    metrics: any[];
    newMetric: any;
    onNewMetricChange: (metric: any) => void;
    onAddMetric: () => void;
}

export function MetricsDefinitionWidget({
    metrics,
    newMetric,
    onNewMetricChange,
    onAddMetric,
}: MetricsDefinitionWidgetProps) {
    const globalMetrics = metrics.filter((m) => !m.role && !m.member_id);
    const roleGroups = metrics.reduce<Record<string, any[]>>((acc, m) => {
        if (!m.role) return acc;
        if (!acc[m.role]) acc[m.role] = [];
        acc[m.role].push(m);
        return acc;
    }, {});

    return (
        <motion.div
            variants={staggerItem}
            className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl col-span-1 lg:col-span-2"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#24FF7C]/10 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-[#24FF7C]" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-widest">Evaluation Metrics</h3>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Add New Metric</p>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_100px_auto] gap-3">
                        <input
                            placeholder="Metric name"
                            value={newMetric.name}
                            onChange={(event) => onNewMetricChange({ ...newMetric, name: event.target.value })}
                            className="h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white placeholder:text-white/20 transition-colors"
                        />
                        <input
                            placeholder="Description"
                            value={newMetric.description}
                            onChange={(event) => onNewMetricChange({ ...newMetric, description: event.target.value })}
                            className="h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white placeholder:text-white/20 transition-colors"
                        />
                        <input
                            placeholder="Role (optional)"
                            value={newMetric.role}
                            onChange={(event) => onNewMetricChange({ ...newMetric, role: event.target.value })}
                            className="h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white placeholder:text-white/20 transition-colors"
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={newMetric.weight}
                            onChange={(event) => onNewMetricChange({ ...newMetric, weight: Number(event.target.value) })}
                            className="h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white transition-colors"
                        />
                        <button
                            onClick={onAddMetric}
                            className="h-11 px-4 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#24FF7C]/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                    {globalMetrics.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Global — All Roles</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {globalMetrics.map((metric) => (
                                    <motion.div
                                        key={metric.id}
                                        whileHover={{ y: -2 }}
                                        className="p-3 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
                                    >
                                        <p className="text-sm font-black text-white">{metric.name}</p>
                                        <p className="text-[10px] text-white/40 mt-1">{metric.description}</p>
                                        <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                                            <span>Weight: {metric.weight}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.entries(roleGroups).map(([role, roleMetrics]) => (
                        <div key={role}>
                            <p className="text-[10px] font-black text-[#24FF7C]/60 uppercase tracking-[0.2em] mb-3">
                                {role} — Role-Specific
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {roleMetrics.map((metric) => (
                                    <motion.div
                                        key={metric.id}
                                        whileHover={{ y: -2 }}
                                        className="p-3 rounded-lg bg-[#24FF7C]/5 border border-[#24FF7C]/20 hover:border-[#24FF7C]/40 transition-all"
                                    >
                                        <p className="text-sm font-black text-white">{metric.name}</p>
                                        <p className="text-[10px] text-white/40 mt-1">{metric.description}</p>
                                        <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                                            <span>Weight: {metric.weight}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(roleGroups).length === 0 && globalMetrics.length === 0 && (
                        <p className="text-[10px] text-white/25 italic">No metrics defined yet. Create one to get started.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
