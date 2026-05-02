"use client";

import { motion } from "framer-motion";
import { Clock, Loader2, Save } from "lucide-react";
import { staggerItem } from "@/components/animations/PageTransition";

interface EvaluationScheduleWidgetProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
    onSave: () => void;
    isSaving: boolean;
}

export function EvaluationScheduleWidget({
    settings,
    onSettingsChange,
    onSave,
    isSaving,
}: EvaluationScheduleWidgetProps) {
    return (
        <motion.div
            variants={staggerItem}
            className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl flex flex-col"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#24FF7C]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#24FF7C]" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-widest">Schedule</h3>
            </div>

            <div className="space-y-5 flex-1">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Run Time</label>
                    <input
                        type="time"
                        value={(settings.evaluation_run_time || "18:30").slice(0, 5)}
                        onChange={(event) => onSettingsChange({ ...settings, evaluation_run_time: event.target.value })}
                        className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Lookback Window (hours)</label>
                    <input
                        type="number"
                        min={1}
                        max={168}
                        value={settings.lookback_hours || 24}
                        onChange={(event) => onSettingsChange({ ...settings, lookback_hours: Number(event.target.value) })}
                        className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Timezone</label>
                    <input
                        value={settings.timezone || "Asia/Karachi"}
                        onChange={(event) => onSettingsChange({ ...settings, timezone: event.target.value })}
                        className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-3 text-sm text-white transition-colors"
                    />
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full h-11 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#24FF7C]/90 transition-colors disabled:opacity-50 mt-auto"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Schedule
                </button>
            </div>
        </motion.div>
    );
}
