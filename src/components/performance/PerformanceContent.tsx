"use client";

import { motion } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Clock,
    History,
    Loader2,
    Play,
    Plus,
    Save,
    Search,
    SlidersHorizontal,
    Trophy,
    UserCircle,
    Users,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { toast } from "sonner";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const DEFAULT_SETTING = {
    timezone: "Asia/Karachi",
    evaluation_run_time: "18:30",
    risk_run_time: "18:00",
    lookback_hours: 24,
    evaluation_enabled: true,
    risk_enabled: true,
};

function EvaluationRadar({ data }: { data: any[] }) {
    if (!data || data.length < 3) return null;
    return (
        <div className="h-44 w-full my-2">
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

function calculateTotal(scores: any[], metrics: any[]) {
    const weights = new Map(metrics.map((m) => [m.id, Number(m.weight || 1)]));
    let weighted = 0, totalWeight = 0;
    for (const s of scores || []) {
        const w = weights.get(s.metric_id) || 1;
        weighted += Number(s.score || 0) * w;
        totalWeight += w;
    }
    return totalWeight ? Math.round((weighted / totalWeight) * 100) / 100 : 0;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const color = score >= 75 ? "#24FF7C" : score >= 50 ? "#F59E0B" : "#FF8A8A";
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
    );
}

export function PerformanceContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>(DEFAULT_SETTING);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [activeEvaluation, setActiveEvaluation] = useState<any | null>(null);
    const [draftScores, setDraftScores] = useState<any[]>([]);
    const [newMetric, setNewMetric] = useState({ name: "", description: "", weight: 1, role: "", member_id: "" });
    const roles = useMemo(() => Array.from(new Set(members.map((m) => m.role).filter(Boolean))), [members]);
    const [showEditHistory, setShowEditHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState("");
    const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "week" | "month">("all");

    const pendingEvaluations = useMemo(() => evaluations.filter((e) => e.status === "pending"), [evaluations]);
    const approvedEvaluations = useMemo(() => {
        const approved = evaluations.filter((e) => e.status === "approved");
        const now = new Date();
        return approved.filter((e) => {
            const matchSearch = !historySearch ||
                (e.members?.full_name || "").toLowerCase().includes(historySearch.toLowerCase()) ||
                (e.summary || "").toLowerCase().includes(historySearch.toLowerCase());
            if (!matchSearch) return false;
            if (historyDateFilter === "all") return true;
            const d = new Date(e.created_at);
            if (historyDateFilter === "today") return d.toDateString() === now.toDateString();
            if (historyDateFilter === "week") return now.getTime() - d.getTime() < 7 * 86400000;
            if (historyDateFilter === "month") return now.getTime() - d.getTime() < 30 * 86400000;
            return true;
        });
    }, [evaluations, historySearch, historyDateFilter]);

    const teamAvg = useMemo(() => {
        const scored = approvedEvaluations.filter((e) => e.total_score > 0);
        if (!scored.length) return 0;
        return Math.round(scored.reduce((s, e) => s + Number(e.total_score), 0) / scored.length * 10) / 10;
    }, [approvedEvaluations]);

    const memberScoreMap = useMemo(() => {
        const map: Record<string, any> = {};
        for (const e of approvedEvaluations) {
            if (e.member_id && (!map[e.member_id] || new Date(e.created_at) > new Date(map[e.member_id].created_at))) {
                map[e.member_id] = e;
            }
        }
        return map;
    }, [approvedEvaluations]);

    const chartData = useMemo(() =>
        members.map((m) => ({
            name: (m.full_name || m.alias || "?").split(" ")[0],
            score: Number(memberScoreMap[m.id]?.total_score || 0),
            role: m.role || "—",
        })),
        [members, memberScoreMap]);

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if (activeEvaluation) setDraftScores(activeEvaluation.metric_scores || []); }, [activeEvaluation]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in.");
            setUserId(user.id);
            const [sRes, mRes, memRes, eRes] = await Promise.all([
                supabase.from("analysis_settings").select("*").eq("user_id", user.id).maybeSingle(),
                supabase.from("evaluation_metrics").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
                supabase.from("members").select("id, full_name, alias, role, avatar_url").eq("user_id", user.id).order("full_name"),
                supabase.from("member_evaluations").select("*, members(id, full_name, alias, role, avatar_url)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60),
            ]);
            if (sRes.error && sRes.error.code !== "PGRST116") throw sRes.error;
            if (mRes.error) throw mRes.error;
            if (memRes.error) throw memRes.error;
            if (eRes.error) throw eRes.error;
            if (!sRes.data) {
                const { data } = await supabase.from("analysis_settings").insert({ user_id: user.id, ...DEFAULT_SETTING }).select("*").single();
                setSettings(data);
            } else setSettings(sRes.data);
            setMetrics(mRes.data || []);
            setMembers(memRes.data || []);
            setEvaluations(eRes.data || []);
            setActiveEvaluation((eRes.data || []).find((e) => e.status === "pending") || null);
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

    const addMetric = async () => {
        if (!userId || !newMetric.name.trim()) return;
        try {
            await supabase.from("evaluation_metrics").insert({ user_id: userId, name: newMetric.name.trim(), description: newMetric.description.trim(), weight: Number(newMetric.weight) || 1, role: newMetric.role === "all" || !newMetric.role ? null : newMetric.role, member_id: newMetric.member_id === "all" || !newMetric.member_id ? null : newMetric.member_id, is_enabled: true });
            setNewMetric({ name: "", description: "", weight: 1, role: "", member_id: "" });
            await loadData();
            toast.success("Metric added.");
        } catch (e: any) { toast.error(e.message); }
    };

    const runEvaluation = async () => {
        setIsRunning(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/analysis/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ analysis_type: "evaluation" }) });
            const p = await res.json();
            if (!res.ok) throw new Error(p.error || "Failed.");
            toast.success("Evaluation complete. Review pending cards.");
            await loadData();
        } catch (e: any) { toast.error(e.message); }
        finally { setIsRunning(false); }
    };

    const updateDraftScore = (metricId: string, value: number) =>
        setDraftScores((prev) => prev.map((s) => s.metric_id === metricId ? { ...s, score: Math.max(0, Math.min(100, value)) } : s));

    const saveEvaluationDraft = async (status = "pending") => {
        if (!activeEvaluation) return;
        const totalScore = calculateTotal(draftScores, metrics);
        try {
            const now = new Date().toISOString();
            const historyEntry = { edited_at: now, edited_by: userId, action: status === "approved" ? "approved" : "edited", snapshot: { metric_scores: draftScores, total_score: totalScore } };
            const updates: any = { metric_scores: draftScores, total_score: totalScore, status, updated_at: now, edit_history: [...(activeEvaluation.edit_history || []), historyEntry] };
            if (status === "approved") { updates.approved_at = now; updates.approved_by = userId; }
            await supabase.from("member_evaluations").update(updates).eq("id", activeEvaluation.id);
            await supabase.from("approval_requests").update({ status, reviewed_at: status === "pending" ? null : now, reviewed_by: status === "pending" ? null : userId }).eq("request_type", "member_evaluation").eq("target_id", activeEvaluation.id);
            toast.success(status === "approved" ? "Evaluation approved." : "Draft saved.");
            await loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[1.5px] opacity-20" />
                <Loader2 className="w-16 h-16 text-[#24FF7C] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Loading intelligence.</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#24FF7C]">One moment.</p>
            </div>
        </div>
    );

    const globalMetrics = metrics.filter((m) => !m.role && !m.member_id);
    const roleGroups = metrics.reduce<Record<string, any[]>>((acc, m) => {
        if (!m.role) return acc;
        if (!acc[m.role]) acc[m.role] = [];
        acc[m.role].push(m);
        return acc;
    }, {});

    return (
        <PageTransition pageTitle="Performance">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">

                {/* ── Row 1: Hero + Stats ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hero Card */}
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-[#24FF7C]/[0.04] rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-[#24FF7C] animate-pulse" />
                                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Member Evaluation</p>
                            </div>
                            <h2 className="text-[4rem] lg:text-[5rem] font-black text-white tracking-tighter leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                                {teamAvg > 0 ? `${teamAvg}` : "—"}
                                {teamAvg > 0 && <span className="text-2xl text-white/20 ml-2">/100</span>}
                            </h2>
                            <p className="text-white/30 text-sm mt-3 italic">
                                {teamAvg > 0 ? "Team weighted average score across all approved evaluations." : "Run your first evaluation to see team scores."}
                            </p>
                        </div>
                        <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.05] grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Members</p>
                                <p className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{members.length}</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pending</p>
                                <p className="text-3xl font-black text-[#F59E0B]" style={{ fontFamily: "Outfit, sans-serif" }}>{pendingEvaluations.length}</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Approved</p>
                                <p className="text-3xl font-black text-[#24FF7C]" style={{ fontFamily: "Outfit, sans-serif" }}>{approvedEvaluations.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Run + Schedule widget */}
                    <motion.div variants={staggerItem} className="flex flex-col gap-4">
                        <div className="glass-panel rounded-[2rem] p-6 space-y-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-[#24FF7C]" />
                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Schedule</p>
                            </div>
                            <label className="block space-y-1.5">
                                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Daily run time</span>
                                <input type="time" value={(settings.evaluation_run_time || "18:30").slice(0, 5)} onChange={(e) => setSettings({ ...settings, evaluation_run_time: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50" />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Timezone</span>
                                <input value={settings.timezone || "Asia/Karachi"} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50" />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Lookback hours</span>
                                <input type="number" min={1} max={168} value={settings.lookback_hours || 24} onChange={(e) => setSettings({ ...settings, lookback_hours: Number(e.target.value) })} className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50" />
                            </label>
                            <button onClick={saveSettings} disabled={isSaving} className="w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Schedule
                            </button>
                        </div>
                        <button onClick={runEvaluation} disabled={isRunning} className="glass-panel rounded-[2rem] p-5 flex items-center gap-4 group hover:border-[#24FF7C]/30 transition-all disabled:opacity-50 border border-transparent">
                            <div className="w-12 h-12 rounded-2xl bg-[#24FF7C] flex items-center justify-center shadow-[0_0_20px_rgba(36,255,124,0.4)] group-hover:scale-110 transition-transform shrink-0">
                                {isRunning ? <Loader2 className="w-5 h-5 text-black animate-spin" /> : <Play className="w-5 h-5 text-black stroke-[3px]" />}
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-black text-white group-hover:text-[#24FF7C] transition-colors">Run Evaluation Now</p>
                                <p className="text-[10px] text-white/30 mt-0.5">Triggers full AI analysis pipeline</p>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* ── Row 2: Member Score Chart ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white tracking-tight italic" style={{ fontFamily: "Outfit, sans-serif" }}>
                                Team Scores.
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#24FF7C]" /><span className="text-[10px] font-black text-white/30 uppercase tracking-wider">75+</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F59E0B]" /><span className="text-[10px] font-black text-white/30 uppercase tracking-wider">50–74</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF8A8A]" /><span className="text-[10px] font-black text-white/30 uppercase tracking-wider">&lt;50</span></div>
                            </div>
                        </div>
                        {chartData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No members yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 900, letterSpacing: "0.05em" }} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ backgroundColor: "#17181C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "0.75rem", color: "#fff", fontSize: "12px" }} formatter={(v: any) => [`${v}/100`, "Score"]} />
                                    <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={38} isAnimationActive>
                                        {chartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.score >= 75 ? "#24FF7C" : entry.score >= 50 ? "#F59E0B" : entry.score > 0 ? "#FF8A8A" : "rgba(255,255,255,0.08)"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    {/* Member roster */}
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-6 space-y-4 overflow-y-auto max-h-[380px] custom-scrollbar">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#24FF7C]" />
                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Workspace Members</p>
                            </div>
                            <span className="text-[10px] font-black text-white/20">{members.length}</span>
                        </div>
                        {members.length === 0 ? (
                            <p className="text-sm text-white/20 py-4">No members in workspace.</p>
                        ) : members.map((member) => {
                            const latest = memberScoreMap[member.id];
                            const score = latest ? Number(latest.total_score) : null;
                            const color = score === null ? "text-white/20" : score >= 75 ? "text-[#24FF7C]" : score >= 50 ? "text-[#F59E0B]" : "text-[#FF8A8A]";
                            return (
                                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all">
                                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-5 h-5 text-white/20" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate">{member.full_name || member.alias}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest truncate">{member.role || "No role"}</p>
                                    </div>
                                    <span className={cn("text-lg font-black flex-shrink-0", color)}>{score !== null ? score.toFixed(0) : "—"}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* ── Row 3: Pending Evaluations ── */}
                {pendingEvaluations.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Pending Review</p>
                                </div>
                                <span className="text-[10px] font-black text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full">{pendingEvaluations.length}</span>
                            </div>
                            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                                {pendingEvaluations.map((item) => (
                                    <button key={item.id} onClick={() => setActiveEvaluation(item)} className={cn("w-full text-left p-4 rounded-xl border transition-all", activeEvaluation?.id === item.id ? "bg-[#24FF7C]/[0.08] border-[#24FF7C]/30" : "bg-white/[0.02] border-white/[0.06] hover:border-white/10")}>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-sm font-black text-white">{item.members?.full_name || item.members?.alias || "Member"}</p>
                                            <span className="text-xl font-black text-[#24FF7C]">{Number(item.total_score).toFixed(0)}</span>
                                        </div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">{item.members?.role || "No role"}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-8">
                            {activeEvaluation ? (
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <ScoreRing score={calculateTotal(draftScores, metrics)} size={72} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-lg font-black text-white">{Math.round(calculateTotal(draftScores, metrics))}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{activeEvaluation.members?.full_name || "Member"}</h3>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5">{activeEvaluation.members?.role || "No role"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Weighted total</p>
                                            <p className="text-4xl font-black text-[#24FF7C]" style={{ fontFamily: "Outfit, sans-serif" }}>{calculateTotal(draftScores, metrics).toFixed(1)}</p>
                                        </div>
                                    </div>

                                    {activeEvaluation.summary && <p className="text-sm text-white/40 leading-relaxed border-l-2 border-[#24FF7C]/20 pl-4">{activeEvaluation.summary}</p>}

                                    <div className="py-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                                        <div className="px-4 mb-2 flex items-center justify-between">
                                            <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">Performance Signature</p>
                                            <Zap className="w-3 h-3 text-[#24FF7C] opacity-50" />
                                        </div>
                                        <EvaluationRadar data={draftScores.map(s => ({ name: s.name, score: s.score }))} />
                                    </div>

                                    <div className="space-y-3">
                                        {draftScores.map((score) => (
                                            <div key={score.metric_id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-white">{score.name}</p>
                                                        {score.rationale && <p className="text-xs text-white/30 mt-1 leading-relaxed">{score.rationale}</p>}
                                                    </div>
                                                    <input type="number" min={0} max={100} value={Math.round(Number(score.score || 0))} onChange={(e) => updateDraftScore(score.metric_id, Number(e.target.value))} className="w-20 h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-right text-sm font-black text-white focus:outline-none focus:border-[#24FF7C]/50" />
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score.score || 0}%`, background: score.score >= 75 ? "#24FF7C" : score.score >= 50 ? "#F59E0B" : "#FF8A8A" }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => saveEvaluationDraft("pending")} className="h-12 px-5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                            <Save className="w-4 h-4" /> Save Edits
                                        </button>
                                        <button onClick={() => saveEvaluationDraft("approved")} className="h-12 px-6 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(36,255,124,0.3)] hover:shadow-[0_0_30px_rgba(36,255,124,0.5)] transition-all">
                                            <CheckCircle2 className="w-4 h-4" /> Approve Evaluation
                                        </button>
                                    </div>

                                    {(activeEvaluation.edit_history || []).length > 0 && (
                                        <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                                            <button onClick={() => setShowEditHistory((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-black/20 hover:bg-black/30 transition-colors">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/25 uppercase tracking-widest">
                                                    <History className="w-3.5 h-3.5" /> Edit History ({(activeEvaluation.edit_history || []).length})
                                                </div>
                                                <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", showEditHistory && "rotate-180")} />
                                            </button>
                                            {showEditHistory && (
                                                <div className="divide-y divide-white/[0.04]">
                                                    {[...(activeEvaluation.edit_history || [])].reverse().map((entry: any, i: number) => (
                                                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                                                            <div>
                                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", entry.action === "approved" ? "text-[#24FF7C]" : "text-white/40")}>{entry.action}</span>
                                                                <p className="text-[11px] text-white/20 mt-0.5">{new Date(entry.edited_at).toLocaleString()}</p>
                                                            </div>
                                                            <span className="text-lg font-black text-white/40">{Number(entry.snapshot?.total_score || 0).toFixed(1)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center gap-4">
                                    <Trophy className="w-14 h-14 text-white/[0.06]" />
                                    <p className="text-sm text-white/25">Select a pending evaluation to review and approve AI scores.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* ── Row 4: Metrics Config ── */}
                <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white">Evaluation Metrics</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Define role-scoped scoring criteria</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_140px_140px_80px_auto] gap-3">
                        <input placeholder="Metric name" value={newMetric.name} onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })} className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40 placeholder:text-white/20" />
                        <input placeholder="Description" value={newMetric.description} onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })} className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40 placeholder:text-white/20" />
                        <select value={newMetric.role} onChange={(e) => setNewMetric({ ...newMetric, role: e.target.value, member_id: "" })} className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40">
                            <option value="all">All Roles</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select value={newMetric.member_id} onChange={(e) => setNewMetric({ ...newMetric, member_id: e.target.value, role: "" })} className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40">
                            <option value="all">All Members</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.full_name || m.alias}</option>)}
                        </select>
                        <input type="number" step="0.1" min="0.1" value={newMetric.weight} onChange={(e) => setNewMetric({ ...newMetric, weight: Number(e.target.value) })} className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40" />
                        <button onClick={addMetric} className="h-11 px-5 rounded-xl bg-[#24FF7C] text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(36,255,124,0.25)] hover:shadow-[0_0_25px_rgba(36,255,124,0.4)] transition-all">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>

                        {metrics.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <p className="text-sm text-white/20 text-center">No metrics defined. Add one above or start with our professional standards.</p>
                                <button 
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            const res = await fetch("/api/analysis/run", { 
                                                method: "POST", 
                                                headers: { "Content-Type": "application/json" }, 
                                                body: JSON.stringify({ analysis_type: "provision_metrics" }) 
                                            });
                                            if (!res.ok) throw new Error("Failed to provision.");
                                            toast.success("Default metrics provisioned.");
                                            await loadData();
                                        } catch (e: any) { toast.error(e.message); }
                                        finally { setIsLoading(false); }
                                    }}
                                    className="h-10 px-6 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Provision Professional Defaults
                                </button>
                            </div>
                        ) : (
                            // Existing metrics list logic...
                            <>
                                {globalMetrics.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em] mb-3">Global — all roles</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {globalMetrics.map((m) => (
                                                <div key={m.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3 group hover:border-white/10 transition-all">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-white">{m.name}</p>
                                                        <p className="text-xs text-white/30 mt-0.5 truncate">{m.description || "—"}</p>
                                                    </div>
                                                    <span className="text-[11px] font-black text-[#24FF7C] bg-[#24FF7C]/10 px-2 py-1 rounded-lg border border-[#24FF7C]/20 shrink-0">×{Number(m.weight).toFixed(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.entries(roleGroups).map(([role, rMetrics]) => (
                                    <div key={role}>
                                        <p className="text-[10px] font-black text-[#8B5CF6]/60 uppercase tracking-[0.25em] mb-3 mt-4">Role: {role}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {rMetrics.map((m) => (
                                                <div key={m.id} className="p-4 rounded-xl bg-[#8B5CF6]/[0.04] border border-[#8B5CF6]/10 flex items-center justify-between gap-3 group hover:border-[#8B5CF6]/20 transition-all">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-white">{m.name}</p>
                                                        <p className="text-xs text-white/30 mt-0.5 truncate">{m.description || "—"}</p>
                                                    </div>
                                                    <span className="text-[11px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-lg border border-[#8B5CF6]/20 shrink-0">×{Number(m.weight).toFixed(1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                </motion.div>

                {/* ── Row 5: Approved History ── */}
                <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 flex items-center justify-center">
                                <History className="w-5 h-5 text-[#24FF7C]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">Approved Reports</h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{approvedEvaluations.length} records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input type="text" placeholder="Search member..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="h-9 pl-9 pr-8 rounded-xl bg-black/30 border border-white/10 text-sm text-white w-48 focus:outline-none placeholder:text-white/20" />
                                {historySearch && <button onClick={() => setHistorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
                            </div>
                            <div className="flex items-center bg-black/30 rounded-xl border border-white/10 p-1 gap-0.5">
                                {(["all", "today", "week", "month"] as const).map((f) => (
                                    <button key={f} onClick={() => setHistoryDateFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", historyDateFilter === f ? "bg-white text-black" : "text-white/30 hover:text-white")}>{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {approvedEvaluations.length === 0 ? (
                        <p className="text-sm text-white/20 text-center py-8">No approved evaluations match your filters.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {approvedEvaluations.map((item) => (
                                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">{item.members?.full_name || item.members?.alias || "Member"}</p>
                                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{item.members?.role || "No role"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-[#24FF7C]">{Number(item.total_score).toFixed(0)}</p>
                                            <p className="text-[10px] text-white/20">/100</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${item.total_score}%`, background: item.total_score >= 75 ? "#24FF7C" : item.total_score >= 50 ? "#F59E0B" : "#FF8A8A" }} />
                                    </div>
                                    <p className="text-[10px] text-white/20">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
