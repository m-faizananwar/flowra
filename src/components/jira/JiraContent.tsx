"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, 
    Play, 
    Loader2, 
    CheckCircle2, 
    LayoutGrid, 
    Zap, 
    History, 
    Save, 
    ChevronRight, 
    Trello,
    ArrowRight,
    Search,
    X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { supabase } from "@/lib/supabase";
import React from "react";

const DEFAULT_SETTING = {
    timezone: "Asia/Karachi",
    jira_run_time: "18:00",
    lookback_hours: 24,
    jira_enabled: true,
};

export function JiraContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [jiraIssuesMap, setJiraIssuesMap] = useState<Record<string, any>>({});
    const [activeApproval, setActiveApproval] = useState<any | null>(null);
    const [historySearch, setHistorySearch] = useState("");
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

            const [aRes, sRes, iRes] = await Promise.all([
                supabase.from("approval_requests").select("*").eq("user_id", user.id).eq("request_type", "jira_transition").order("created_at", { ascending: false }),
                supabase.from("analysis_settings").select("*").eq("user_id", user.id).maybeSingle(),
                supabase.from("jira_issues").select("issue_key,summary,description,status,priority,assignee_name").eq("user_id", user.id)
            ]);

            if (aRes.error) throw aRes.error;
            setApprovals(aRes.data || []);

            // Build a quick-lookup map of issue_key -> card details
            const issueMap: Record<string, any> = {};
            for (const issue of iRes.data || []) {
                issueMap[issue.issue_key] = issue;
            }
            setJiraIssuesMap(issueMap);

            if (sRes.data) {
                setSettings({ ...DEFAULT_SETTING, ...sRes.data });
            } else if (sRes.error && sRes.error.code !== "PGRST116") {
                // Ignore if not found
            } else if (!sRes.data) {
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

    const runJiraSync = async () => {
        setIsRunning(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/analysis/run", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ analysis_type: "jira" })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to trigger Jira sync.");
            }
            toast.success("Intelligence engine engaged. Processing neural stream for Jira...");
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsRunning(false);
        }
    };

    const approveJira = async (id: string) => {
        if (!activeApproval) return;
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/jira/execute-approval", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    issue_key: activeApproval.payload.issue_key,
                    target_status: activeApproval.payload.target_status,
                    approval_id: id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to execute Jira approval.");
            }

            toast.success(`Successfully transitioned ${activeApproval.payload.issue_key} to ${activeApproval.payload.target_status}`);
            setActiveApproval(null);
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const rejectJira = async (id: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("approval_requests")
                .update({ status: "rejected", reviewed_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
            toast.success("Suggested transition rejected.");
            setActiveApproval(null);
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const pendingApprovals = useMemo(() => approvals.filter(a => a.status === "pending"), [approvals]);
    const archivedApprovals = useMemo(() => {
        return approvals.filter(a => {
            const isArchived = a.status === "approved" || a.status === "rejected" || a.status === "executed";
            const matchesSearch = !historySearch || 
                (a.payload?.issue_key || "").toLowerCase().includes(historySearch.toLowerCase()) ||
                (a.summary || "").toLowerCase().includes(historySearch.toLowerCase());
            return isArchived && matchesSearch;
        });
    }, [approvals, historySearch]);

    const stats = useMemo(() => {
        // Count both 'approved' (pending move) and 'executed' (successfully moved)
        const approvedCount = approvals.filter(a => a.status === "approved" || a.status === "executed").length;
        return {
            totalPending: pendingApprovals.length,
            approvedMoves: approvedCount,
        };
    }, [approvals, pendingApprovals]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#3B82F6] animate-spin stroke-[1.5px] opacity-20" />
                    <Loader2 className="w-16 h-16 text-[#3B82F6] animate-spin stroke-[3px] absolute inset-0 [animation-duration:1.5s]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Syncing Workspaces.</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3B82F6]">One moment.</p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition pageTitle="Jira Workflow Automation">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-10 pb-12">
                
                {/* ── Row 1: Hero + Action ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/[0.03] rounded-full blur-[100px] pointer-events-none group-hover:bg-[#3B82F6]/[0.06] transition-colors duration-1000" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <Trello className="w-6 h-6 text-[#3B82F6]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] italic">Jira Agile Orchestrator</p>
                                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic" style={{ fontFamily: "Outfit, sans-serif" }}>Automation Ready</h2>
                                </div>
                            </div>
                            <div className="flex items-end gap-6 mb-4">
                                <span className="text-[6rem] lg:text-[7.5rem] font-black text-white italic leading-none tracking-tighter" style={{ fontFamily: "Outfit, sans-serif" }}>
                                    {stats.totalPending}
                                </span>
                                <div className="flex flex-col mb-4">
                                    <span className="text-2xl font-black text-[#3B82F6] uppercase tracking-widest leading-none italic">Pending</span>
                                    <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 italic">Suggested Moves</span>
                                </div>
                            </div>
                            <p className="text-white/30 text-sm max-w-lg italic font-medium leading-relaxed">
                                {stats.totalPending > 0 
                                    ? `Neural engine has inferred ${stats.totalPending} card movements based on GitHub commits and PR merges. Review and approve them to keep your boards perfectly synced.`
                                    : "All cards are synced. No pending movements suggested by the engine at this time."}
                            </p>
                        </div>
                        <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.05] flex flex-wrap gap-10">
                            <div>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Total Approved</p>
                                <p className="text-3xl font-black text-white italic" style={{ fontFamily: "Outfit, sans-serif" }}>{stats.approvedMoves}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="flex flex-col gap-4">
                        <div className="glass-panel rounded-[2.5rem] p-8 space-y-8 flex flex-col justify-between relative overflow-hidden group bg-gradient-to-b from-white/[0.02] to-transparent flex-1">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[#3B82F6]/20 transition-all">
                                        <Clock className="w-6 h-6 text-[#3B82F6]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic leading-none mb-1">Strategic Automation</p>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Scheduling</h3>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic px-1">Daily Sync Window</p>
                                        <div className="relative">
                                            <input 
                                                type="time" 
                                                value={(settings.jira_run_time || "18:00").slice(0, 5)} 
                                                onChange={(e) => setSettings({ ...settings, jira_run_time: e.target.value })}
                                                className="w-full h-14 rounded-2xl bg-black/40 border border-white/5 px-6 text-sm text-white focus:outline-none focus:border-[#3B82F6]/40 transition-all font-bold italic"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic px-1">Enable Jira Automation</p>
                                        <div className="flex items-center gap-3 px-2">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={settings.jira_enabled} onChange={(e) => setSettings({ ...settings, jira_enabled: e.target.checked })} />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                                            </label>
                                            <span className="text-sm font-black text-white/40 italic">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={updateSettings} disabled={isSaving} className="h-14 rounded-[1.5rem] bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-[#3B82F6]/30 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 italic">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-white/40" />} Update
                            </button>
                        </div>

                        <button onClick={runJiraSync} disabled={isRunning} className="glass-panel rounded-[2rem] p-6 flex items-center gap-5 group hover:border-[#3B82F6]/40 transition-all active:scale-95 disabled:opacity-50 border border-transparent bg-white/[0.01]">
                            <div className="w-14 h-14 rounded-2xl bg-[#3B82F6] flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform shrink-0">
                                {isRunning ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Play className="w-6 h-6 text-white stroke-[3.5px]" />}
                            </div>
                            <div className="text-left">
                                <p className="text-[15px] font-black text-white group-hover:text-[#3B82F6] transition-colors italic uppercase tracking-tight">Sync Jira Now</p>
                                <p className="text-[10px] text-white/30 mt-0.5 italic font-medium uppercase tracking-widest">Execute AI Engine</p>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* ── Row 2: Pending Jira Approvals ── */}
                {pendingApprovals.length > 0 && (
                    <motion.div variants={staggerItem} className="glass-panel rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/[0.02] rounded-full blur-[100px] pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight italic">Pending Transitions</h3>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest italic">{pendingApprovals.length} movements require manual approval</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                            {pendingApprovals.map((req) => (
                                <button 
                                    key={req.id} 
                                    onClick={() => setActiveApproval(req)} 
                                    className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#3B82F6]/30 transition-all text-left overflow-hidden shadow-xl"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] italic">
                                            {req.payload.issue_key}
                                        </div>
                                        <Zap className="w-3.5 h-3.5 text-white/10 group-hover:text-[#3B82F6] transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[12px] font-black text-white/60 italic">Move To:</span>
                                        <span className="text-[14px] font-black text-white group-hover:text-[#3B82F6] transition-colors italic">{req.payload.target_status}</span>
                                    </div>
                                    <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed font-medium italic mb-4">{req.summary}</p>
                                    <div className="flex items-center justify-end pt-4 border-t border-white/[0.03]">
                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Slide-over Right Sidebar for Approval Review ── */}
                <AnimatePresence>
                    {activeApproval && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveApproval(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]" />
                            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }} className="fixed top-4 right-4 bottom-4 w-full max-w-[560px] bg-[#0C0D10]/95 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] z-[70] overflow-hidden flex flex-col">
                                <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent" />
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center border border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#3B82F6] shadow-inner">
                                            <Trello className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic leading-none">{activeApproval.payload.issue_key}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic text-[#3B82F6]">
                                                Suggested Movement
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setActiveApproval(null)} className="w-11 h-11 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all shadow-inner">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 pt-8 space-y-10 custom-scrollbar">
                                    <div className="flex items-center gap-6 justify-center">
                                        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black italic uppercase tracking-widest text-sm">
                                            Current
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-[#3B82F6]" />
                                        <div className="px-6 py-3 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] font-black italic uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                            {activeApproval.payload.target_status}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Engine Reasoning</p>
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/[0.05] to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                            <p className="relative text-[15px] text-white/80 leading-relaxed bg-[#141518]/60 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm italic font-medium">
                                                {activeApproval.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Jira Card Details from local cache */}
                                    {jiraIssuesMap[activeApproval.payload.issue_key] && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-1 italic">Jira Card Details</p>
                                            <div className="bg-[#141518]/60 p-6 rounded-[2rem] border border-white/5 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">{activeApproval.payload.issue_key}</span>
                                                    <span className="text-white/20 text-xs">·</span>
                                                    <span className="text-[10px] font-bold text-white/40 uppercase">{jiraIssuesMap[activeApproval.payload.issue_key].status}</span>
                                                </div>
                                                <p className="text-sm font-black text-white/80">{jiraIssuesMap[activeApproval.payload.issue_key].summary}</p>
                                                {jiraIssuesMap[activeApproval.payload.issue_key].description && (
                                                    <p className="text-xs text-white/40 leading-relaxed">{jiraIssuesMap[activeApproval.payload.issue_key].description.slice(0, 300)}</p>
                                                )}
                                                {jiraIssuesMap[activeApproval.payload.issue_key].assignee_name && (
                                                    <p className="text-[10px] text-white/30">Assigned to: <span className="text-white/50 font-bold">{jiraIssuesMap[activeApproval.payload.issue_key].assignee_name}</span></p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 mt-8">
                                        <button 
                                            onClick={() => approveJira(activeApproval.id)} 
                                            disabled={isSaving}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-blue-400 text-white font-black italic tracking-widest uppercase flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve & Execute Movement"}
                                        </button>
                                        <button 
                                            onClick={() => rejectJira(activeApproval.id)}
                                            disabled={isSaving}
                                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 font-black italic tracking-widest uppercase transition-all disabled:opacity-50"
                                        >
                                            Reject Suggestion
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </PageTransition>
    );
}
