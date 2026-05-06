"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    History,
    Loader2,
    Play,
    Plus,
    Save,
    Search,
    SlidersHorizontal,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Trophy,
    UserCircle,
    Users,
    X,
    Zap,
    CheckCheck,
    Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Line,
    LineChart,
    Area,
    AreaChart,
    CartesianGrid,
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

function normalizeIdentity(value: string | null | undefined) {
    return (value || "").trim().toLowerCase();
}

function memberCanonicalKey(member: any) {
    const alias = normalizeIdentity(member?.alias);
    const fullName = normalizeIdentity(member?.full_name);
    const role = normalizeIdentity(member?.role);
    if (alias) return `alias:${alias}|role:${role}`;
    if (fullName) return `name:${fullName}|role:${role}`;
    return `id:${member?.id || "unknown"}`;
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
    const [showEditHistory, setShowEditHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState("");
    const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "week" | "month">("all");

    const dedupedMembers = useMemo(() => {
        const byKey = new Map<string, any>();
        for (const member of members) {
            const key = memberCanonicalKey(member);
            const existing = byKey.get(key);
            if (!existing) {
                byKey.set(key, member);
                continue;
            }
            const existingHasAvatar = Boolean(existing.avatar_url);
            const currentHasAvatar = Boolean(member.avatar_url);
            const existingHasAlias = Boolean(existing.alias);
            const currentHasAlias = Boolean(member.alias);
            if ((!existingHasAvatar && currentHasAvatar) || (!existingHasAlias && currentHasAlias)) {
                byKey.set(key, member);
            }
        }
        return Array.from(byKey.values());
    }, [members]);

    const roles = useMemo(() => Array.from(new Set(dedupedMembers.map((m) => m.role).filter(Boolean))), [dedupedMembers]);

    const pendingEvaluations = useMemo(() => evaluations.filter((e) => e.status === "pending"), [evaluations]);
    const dedupedPendingEvaluations = useMemo(() => {
        const byMember = new Map<string, any>();
        for (const item of pendingEvaluations) {
            const memberKey = memberCanonicalKey(item.members || { id: item.member_id });
            const existing = byMember.get(memberKey);
            if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
                byMember.set(memberKey, item);
            }
        }
        return Array.from(byMember.values());
    }, [pendingEvaluations]);

    const approvedEvaluations = useMemo(() => {
        const approved = evaluations.filter((e) => e.status === "approved");
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return approved.filter((e) => {
            const matchSearch = !historySearch ||
                (e.members?.full_name || "").toLowerCase().includes(historySearch.toLowerCase()) ||
                (e.members?.alias || "").toLowerCase().includes(historySearch.toLowerCase()) ||
                (e.summary || "").toLowerCase().includes(historySearch.toLowerCase());
            if (!matchSearch) return false;
            if (historyDateFilter === "all") return true;
            
            const d = new Date(e.evaluation_date || e.created_at);
            const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
            
            if (historyDateFilter === "today") return d.toDateString() === now.toDateString();
            if (historyDateFilter === "week") return diffDays <= 7;
            if (historyDateFilter === "month") return diffDays <= 30;
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
            const key = memberCanonicalKey(e.members || { id: e.member_id });
            if (key && (!map[key] || new Date(e.evaluation_date || e.created_at) > new Date(map[key].evaluation_date || map[key].created_at))) {
                map[key] = e;
            }
        }
        return map;
    }, [approvedEvaluations]);

    // Enhanced Line Chart Data: Groups all approved evaluations by date
    const lineChartData = useMemo(() => {
        const approved = evaluations.filter((e) => e.status === "approved");
        const dates = Array.from(new Set(approved.map(e => e.evaluation_date || new Date(e.created_at).toISOString().split('T')[0]))).sort();
        
        return dates.map(date => {
            const entry: any = { date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
            dedupedMembers.forEach(m => {
                const key = memberCanonicalKey(m);
                const evalsOnDate = approved.filter(e => 
                    (e.evaluation_date || new Date(e.created_at).toISOString().split('T')[0]) === date && 
                    memberCanonicalKey(e.members || { id: e.member_id }) === key
                );
                if (evalsOnDate.length > 0) {
                    entry[key] = Number(evalsOnDate[0].total_score);
                    entry[`${key}_name`] = m.full_name || m.alias;
                }
            });
            return entry;
        });
    }, [evaluations, dedupedMembers]);

    const memberColors = useMemo(() => {
        const colors = ["#24FF7C", "#8B5CF6", "#F59E0B", "#3B82F6", "#EC4899", "#10B981", "#6366F1"];
        const map: Record<string, string> = {};
        dedupedMembers.forEach((m, i) => {
            map[memberCanonicalKey(m)] = colors[i % colors.length];
        });
        return map;
    }, [dedupedMembers]);

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

    const approveAllPending = async () => {
        if (pendingEvaluations.length === 0) return;
        
        const confirm = window.confirm(`Are you sure you want to approve all ${pendingEvaluations.length} pending evaluations?`);
        if (!confirm) return;

        try {
            const now = new Date().toISOString();
            const pendingIds = pendingEvaluations.map(e => e.id);
            
            const { error } = await supabase
                .from("member_evaluations")
                .update({ 
                    status: 'approved', 
                    approved_at: now, 
                    approved_by: userId,
                    updated_at: now
                })
                .in('id', pendingIds);

            if (error) throw error;
            
            toast.success(`Successfully approved ${pendingIds.length} evaluations`);
            await loadData();
        } catch (error) {
            console.error("Error approving all:", error);
            toast.error("Failed to approve all evaluations");
        }
    };

    const deleteEvaluation = async (id: string) => {
        try {
            const { error } = await supabase.from("member_evaluations").delete().eq("id", id);
            if (error) throw error;
            toast.success("Evaluation deleted.");
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // Group approved evaluations by member for the reports section
    const memberGroupedReports = useMemo(() => {
        const groups: Record<string, any[]> = {};
        approvedEvaluations.forEach(e => {
            const key = memberCanonicalKey(e.members || { id: e.member_id });
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });
        return Object.entries(groups).map(([key, reports]) => {
            const sorted = reports.sort((a, b) => new Date(b.evaluation_date || b.created_at).getTime() - new Date(a.evaluation_date || a.created_at).getTime());
            const current = Number(sorted[0].total_score);
            const previous = sorted.length > 1 ? Number(sorted[1].total_score) : current;
            const trend = current > previous ? "up" : current < previous ? "down" : "stable";
            
            return {
                key,
                member: sorted[0].members || { id: sorted[0].member_id },
                reports: sorted,
                avgScore: Math.round(reports.reduce((s, r) => s + Number(r.total_score), 0) / reports.length),
                trend,
                trendValue: Math.abs(current - previous)
            };
        }).sort((a, b) => b.avgScore - a.avgScore);
    }, [approvedEvaluations]);

    const [expandedMemberKey, setExpandedMemberKey] = useState<string | null>(null);

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
                                <p className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{dedupedMembers.length}</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pending</p>
                                <p className="text-3xl font-black text-[#F59E0B]" style={{ fontFamily: "Outfit, sans-serif" }}>{dedupedPendingEvaluations.length}</p>
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
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight italic" style={{ fontFamily: "Outfit, sans-serif" }}>
                                    Team Performance.
                                </h3>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 font-black">Daily Intelligence Velocity</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {dedupedMembers.slice(0, 3).map(m => (
                                    <div key={m.id} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: memberColors[memberCanonicalKey(m)] }} />
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-wider italic">{m.full_name || m.alias}</span>
                                    </div>
                                ))}
                                {dedupedMembers.length > 3 && <span className="text-[9px] font-black text-white/20 uppercase">+{dedupedMembers.length - 3} More</span>}
                            </div>
                        </div>
                        {lineChartData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-white/20 text-sm italic uppercase tracking-widest">Awaiting synchronization...</div>
                        ) : (
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", fontFamily: "Outfit, sans-serif" }} 
                                            dy={10} 
                                        />
                                        <YAxis 
                                            hide 
                                            domain={[0, 100]} 
                                        />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="glass-panel p-4 rounded-2xl border-white/10 shadow-2xl min-w-[180px]">
                                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">{label}</p>
                                                            <div className="space-y-2.5">
                                                                {payload.map((entry: any, index: number) => (
                                                                    <div key={index} className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                            <span className="text-[11px] font-black text-white italic truncate max-w-[100px]">{entry.payload[`${entry.dataKey}_name`]}</span>
                                                                        </div>
                                                                        <span className="text-[13px] font-black text-white" style={{ fontFamily: "Outfit, sans-serif", color: entry.color }}>{entry.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {dedupedMembers.map((m) => {
                                            const key = memberCanonicalKey(m);
                                            return (
                                                <Line 
                                                    key={key}
                                                    type="monotone"
                                                    dataKey={key}
                                                    stroke={memberColors[key]}
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: memberColors[key], strokeWidth: 2, stroke: "#0F0F12" }}
                                                    activeDot={{ r: 6, strokeWidth: 0, shadow: "0 0 15px rgba(36,255,124,0.5)" }}
                                                    connectNulls
                                                    animationDuration={1500}
                                                />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </motion.div>

                    {/* Member roster */}
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-6 space-y-4 overflow-y-auto max-h-[580px] custom-scrollbar">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#24FF7C]" />
                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Workspace Members</p>
                            </div>
                            <span className="text-[10px] font-black text-white/20">{dedupedMembers.length}</span>
                        </div>
                        {dedupedMembers.length === 0 ? (
                            <p className="text-sm text-white/20 py-4">No members in workspace.</p>
                        ) : (
                            <div className="space-y-4">
                                {dedupedMembers.map((member) => {
                                    const latest = memberScoreMap[memberCanonicalKey(member)];
                                    const score = latest ? Number(latest.total_score) : null;
                                    const color = score === null ? "text-white/20" : score >= 75 ? "text-[#24FF7C]" : score >= 50 ? "text-[#F59E0B]" : "text-[#FF8A8A]";
                                    return (
                                        <div key={member.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-5 h-5 text-white/20" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white truncate">{member.full_name || member.alias}</p>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest truncate">{member.role || "No role"}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={cn("text-xl font-black leading-none", color)} style={{ fontFamily: "Outfit, sans-serif" }}>{score !== null ? score.toFixed(0) : "—"}</span>
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Score</span>
                                                </div>
                                            </div>
                                            {latest?.metric_scores && latest.metric_scores.length >= 3 && (
                                                <div className="pt-2 border-t border-white/[0.04] -mx-2 -mb-2">
                                                    <EvaluationRadar data={latest.metric_scores.map((s: any) => ({ name: s.name, score: s.score }))} heightClass="h-32" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ── Pending Review List ── */}
                {dedupedPendingEvaluations.length > 0 && (
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">Pending Reviews</h3>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{dedupedPendingEvaluations.length} items require your attention</p>
                                </div>
                            </div>

                            <button 
                                onClick={approveAllPending}
                                className="h-9 px-4 rounded-xl bg-[#24FF7C]/10 border border-[#24FF7C]/20 text-[#24FF7C] text-[10px] font-black uppercase tracking-widest hover:bg-[#24FF7C] hover:text-black hover:border-transparent transition-all duration-300 flex items-center gap-2 group/all"
                            >
                                <CheckCheck className="w-3.5 h-3.5 group-hover/all:scale-110 transition-transform" />
                                Approve All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {dedupedPendingEvaluations.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setActiveEvaluation(item)} 
                                    className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-[#24FF7C]/[0.04] hover:border-[#24FF7C]/20 transition-all text-left overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteEvaluation(item.id);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <Zap className="w-4 h-4 text-[#24FF7C]" />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {item.members?.avatar_url ? (
                                                <img src={item.members.avatar_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <UserCircle className="w-6 h-6 text-white/20" />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-[#24FF7C]" style={{ fontFamily: "Outfit, sans-serif" }}>{Number(item.total_score).toFixed(0)}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Score</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-white truncate">{item.members?.full_name || item.members?.alias}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest truncate mt-1">{item.members?.role || "No role"}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Slide-over Right Sidebar for Review ── */}
                <AnimatePresence>
                    {activeEvaluation && (
                        <>
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveEvaluation(null)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            />
                            
                            {/* Panel */}
                            <motion.div 
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-4 right-4 bottom-4 w-full max-w-[500px] bg-[#0F0F12] border border-white/10 rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] z-[70] overflow-hidden flex flex-col"
                            >
                                <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <ScoreRing score={calculateTotal(draftScores, metrics)} size={64} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-base font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{Math.round(calculateTotal(draftScores, metrics))}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeEvaluation.members?.full_name || "Member Review"}</h3>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{activeEvaluation.members?.role || "No role defined"}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveEvaluation(null)} className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-[#24FF7C]" />
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">AI Evaluation Summary</p>
                                        </div>
                                        {activeEvaluation.summary && (
                                            <p className="text-sm text-white/70 leading-relaxed bg-white/[0.03] p-5 rounded-2xl border border-white/5 italic">
                                                "{activeEvaluation.summary}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">Performance Signature</p>
                                            <Zap className="w-3.5 h-3.5 text-[#24FF7C] opacity-50" />
                                        </div>
                                        <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] shadow-inner">
                                            <EvaluationRadar data={draftScores.map(s => ({ name: s.name, score: s.score }))} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-white/25 uppercase tracking-widest px-2">Metric Breakdown</p>
                                        <div className="space-y-3">
                                            {draftScores.map((score) => (
                                                <div key={score.metric_id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                                                    <div className="flex items-center justify-between gap-4 mb-3">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-black text-white">{score.name}</p>
                                                            {score.rationale && <p className="text-[11px] text-white/30 mt-1 leading-relaxed">{score.rationale}</p>}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <input 
                                                                type="number" 
                                                                min={0} 
                                                                max={100} 
                                                                value={Math.round(Number(score.score || 0))} 
                                                                onChange={(e) => updateDraftScore(score.metric_id, Number(e.target.value))} 
                                                                className="w-16 h-9 rounded-lg bg-black/40 border border-white/10 px-2 text-center text-sm font-black text-[#24FF7C] focus:outline-none focus:border-[#24FF7C]/50" 
                                                                style={{ fontFamily: "Outfit, sans-serif" }}
                                                            />
                                                            <span className="text-[8px] font-black text-white/20 uppercase">Score</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${score.score || 0}%`, background: score.score >= 75 ? "#24FF7C" : score.score >= 50 ? "#F59E0B" : "#FF8A8A" }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {(activeEvaluation.edit_history || []).length > 0 && (
                                        <div className="space-y-4">
                                            <button onClick={() => setShowEditHistory((v) => !v)} className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/25 uppercase tracking-widest">
                                                    <History className="w-4 h-4" /> Audit Trail ({(activeEvaluation.edit_history || []).length})
                                                </div>
                                                <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", showEditHistory && "rotate-180")} />
                                            </button>
                                            {showEditHistory && (
                                                <div className="space-y-2 px-1">
                                                    {[...(activeEvaluation.edit_history || [])].reverse().map((entry: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                                                            <div>
                                                                <span className={cn("text-[9px] font-black uppercase tracking-widest", entry.action === "approved" ? "text-[#24FF7C]" : "text-white/40")}>{entry.action}</span>
                                                                <p className="text-[10px] text-white/20 mt-0.5">{new Date(entry.edited_at).toLocaleTimeString()}</p>
                                                            </div>
                                                            <span className="text-base font-black text-white/40" style={{ fontFamily: "Outfit, sans-serif" }}>{Number(entry.snapshot?.total_score || 0).toFixed(0)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 pt-4 border-t border-white/5 bg-[#0F0F12]/80 backdrop-blur-xl grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => {
                                            deleteEvaluation(activeEvaluation.id);
                                            setActiveEvaluation(null);
                                        }} 
                                        className="h-14 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    <button onClick={() => saveEvaluationDraft("approved")} className="h-14 rounded-2xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(36,255,124,0.3)] hover:scale-[1.02] transition-all">
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

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
                            {dedupedMembers.map(m => <option key={m.id} value={m.id}>{m.full_name || m.alias}</option>)}
                        </select>
                        <div className="space-y-1.5">
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0.1" 
                                placeholder="Weight"
                                value={newMetric.weight} 
                                onChange={(e) => setNewMetric({ ...newMetric, weight: Number(e.target.value) })} 
                                className="h-11 w-full rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/40 placeholder:text-white/20" 
                            />
                        </div>
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
                        <>
                            {globalMetrics.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Global Standards — All Roles</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {globalMetrics.map((m) => (
                                            <div key={m.id} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 hover:bg-white/[0.04] hover:border-white/20 transition-all shadow-sm">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-white group-hover:text-[#24FF7C] transition-colors">{m.name}</p>
                                                    <p className="text-[11px] text-white/30 mt-1 leading-relaxed line-clamp-1">{m.description || "No description provided."}</p>
                                                </div>
                                                <div className="flex flex-col items-center shrink-0">
                                                    <span className="text-[13px] font-black text-[#24FF7C]" style={{ fontFamily: "Outfit, sans-serif" }}>×{Number(m.weight).toFixed(1)}</span>
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Weight</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.entries(roleGroups).map(([role, rMetrics]) => (
                                <div key={role} className="space-y-4 mt-8">
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/40" />
                                        <p className="text-[10px] font-black text-[#8B5CF6]/60 uppercase tracking-[0.3em]">Role Specfic — {role}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {rMetrics.map((m) => (
                                            <div key={m.id} className="group p-5 rounded-2xl bg-[#8B5CF6]/[0.03] border border-[#8B5CF6]/10 flex items-center justify-between gap-4 hover:bg-[#8B5CF6]/[0.06] hover:border-[#8B5CF6]/30 transition-all">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-white group-hover:text-[#8B5CF6] transition-colors">{m.name}</p>
                                                    <p className="text-[11px] text-white/30 mt-1 leading-relaxed line-clamp-1">{m.description || "—"}</p>
                                                </div>
                                                <div className="flex flex-col items-center shrink-0">
                                                    <span className="text-[13px] font-black text-[#8B5CF6]" style={{ fontFamily: "Outfit, sans-serif" }}>×{Number(m.weight).toFixed(1)}</span>
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Weight</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </motion.div>

                {/* ── Row 5: Premium Member-Centric Approved History ── */}
                <motion.div variants={staggerItem} className="glass-panel rounded-[3rem] p-10 space-y-10 border-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#24FF7C]/[0.02] rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#24FF7C]/20 to-transparent border border-[#24FF7C]/30 flex items-center justify-center shadow-[0_0_40px_rgba(36,255,124,0.15)] group">
                                <History className="w-7 h-7 text-[#24FF7C] group-hover:rotate-[-10deg] transition-transform" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C] animate-pulse" />
                                    <h3 className="text-base font-black text-white">Evaluation History</h3>
                                </div>
                                <p className="text-[11px] text-white/30 uppercase tracking-[0.4em] font-black leading-none">Aggregated performance telemetry for {memberGroupedReports.length} actives</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#24FF7C] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search history..." 
                                    value={historySearch} 
                                    onChange={(e) => setHistorySearch(e.target.value)} 
                                    className="h-12 pl-12 pr-10 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-white w-64 focus:outline-none focus:border-[#24FF7C]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 italic font-medium" 
                                />
                                {historySearch && <button onClick={() => setHistorySearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"><X className="w-4 h-4" /></button>}
                            </div>
                            <div className="flex items-center bg-white/[0.02] rounded-2xl border border-white/5 p-1.5 gap-1 shadow-inner backdrop-blur-md">
                                {(["all", "today", "week", "month"] as const).map((f) => (
                                    <button 
                                        key={f} 
                                        onClick={() => setHistoryDateFilter(f)} 
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300", 
                                            historyDateFilter === f ? "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)] scale-[1.02]" : "text-white/20 hover:text-white/50 hover:bg-white/[0.02]"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        {memberGroupedReports.length > 0 ? (
                            memberGroupedReports.map(({ key, member, reports, avgScore }) => (
                                <div key={key} className="glass-panel rounded-[1.5rem] border-white/5 overflow-hidden transition-all duration-500">
                                    <div 
                                        onClick={() => setExpandedMemberKey(expandedMemberKey === key ? null : key)}
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-[1px]">
                                                    <div className="w-full h-full rounded-2xl bg-[#090909] flex items-center justify-center overflow-hidden">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle className="w-5 h-5 text-white/20" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white italic tracking-tight">{member.full_name || member.alias}</h4>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">{member.role || 'Contributor'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <div className="flex items-baseline gap-1.5 justify-end">
                                                    <span className={cn("text-2xl font-black tracking-tighter", avgScore >= 75 ? "text-[#24FF7C]" : avgScore >= 50 ? "text-[#F59E0B]" : "text-[#FF8A8A]")}>{avgScore}</span>
                                                    <span className="text-[10px] font-black text-white/10 uppercase">/100</span>
                                                </div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Average Score</p>
                                            </div>
                                            
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500",
                                                expandedMemberKey === key ? "bg-[#24FF7C] border-transparent text-black" : "bg-white/[0.03] border-white/10 text-white/40"
                                            )}>
                                                <ChevronRight className={cn("w-6 h-6 transition-all duration-500", expandedMemberKey === key ? "text-[#24FF7C] scale-110" : "text-white/20")} />
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedMemberKey === key && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-8 pb-10">
                                                    <div className="bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-inner">
                                                        <div className="grid grid-cols-5 px-8 py-5 border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                                                            <div className="col-span-2">Evaluation Reference / Date</div>
                                                            <div className="text-center">Daily Score</div>

                                                            <div className="text-center">Verification</div>
                                                            <div className="text-right">Intelligence</div>
                                                        </div>
                                                        
                                                        <div className="divide-y divide-white/[0.03]">
                                                            {reports.map((report) => {
                                                                
                                                                return (
                                                                    <div key={report.id} className="group/item grid grid-cols-5 items-center px-8 py-6 hover:bg-white/[0.03] transition-all duration-500 relative">
                                                                        <div className="col-span-2 flex items-center gap-5">
                                                                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-[#24FF7C]/40 transition-colors">
                                                                                <Sparkles className="w-4 h-4 text-[#24FF7C]/30 group-hover/item:text-[#24FF7C] transition-colors" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-black text-white italic group-hover/item:translate-x-1 transition-transform duration-500">
                                                                                    {new Date(report.evaluation_date || report.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                                </p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C]/40" />
                                                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">ID: {report.id.slice(0, 8)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-col items-center">
                                                                            <div className="relative">
                                                                                <span className={cn("text-2xl font-black", Number(report.total_score) >= 75 ? "text-[#24FF7C]" : Number(report.total_score) >= 50 ? "text-[#F59E0B]" : "text-[#FF8A8A]")} style={{ fontFamily: "Inter, sans-serif" }}>
                                                                                    {Number(report.total_score).toFixed(0)}
                                                                                </span>
                                                                                <span className="absolute -top-1 -right-4 text-[8px] font-black text-white/10 uppercase">Pts</span>
                                                                            </div>
                                                                        </div>
                                                                        

                                                                        
                                                                        <div className="flex flex-col items-center">
                                                                            <p className="text-[10px] font-black text-white italic">{report.approved_at ? new Date(report.approved_at).toLocaleDateString() : "—"}</p>
                                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter mt-1">{report.approved_at ? new Date(report.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "AUTO_SYNC"}</p>
                                                                        </div>
                                                                        
                                                                        <div className="flex justify-end gap-2">
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    deleteEvaluation(report.id);
                                                                                }}
                                                                                className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setActiveEvaluation(report)}
                                                                                className="group/btn h-10 px-6 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-[#24FF7C] hover:text-black hover:border-transparent text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 overflow-hidden"
                                                                            >
                                                                                <Zap className="w-3.5 h-3.5 group-hover/btn:scale-125 transition-transform" />
                                                                                <span className="relative z-10">Inspect</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="glass-panel rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center border-dashed border-white/10">
                                <History className="w-12 h-12 text-white/5 mb-6" />
                                <h4 className="text-xl font-black text-white italic mb-2">No History Yet</h4>
                                <p className="text-sm text-white/30 max-w-xs">Once evaluations are approved, they will appear here grouped by member.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </PageTransition>
    );
}
