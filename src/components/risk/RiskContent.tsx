"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AlertCircle, 
    ShieldAlert, 
    Shield, 
    ShieldCheck, 
    Zap, 
    CheckCircle2, 
    History, 
    LayoutGrid, 
    SlidersHorizontal,
    Search,
    Filter,
    Activity,
    ChevronRight,
    Loader2,
    Radar,
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    AlertTriangle,
    Eye,
    Archive,
    Edit3,
    CheckCircle,
    ArrowLeft,
    Sparkles,
    ChevronDown,
    Play,
    Clock,
    FileEdit,
    X,
    Github,
    Bug,
    Cpu,
    Terminal,
    FileCode,
    Save
} from "lucide-react";
import { 
    ResponsiveContainer, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar as RadarGraphic, 
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { supabase } from "@/lib/supabase";
import React from "react";

const DEFAULT_SETTING = {
    timezone: "Asia/Karachi",
    risk_run_time: "18:00",
    evaluation_run_time: "18:30",
    lookback_hours: 24,
    risk_enabled: true,
    evaluation_enabled: true,
};

const SEVERITY_OPTIONS = [
    { value: "all", label: "All Severity", icon: SlidersHorizontal },
    { value: "critical", label: "Critical", icon: AlertCircle },
    { value: "high", label: "High", icon: ShieldAlert },
    { value: "medium", label: "Medium", icon: Shield },
    { value: "low", label: "Low", icon: ShieldCheck },
];

const CATEGORY_OPTIONS = [
    { value: "project", label: "Project", icon: LayoutGrid },
    { value: "delivery", label: "Delivery", icon: Zap },
    { value: "quality", label: "Quality", icon: CheckCircle2 },
    { value: "security", label: "Security", icon: Shield },
    { value: "process", label: "Process", icon: History },
];

const SEVERITY_COLORS = {
    critical: "text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.15)]",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    low: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(96,165,250,0.15)]",
};

const SEV_CHART_COLORS = {
    critical: "#F87171",
    high: "#FB923C",
    medium: "#F59E0B",
    low: "#60A5FA"
};

function RiskRadar({ data }: { data: any[] }) {
    if (!data || data.length < 3) return null;
    return (
        <div className="h-56 w-full my-2 min-h-[224px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 'bold', fontFamily: 'Outfit, sans-serif' }} 
                    />
                    <RadarGraphic
                        name="Risk"
                        dataKey="value"
                        stroke="#FF8A8A"
                        fill="#FF8A8A"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RiskContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
    const [activeRisk, setActiveRisk] = useState<any | null>(null);
    const [historySearch, setHistorySearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [githubLinked, setGithubLinked] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const [settings, setSettings] = useState<any>(DEFAULT_SETTING);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const [rRes, sRes, iRes] = await Promise.all([
                supabase.from("risk_assessments").select("*").order("created_at", { ascending: false }),
                supabase.from("analysis_settings").select("*").eq("user_id", user.id).maybeSingle(),
                supabase.from("integrations").select("*").eq("provider", "github")
            ]);

            if (rRes.error) throw rRes.error;
            setRiskAssessments(rRes.data || []);
            setGithubLinked(!!iRes.data?.length);

            if (sRes.data) {
                setSettings(sRes.data);
            } else if (sRes.error && sRes.error.code !== "PGRST116") {
                // Ignore if not found, use default
            } else if (!sRes.data) {
                // Initialize settings if missing
                const { data } = await supabase.from("analysis_settings").insert({ user_id: user.id, ...DEFAULT_SETTING }).select("*").single();
                if (data) setSettings(data);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from("analysis_settings")
                .upsert({ ...settings, user_id: userId }, { onConflict: "user_id" })
                .select("*")
                .single();
            
            if (error) throw error;
            setSettings(data);
            toast.success("Strategic automation schedule updated.");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const runRiskAssessment = async () => {
        setIsRunning(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/analysis/run", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ analysis_type: "risk" })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to trigger risk assessment.");
            }
            toast.success("Intelligence engine engaged. Processing neural stream...");
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsRunning(false);
        }
    };

    const approveRisk = async (id: string) => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const now = new Date().toISOString();
            const historyEntry = { 
                edited_at: now, 
                edited_by: user?.id, 
                action: "approved", 
                snapshot: { title: activeRisk.title, severity: activeRisk.severity } 
            };

            const { error } = await supabase
                .from("risk_assessments")
                .update({ 
                    status: "approved", 
                    approved_at: now,
                    title: activeRisk.title,
                    description: activeRisk.description,
                    severity: activeRisk.severity,
                    recommendations: activeRisk.recommendations,
                    edit_history: [...(activeRisk.edit_history || []), historyEntry]
                })
                .eq("id", id);

            if (error) throw error;
            toast.success("Risk assessment approved and archived.");
            setActiveRisk(null);
            setIsEditing(false);
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateActiveRisk = (field: string, value: any) => {
        setActiveRisk((prev: any) => ({ ...prev, [field]: value }));
    };

    const pendingRisks = useMemo(() => riskAssessments.filter(r => r.status === "pending"), [riskAssessments]);
    const archivedRisks = useMemo(() => {
        return riskAssessments.filter(r => {
            const isArchived = r.status === "approved";
            const matchesSeverity = severityFilter === "all" || r.severity === severityFilter;
            const matchesSearch = !historySearch || 
                r.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                r.description.toLowerCase().includes(historySearch.toLowerCase());
            return isArchived && matchesSeverity && matchesSearch;
        });
    }, [riskAssessments, severityFilter, historySearch]);

    const stats = useMemo(() => {
        const criticalCount = riskAssessments.filter(r => r.severity === "critical" && r.status === "pending").length;
        const avgConfidence = riskAssessments.length ? riskAssessments.reduce((acc, r) => acc + (r.confidence || 0), 0) / riskAssessments.length : 0;
        return {
            critical: criticalCount,
            totalPending: pendingRisks.length,
            confidence: Math.round(avgConfidence * 100)
        };
    }, [riskAssessments, pendingRisks]);

    const sevCounts = useMemo(() => {
        return ["critical", "high", "medium", "low"].map((s) => ({
            name: s,
            value: riskAssessments.filter((r) => r.severity === s).length,
            color: SEV_CHART_COLORS[s as keyof typeof SEV_CHART_COLORS],
        })).filter((s) => s.value > 0);
    }, [riskAssessments]);

    const radarData = [
        { subject: 'Security', value: 85 },
        { subject: 'Stability', value: 65 },
        { subject: 'Performance', value: 45 },
        { subject: 'Technical Debt', value: 90 },
        { subject: 'Team Sync', value: 30 },
    ];

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#FF8A8A] animate-spin stroke-[1.5px] opacity-20" />
                    <Loader2 className="w-16 h-16 text-[#FF8A8A] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Engaging Neural Shield.</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF8A8A]">One moment.</p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Risk Assessment">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-10 pb-12">
                
                {/* ── Row 1: Hero + Stats ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hero Card */}
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8A8A]/[0.03] rounded-full blur-[100px] pointer-events-none group-hover:bg-[#FF8A8A]/[0.06] transition-colors duration-1000" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#FF8A8A]/10 border border-[#FF8A8A]/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <ShieldAlert className="w-6 h-6 text-[#FF8A8A]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] italic">Intelligence Risk Analysis</p>
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic" style={{ fontFamily: "Outfit, sans-serif" }}>Shield Status: Active</h2>
                                </div>
                            </div>
                            <div className="flex items-end gap-6 mb-4">
                                <span className="text-[6rem] lg:text-[7.5rem] font-black text-white italic leading-none tracking-tighter" style={{ fontFamily: "Outfit, sans-serif" }}>
                                    {stats.critical}
                                </span>
                                <div className="flex flex-col mb-4">
                                    <span className="text-2xl font-black text-[#FF8A8A] uppercase tracking-widest leading-none italic">High Priority</span>
                                    <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 italic">Findings Detected</span>
                                </div>
                            </div>
                            <p className="text-white/30 text-sm max-w-lg italic font-medium leading-relaxed">
                                {stats.critical > 0 
                                    ? `Neural Shield has identified ${stats.critical} high-priority findings. Strategic mitigation is required to maintain core codebase stability and security standards.`
                                    : "Project stability is within nominal parameters. No high-priority findings detected in the current analysis cycle."}
                            </p>
                        </div>
                        <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.05] flex flex-wrap gap-10">
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Confidence</p>
                                <p className="text-3xl font-black text-white italic" style={{ fontFamily: "Outfit, sans-serif" }}>{stats.confidence}%</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Vectors</p>
                                <p className="text-3xl font-black text-white italic" style={{ fontFamily: "Outfit, sans-serif" }}>{riskAssessments.length}</p>
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Pending</p>
                                <p className="text-3xl font-black text-[#F59E0B] italic" style={{ fontFamily: "Outfit, sans-serif" }}>{stats.totalPending}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Severity Breakdown (Merged from Triage) */}
                    <motion.div variants={staggerItem} className="flex flex-col gap-4">
                        <div className="glass-panel rounded-[2rem] p-7 flex-1 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic leading-none mb-1">Threat Distribution</p>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Breakdown</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 relative z-10 mt-4 h-24 min-h-[96px]">
                                <div className="w-24 h-24 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={sevCounts} 
                                                cx="50%" cy="50%" 
                                                innerRadius={28} outerRadius={45} 
                                                paddingAngle={4} dataKey="value" 
                                                strokeWidth={0}
                                            >
                                                {sevCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: "#0C0D10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", fontSize: "10px", color: "#fff", fontFamily: 'Outfit, sans-serif' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2.5 flex-1">
                                    {sevCounts.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: s.color }} />
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover/item:text-white/60 transition-colors italic">{s.name}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-white italic">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={runRiskAssessment} disabled={isRunning} className="glass-panel rounded-[2rem] p-6 flex items-center gap-5 group hover:border-[#FF8A8A]/40 transition-all active:scale-95 disabled:opacity-50 border border-transparent bg-white/[0.01]">
                            <div className="w-14 h-14 rounded-2xl bg-[#FF8A8A] flex items-center justify-center shadow-[0_10px_30px_rgba(255,138,138,0.4)] group-hover:scale-110 transition-transform shrink-0">
                                {isRunning ? <Loader2 className="w-6 h-6 text-black animate-spin" /> : <Play className="w-6 h-6 text-black stroke-[3.5px]" />}
                            </div>
                            <div className="text-left">
                                <p className="text-[15px] font-black text-white group-hover:text-[#FF8A8A] transition-colors italic uppercase tracking-tight">Initiate Analysis</p>
                                <p className="text-[10px] text-white/30 mt-0.5 italic font-medium uppercase tracking-widest">Execute Neural Scan</p>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* ── Row 2: Stability Radar + Automation ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white tracking-tight italic uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                                Stability Radar.
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF8A8A]" /><span className="text-[10px] font-black text-white/30 uppercase tracking-wider italic">High Risk</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#24FF7C]/40" /><span className="text-[10px] font-black text-white/30 uppercase tracking-wider italic">Nominal</span></div>
                            </div>
                        </div>
                        <div className="h-64 min-h-[256px]">
                            <RiskRadar data={radarData} />
                        </div>
                    </motion.div>

                    {/* Strategic Automation (Merged from Triage) */}
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-8 space-y-8 flex flex-col justify-between relative overflow-hidden group bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[#FF8A8A]/20 transition-all">
                                    <Clock className="w-6 h-6 text-[#FF8A8A]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic leading-none mb-1">Strategic Automation</p>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Scheduling</h3>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic px-1">Daily Analysis Window</p>
                                    <div className="relative">
                                        <input 
                                            type="time" 
                                            value={(settings.risk_run_time || "18:00").slice(0, 5)} 
                                            onChange={(e) => setSettings({ ...settings, risk_run_time: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-black/40 border border-white/5 px-6 text-sm text-white focus:outline-none focus:border-[#FF8A8A]/40 transition-all font-bold italic"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic px-1">Temporal Alignment (Timezone)</p>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={settings.timezone || "Asia/Karachi"} 
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-black/40 border border-white/5 px-6 text-sm text-white focus:outline-none focus:border-[#FF8A8A]/40 transition-all font-bold italic"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={updateSettings} disabled={isSaving} className="h-16 rounded-[1.8rem] bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-[#FF8A8A]/30 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 italic">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-white/40" />} Update Schedule
                        </button>
                    </motion.div>
                </div>

                {/* ── Row 3: Codebase Intelligence (Conditional) ── */}
                {githubLinked && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[3rem] p-8 space-y-10 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                        <Github className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Codebase Health</h3>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-0.5">Real-time repository telemetry</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#24FF7C]/5 border border-[#24FF7C]/20 shadow-[0_0_15px_rgba(36,255,124,0.05)]">
                                    <ShieldCheck className="w-4 h-4 text-[#24FF7C]" />
                                    <span className="text-[10px] font-black text-[#24FF7C] uppercase tracking-widest leading-none">Sync Success</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Bug Density", value: "0.24", unit: "/kloc", icon: Bug, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
                                    { label: "Technical Debt", value: "14", unit: "hrs", icon: Cpu, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" },
                                    { label: "Error Frequency", value: "1.2", unit: "%", icon: Terminal, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                                ].map((stat, i) => (
                                    <div key={i} className={cn("p-7 rounded-[2.5rem] border hover:brightness-125 transition-all group relative overflow-hidden", stat.bg, stat.border)}>
                                        <stat.icon className={cn("w-6 h-6 mb-5", stat.color)} />
                                        <div className="flex items-end gap-2.5">
                                            <span className="text-4xl font-black text-white italic" style={{ fontFamily: "Outfit, sans-serif" }}>{stat.value}</span>
                                            <span className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-2 italic">{stat.unit}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 italic">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={staggerItem} className="glass-panel rounded-[3rem] p-8 flex flex-col justify-between group bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                                    <FileCode className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Neural Vitals</h3>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { label: "Test Coverage", value: 88, color: "#24FF7C", glow: "shadow-[0_0_10px_rgba(36,255,124,0.3)]" },
                                    { label: "Build Stability", value: 96, color: "#24FF7C", glow: "shadow-[0_0_10px_rgba(36,255,124,0.3)]" },
                                    { label: "Lint Integrity", value: 72, color: "#F59E0B", glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]" },
                                ].map((vital, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">{vital.label}</span>
                                            <span className="text-sm font-black text-white italic" style={{ fontFamily: "Outfit, sans-serif" }}>{vital.value}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/[0.02]">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${vital.value}%` }}
                                                transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: "circOut" }}
                                                className={cn("h-full rounded-full", vital.glow)}
                                                style={{ backgroundColor: vital.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* ── Row 3: Pending Risk Review ── */}
                {pendingRisks.length > 0 && (
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight italic">Pending Strategic Reviews</h3>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest italic">{pendingRisks.length} indicators require professional review</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                            {pendingRisks.map((risk) => (
                                <button 
                                    key={risk.id} 
                                    onClick={() => setActiveRisk(risk)} 
                                    className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#FF8A8A]/30 transition-all text-left overflow-hidden shadow-xl"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border italic", SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS])}>
                                            {risk.severity}
                                        </div>
                                        <Zap className="w-3.5 h-3.5 text-white/10 group-hover:text-[#FF8A8A] transition-colors" />
                                    </div>
                                    <h4 className="text-[14px] font-black text-white group-hover:text-[#FF8A8A] transition-colors line-clamp-1 italic mb-2">{risk.title}</h4>
                                    <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed font-medium italic mb-4">{risk.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">{risk.category}</span>
                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Row 4: Risk Archive ── */}
                <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden group">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[#24FF7C]/20 transition-all">
                                <History className="w-6 h-6 text-white/20" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Strategic Archive</h3>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1 italic">Neural stream of resolved indicators</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-5">
                            <div className="relative group w-full md:w-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#FF8A8A] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search archive history..." 
                                    value={historySearch} 
                                    onChange={(e) => setHistorySearch(e.target.value)} 
                                    className="h-11 pl-12 pr-6 rounded-xl bg-black/40 border border-white/5 text-xs text-white w-full md:w-64 focus:outline-none focus:border-[#FF8A8A]/40 transition-all placeholder:text-white/10 font-bold" 
                                />
                            </div>
                            <CustomDropdown 
                                options={SEVERITY_OPTIONS}
                                value={severityFilter}
                                onChange={setSeverityFilter}
                                className="md:w-48"
                            />
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        {archivedRisks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                                <History className="w-12 h-12 text-white/5 mb-4" />
                                <p className="text-sm text-white/20 italic font-medium">No archived risk records found in neural stream.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {archivedRisks.map((risk) => (
                                    <div key={risk.id} className="p-7 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-[#24FF7C]/20 transition-all group relative overflow-hidden flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-white/70 group-hover:text-white transition-colors truncate italic leading-none">{risk.title}</h4>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 italic">{new Date(risk.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={cn("px-2 py-1 rounded-lg text-[7px] font-black uppercase italic tracking-widest border shrink-0", SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS])}>
                                                {risk.severity}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2 font-medium italic">{risk.description}</p>
                                        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.03]">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#24FF7C]/40" />
                                            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] italic">Finding Resolved</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Slide-over Right Sidebar for Risk Review ── */}
                <AnimatePresence>
                    {activeRisk && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setActiveRisk(null); setIsEditing(false); }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]" />
                            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }} className="fixed top-4 right-4 bottom-4 w-full max-w-[560px] bg-[#0C0D10]/95 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] z-[70] overflow-hidden flex flex-col">
                                <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8A8A]/30 to-transparent" />
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center border shadow-inner", SEVERITY_COLORS[activeRisk.severity as keyof typeof SEVERITY_COLORS])}>
                                            <AlertCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">Risk Vector Analysis</h3>
                                            <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic", SEVERITY_COLORS[activeRisk.severity as keyof typeof SEVERITY_COLORS].split(" ")[0])}>
                                                {activeRisk.severity} Magnitude Detection
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsEditing(!isEditing)} className={cn("w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-inner border", isEditing ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white hover:bg-white/5")}>
                                            <FileEdit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { setActiveRisk(null); setIsEditing(false); }} className="w-11 h-11 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all shadow-inner">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 pt-8 space-y-10 custom-scrollbar">
                                    <div className="space-y-6">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Vector Title</p>
                                                <input 
                                                    value={activeRisk.title} 
                                                    onChange={(e) => updateActiveRisk("title", e.target.value)} 
                                                    className="w-full h-16 bg-white/[0.02] border border-white/10 rounded-2xl px-6 text-xl font-black italic text-white focus:outline-none focus:border-[#FF8A8A]/50 transition-all shadow-inner" 
                                                    style={{ fontFamily: "Outfit, sans-serif" }}
                                                />
                                            </div>
                                        ) : (
                                            <h4 className="text-3xl font-black text-white leading-tight italic tracking-tighter" style={{ fontFamily: "Outfit, sans-serif" }}>{activeRisk.title}</h4>
                                        )}
                                        
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Technical Narrative</p>
                                                <textarea 
                                                    value={activeRisk.description} 
                                                    onChange={(e) => updateActiveRisk("description", e.target.value)} 
                                                    className="w-full bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-sm text-white/80 leading-relaxed h-44 focus:outline-none focus:border-[#FF8A8A]/50 transition-all shadow-inner resize-none font-medium italic"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.05] to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                                <p className="relative text-[15px] text-white/60 leading-relaxed bg-[#141518]/60 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm italic font-medium">
                                                    {activeRisk.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Category</p>
                                            <CustomDropdown 
                                                options={CATEGORY_OPTIONS}
                                                value={activeRisk.category}
                                                onChange={(val) => updateActiveRisk("category", val)}
                                                className={cn(!isEditing && "pointer-events-none opacity-80")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Magnitude</p>
                                            <CustomDropdown 
                                                options={SEVERITY_OPTIONS.filter(o => o.value !== "all")}
                                                value={activeRisk.severity}
                                                onChange={(val) => updateActiveRisk("severity", val)}
                                                className={cn(!isEditing && "pointer-events-none opacity-80")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.3em] italic">Strategic Mitigation Roadmap</p>
                                            <div className="h-[1px] flex-1 bg-white/5 ml-4" />
                                        </div>
                                        <div className="space-y-4">
                                            {(activeRisk.recommendations || []).map((rec: any, i: number) => (
                                                <motion.div 
                                                    key={i} 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-6 rounded-3xl bg-[#24FF7C]/[0.03] border border-[#24FF7C]/10 flex items-start gap-5 hover:bg-[#24FF7C]/[0.06] hover:border-[#24FF7C]/30 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-[#24FF7C]/10 flex items-center justify-center shrink-0 mt-0.5 shadow-inner group-hover:scale-110 transition-transform">
                                                        <Sparkles className="w-4 h-4 text-[#24FF7C]" />
                                                    </div>
                                                    <p className="text-sm text-white/80 leading-relaxed font-medium italic">{rec.text || rec}</p>
                                                </motion.div>
                                            ))}
                                            {isEditing && (
                                                <button onClick={() => updateActiveRisk("recommendations", [...(activeRisk.recommendations || []), "New recommendation"])} className="w-full h-14 rounded-2xl border border-dashed border-white/10 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-[#24FF7C] hover:border-[#24FF7C]/40 hover:bg-[#24FF7C]/5 transition-all italic">
                                                    + Insert Strategic Directive
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {(activeRisk.edit_history || []).length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-white/5">
                                            <button onClick={() => setShowAuditTrail(!showAuditTrail)} className="w-full flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 group italic">
                                                <div className="flex items-center gap-3"><History className="w-4 h-4 group-hover:text-white transition-colors" /> Audit Trail ({(activeRisk.edit_history || []).length})</div>
                                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", showAuditTrail && "rotate-180 text-white")} />
                                            </button>
                                            <AnimatePresence>
                                                {showAuditTrail && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-3 overflow-hidden"
                                                    >
                                                        {[...(activeRisk.edit_history || [])].reverse().map((entry: any, i: number) => (
                                                            <div key={i} className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between hover:bg-white/[0.03] transition-all">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">{entry.action}</p>
                                                                    <p className="text-[9px] text-white/20 font-bold mt-1">{new Date(entry.edited_at).toLocaleString()}</p>
                                                                </div>
                                                                <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase italic tracking-widest border", SEVERITY_COLORS[entry.snapshot?.severity as keyof typeof SEVERITY_COLORS] || "border-white/10 text-white/40")}>
                                                                    {entry.snapshot?.severity}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 pt-6 border-t border-white/5 bg-[#0C0D10]/90 backdrop-blur-3xl grid grid-cols-2 gap-5 relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#24FF7C]/20 to-transparent opacity-50" />
                                    <button onClick={() => { setActiveRisk(null); setIsEditing(false); }} className="h-16 rounded-[1.8rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 italic">
                                        Dismiss
                                    </button>
                                    <button onClick={() => approveRisk(activeRisk.id)} disabled={isSaving} className="h-16 rounded-[1.8rem] bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_15px_50px_rgba(36,255,124,0.4)] hover:scale-[1.03] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 italic">
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} {isEditing ? "Finalize & Sync" : "Mitigate & Archive"}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </PageTransition>
    );
}
