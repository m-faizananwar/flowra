"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Clock,
    History,
    Loader2,
    Play,
    Save,
    Search,
    ShieldAlert,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const DEFAULT_SETTING = {
    timezone: "Asia/Karachi",
    risk_run_time: "18:00",
    evaluation_run_time: "18:30",
    lookback_hours: 24,
    risk_enabled: true,
    evaluation_enabled: true,
};

const SEV = {
    low:      { color: "#60A5FA", bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-300",   hex: "#60A5FA" },
    medium:   { color: "#F59E0B", bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-300",  hex: "#F59E0B" },
    high:     { color: "#FB923C", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-300", hex: "#FB923C" },
    critical: { color: "#F87171", bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-300",    hex: "#F87171" },
};

function SeverityBadge({ severity }: { severity: string }) {
    const s = SEV[severity as keyof typeof SEV] || SEV.medium;
    return (
        <span className={cn("inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest", s.bg, s.border, s.text)}>
            {severity}
        </span>
    );
}

export function TriageHubContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>(DEFAULT_SETTING);
    const [risks, setRisks] = useState<any[]>([]);
    const [activeRisk, setActiveRisk] = useState<any | null>(null);
    const [draft, setDraft] = useState<any | null>(null);
    const [showEditHistory, setShowEditHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState("");
    const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "week" | "month">("all");
    const [historySeverity, setHistorySeverity] = useState("all");

    const pendingRisks = useMemo(() => risks.filter((r) => r.status === "pending"), [risks]);
    const approvedRisks = useMemo(() => {
        const approved = risks.filter((r) => r.status === "approved");
        const now = new Date();
        return approved.filter((r) => {
            const matchSearch = !historySearch || r.title?.toLowerCase().includes(historySearch.toLowerCase()) || r.description?.toLowerCase().includes(historySearch.toLowerCase());
            const matchSev = historySeverity === "all" || r.severity === historySeverity;
            if (!matchSearch || !matchSev) return false;
            if (historyDateFilter === "all") return true;
            const d = new Date(r.created_at);
            if (historyDateFilter === "today") return d.toDateString() === now.toDateString();
            if (historyDateFilter === "week") return now.getTime() - d.getTime() < 7 * 86400000;
            if (historyDateFilter === "month") return now.getTime() - d.getTime() < 30 * 86400000;
            return true;
        });
    }, [risks, historySearch, historyDateFilter, historySeverity]);

    const sevCounts = useMemo(() => {
        const all = [...pendingRisks, ...approvedRisks];
        return ["critical", "high", "medium", "low"].map((s) => ({
            name: s,
            value: all.filter((r) => r.severity === s).length,
            color: SEV[s as keyof typeof SEV].hex,
        })).filter((s) => s.value > 0);
    }, [pendingRisks, approvedRisks]);

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if (activeRisk) setDraft({ title: activeRisk.title || "", description: activeRisk.description || "", severity: activeRisk.severity || "medium", category: activeRisk.category || "project", confidence: Number(activeRisk.confidence || 0.5), recommendationsText: (activeRisk.recommendations || []).join("\n") });
    }, [activeRisk]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in.");
            setUserId(user.id);
            const [sRes, rRes] = await Promise.all([
                supabase.from("analysis_settings").select("*").eq("user_id", user.id).maybeSingle(),
                supabase.from("risk_assessments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(80),
            ]);
            if (sRes.error && sRes.error.code !== "PGRST116") throw sRes.error;
            if (rRes.error) throw rRes.error;
            if (!sRes.data) {
                const { data } = await supabase.from("analysis_settings").insert({ user_id: user.id, ...DEFAULT_SETTING }).select("*").single();
                setSettings(data);
            } else setSettings(sRes.data);
            setRisks(rRes.data || []);
            setActiveRisk((rRes.data || []).find((r) => r.status === "pending") || null);
        } catch (e: any) { toast.error(e.message); }
        finally { setIsLoading(false); }
    };

    const saveSettings = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { data } = await supabase.from("analysis_settings").upsert({ ...settings, user_id: userId }, { onConflict: "user_id" }).select("*").single();
            setSettings(data);
            toast.success("Schedule saved.");
        } catch (e: any) { toast.error(e.message); }
        finally { setIsSaving(false); }
    };

    const runRiskAssessment = async () => {
        setIsRunning(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/analysis/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ analysis_type: "risk" }) });
            const p = await res.json();
            if (!res.ok) throw new Error(p.error || "Failed.");
            toast.success("Risk assessment complete. Review pending cards.");
            await loadData();
        } catch (e: any) { toast.error(e.message); }
        finally { setIsRunning(false); }
    };

    const saveRiskDraft = async (status = "pending") => {
        if (!activeRisk || !draft) return;
        try {
            const now = new Date().toISOString();
            const recommendations = draft.recommendationsText.split("\n").map((s: string) => s.trim()).filter(Boolean);
            const historyEntry = { edited_at: now, edited_by: userId, action: status === "approved" ? "approved" : "edited", snapshot: { title: draft.title, severity: draft.severity, category: draft.category, confidence: draft.confidence } };
            const updates: any = { ...draft, recommendations, status, updated_at: now, edit_history: [...(activeRisk.edit_history || []), historyEntry], recommendationsText: undefined };
            delete updates.recommendationsText;
            if (status === "approved") { updates.approved_at = now; updates.approved_by = userId; }
            await supabase.from("risk_assessments").update(updates).eq("id", activeRisk.id);
            await supabase.from("approval_requests").update({ status, reviewed_at: status === "pending" ? null : now, reviewed_by: status === "pending" ? null : userId }).eq("request_type", "risk_assessment").eq("target_id", activeRisk.id);
            toast.success(status === "approved" ? "Risk approved." : "Draft saved.");
            await loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-[#FF8A8A] animate-spin stroke-[1.5px] opacity-20" />
                <Loader2 className="w-16 h-16 text-[#FF8A8A] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Scanning threats.</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF8A8A]">One moment.</p>
            </div>
        </div>
    );

    const totalRisks = pendingRisks.length + approvedRisks.length;
    const criticalCount = risks.filter((r) => r.severity === "critical").length;
    const highCount = risks.filter((r) => r.severity === "high").length;

    return (
        <PageTransition pageTitle="Risk Assessment">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">

                {/* ── Row 1: Hero + Breakdown ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hero */}
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF8A8A]/[0.04] rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-[#FF8A8A] animate-pulse" />
                                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Risk Assessment</p>
                                {pendingRisks.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[10px] font-black text-[#F59E0B]">{pendingRisks.length} pending review</span>
                                )}
                            </div>
                            <h2 className="text-[4rem] lg:text-[5rem] font-black text-white tracking-tighter leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                                {totalRisks}
                                <span className="text-2xl text-white/20 ml-2">risks</span>
                            </h2>
                            <p className="text-white/30 text-sm mt-3 italic">
                                {criticalCount > 0 ? `${criticalCount} critical risk${criticalCount > 1 ? "s" : ""} require immediate attention.` : highCount > 0 ? `${highCount} high-severity risk${highCount > 1 ? "s" : ""} detected.` : "No critical risks detected in current window."}
                            </p>
                        </div>
                        <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.05] grid grid-cols-4 gap-4">
                            {(["critical", "high", "medium", "low"] as const).map((s) => {
                                const count = risks.filter((r) => r.severity === s).length;
                                const style = SEV[s];
                                return (
                                    <div key={s}>
                                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{s}</p>
                                        <p className={cn("text-2xl font-black", style.text)} style={{ fontFamily: "Outfit, sans-serif" }}>{count}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Donut + Schedule */}
                    <motion.div variants={staggerItem} className="flex flex-col gap-4">
                        {sevCounts.length > 0 && (
                            <div className="glass-panel rounded-[2rem] p-5 flex items-center gap-4">
                                <ResponsiveContainer width={90} height={90}>
                                    <PieChart>
                                        <Pie data={sevCounts} cx="50%" cy="50%" innerRadius={26} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {sevCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#17181C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", fontSize: "11px", color: "#fff" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2">
                                    {sevCounts.map((s) => (
                                        <div key={s.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                                            <span className="text-[11px] font-black text-white/40 uppercase tracking-wider">{s.name}</span>
                                            <span className="text-[11px] font-black text-white ml-auto">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="glass-panel rounded-[2rem] p-5 space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#FF8A8A]" />
                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Schedule</p>
                            </div>
                            <label className="block space-y-1.5">
                                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Daily run time</span>
                                <input type="time" value={(settings.risk_run_time || "18:00").slice(0, 5)} onChange={(e) => setSettings({ ...settings, risk_run_time: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#FF8A8A]/40" />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Timezone</span>
                                <input value={settings.timezone || "Asia/Karachi"} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#FF8A8A]/40" />
                            </label>
                            <button onClick={saveSettings} disabled={isSaving} className="w-full h-10 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                            </button>
                        </div>

                        <button onClick={runRiskAssessment} disabled={isRunning} className="glass-panel rounded-[2rem] p-5 flex items-center gap-4 group hover:border-[#FF8A8A]/30 transition-all disabled:opacity-50 border border-transparent">
                            <div className="w-12 h-12 rounded-2xl bg-[#FF8A8A]/20 border border-[#FF8A8A]/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                {isRunning ? <Loader2 className="w-5 h-5 text-[#FF8A8A] animate-spin" /> : <Zap className="w-5 h-5 text-[#FF8A8A] stroke-[2.5px]" />}
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black text-white group-hover:text-[#FF8A8A] transition-colors">Run Risk Now</p>
                                <p className="text-[10px] text-white/30 mt-0.5">Triggers full AI threat analysis</p>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* ── Row 2: Pending + Editor ── */}
                {pendingRisks.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pending list */}
                        <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Pending Risks</p>
                                </div>
                                <span className="text-[10px] font-black text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full">{pendingRisks.length}</span>
                            </div>
                            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                                {pendingRisks.map((risk) => {
                                    const s = SEV[risk.severity as keyof typeof SEV] || SEV.medium;
                                    return (
                                        <button key={risk.id} onClick={() => setActiveRisk(risk)} className={cn("w-full text-left p-4 rounded-xl border transition-all space-y-2", activeRisk?.id === risk.id ? "bg-[#FF8A8A]/[0.06] border-[#FF8A8A]/20" : "bg-white/[0.02] border-white/[0.06] hover:border-white/10")}>
                                            <SeverityBadge severity={risk.severity} />
                                            <p className="text-sm font-black text-white">{risk.title}</p>
                                            <p className="text-xs text-white/30 line-clamp-2">{risk.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Editor */}
                        <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8">
                            {activeRisk && draft ? (
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center", SEV[draft.severity as keyof typeof SEV]?.bg || "bg-red-500/10", SEV[draft.severity as keyof typeof SEV]?.border || "border-red-500/20")}>
                                                <ShieldAlert className={cn("w-6 h-6", SEV[draft.severity as keyof typeof SEV]?.text || "text-red-300")} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Confidence {(Number(draft.confidence) * 100).toFixed(0)}%</p>
                                                <h3 className="text-xl font-black text-white mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>Review Risk Card</h3>
                                            </div>
                                        </div>
                                        <SeverityBadge severity={draft.severity} />
                                    </div>

                                    <label className="block space-y-1.5">
                                        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Title</span>
                                        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full h-12 rounded-xl bg-black/30 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-[#FF8A8A]/40" />
                                    </label>

                                    <div className="grid grid-cols-3 gap-3">
                                        <label className="block space-y-1.5">
                                            <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Severity</span>
                                            <select value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none">
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </label>
                                        <label className="block space-y-1.5">
                                            <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Category</span>
                                            <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none" />
                                        </label>
                                        <label className="block space-y-1.5">
                                            <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Confidence</span>
                                            <input type="number" min={0} max={1} step={0.05} value={draft.confidence} onChange={(e) => setDraft({ ...draft, confidence: Number(e.target.value) })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none" />
                                        </label>
                                    </div>

                                    <label className="block space-y-1.5">
                                        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Description</span>
                                        <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-[#FF8A8A]/40" />
                                    </label>

                                    <label className="block space-y-1.5">
                                        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Recommendations (one per line)</span>
                                        <textarea value={draft.recommendationsText} onChange={(e) => setDraft({ ...draft, recommendationsText: e.target.value })} rows={3} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-[#FF8A8A]/40" />
                                    </label>

                                    <div className="flex gap-3">
                                        <button onClick={() => saveRiskDraft("pending")} className="h-12 px-5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                            <Save className="w-4 h-4" /> Save Edits
                                        </button>
                                        <button onClick={() => saveRiskDraft("approved")} className="h-12 px-6 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(36,255,124,0.3)] hover:shadow-[0_0_30px_rgba(36,255,124,0.5)] transition-all">
                                            <CheckCircle2 className="w-4 h-4" /> Approve Risk
                                        </button>
                                    </div>

                                    {(activeRisk.edit_history || []).length > 0 && (
                                        <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                                            <button onClick={() => setShowEditHistory((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-black/20 hover:bg-black/30 transition-colors">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/25 uppercase tracking-widest">
                                                    <History className="w-3.5 h-3.5" /> Edit History ({(activeRisk.edit_history || []).length})
                                                </div>
                                                <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", showEditHistory && "rotate-180")} />
                                            </button>
                                            {showEditHistory && (
                                                <div className="divide-y divide-white/[0.04]">
                                                    {[...(activeRisk.edit_history || [])].reverse().map((entry: any, i: number) => (
                                                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                                                            <div>
                                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", entry.action === "approved" ? "text-[#24FF7C]" : "text-white/40")}>{entry.action}</span>
                                                                <p className="text-[11px] text-white/20 mt-0.5">{new Date(entry.edited_at).toLocaleString()}</p>
                                                            </div>
                                                            <SeverityBadge severity={entry.snapshot?.severity || "medium"} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center gap-4">
                                    <AlertTriangle className="w-14 h-14 text-white/[0.06]" />
                                    <p className="text-sm text-white/25">Select a pending risk card to review AI findings and approve.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* ── Empty state: no pending ── */}
                {pendingRisks.length === 0 && (
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-[#24FF7C]" />
                        </div>
                        <p className="text-lg font-black text-white">No pending risks</p>
                        <p className="text-sm text-white/30 max-w-sm">All risk cards have been reviewed. Run a new assessment or check the history below.</p>
                    </motion.div>
                )}

                {/* ── Row 3: Approved History ── */}
                <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#FF8A8A]/10 border border-[#FF8A8A]/20 flex items-center justify-center">
                                <History className="w-5 h-5 text-[#FF8A8A]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">Approved Risk History</h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{approvedRisks.length} records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input type="text" placeholder="Search risks..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="h-9 pl-9 pr-8 rounded-xl bg-black/30 border border-white/10 text-sm text-white w-44 focus:outline-none placeholder:text-white/20" />
                                {historySearch && <button onClick={() => setHistorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
                            </div>
                            <select value={historySeverity} onChange={(e) => setHistorySeverity(e.target.value)} className="h-9 px-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white focus:outline-none">
                                <option value="all">All severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <div className="flex items-center bg-black/30 rounded-xl border border-white/10 p-1 gap-0.5">
                                {(["all", "today", "week", "month"] as const).map((f) => (
                                    <button key={f} onClick={() => setHistoryDateFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", historyDateFilter === f ? "bg-white text-black" : "text-white/30 hover:text-white")}>{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {approvedRisks.length === 0 ? (
                        <p className="text-sm text-white/20 text-center py-8">No approved risks match your filters.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {approvedRisks.map((risk) => (
                                <div key={risk.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <SeverityBadge severity={risk.severity} />
                                        <span className="text-[10px] text-white/20">{new Date(risk.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{risk.title}</p>
                                    <p className="text-xs text-white/30 line-clamp-3">{risk.description}</p>
                                    {risk.recommendations?.length > 0 && (
                                        <div className="pt-1 border-t border-white/[0.04] space-y-1">
                                            {risk.recommendations.slice(0, 2).map((r: string, i: number) => (
                                                <p key={i} className="text-[11px] text-white/25 flex gap-2"><span className="text-[#24FF7C] shrink-0">→</span>{r}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </PageTransition>
    );
}
