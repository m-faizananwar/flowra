"use client";

import { motion } from "framer-motion";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import { 
    ArrowRight, 
    Settings2, 
    RefreshCw, 
    CheckCircle2,
    Zap,
    Search,
    MoreVertical,
    Users,
    Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { DiscordConnectorModal } from "./DiscordConnectorModal";
import { TelegramConnectorModal } from "./TelegramConnectorModal";
import { SlackConnectorModal } from "./SlackConnectorModal";
import GitHubConnectorModal from "./GitHubConnectorModal";
import { JiraConnectorModal } from "./JiraConnectorModal";
import MembersModal from "./MembersModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import React from "react";

const MOCK_INTEGRATIONS = [
    { id: "github", name: "GitHub", category: "Version Control", icon: "https://cdn.simpleicons.org/github/white", status: "not_connected", lastSync: "N/A", color: "text-white" },
    { id: "jira", name: "Jira Cloud", category: "Project Management", icon: "https://cdn.simpleicons.org/jira/0052CC", status: "not_connected", lastSync: "N/A", color: "text-blue-400" },
    { id: "discord", name: "Discord", category: "Communications", icon: "https://cdn.simpleicons.org/discord/5865F2", status: "not_connected", lastSync: "N/A", color: "text-indigo-400" },
    { id: "slack", name: "Slack Enterprise", category: "Communications", icon: "https://www.vectorlogo.zone/logos/slack/slack-icon.svg", status: "not_connected", lastSync: "N/A", color: "text-purple-400" },
    { id: "telegram", name: "Telegram", category: "Communications", icon: "https://cdn.simpleicons.org/telegram/26A69A", status: "not_connected", lastSync: "N/A", color: "text-sky-400" },
];

export function IntegrationsContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [userIntegrations, setUserIntegrations] = useState<any[]>([]);
    const [viewingMembers, setViewingMembers] = useState<any | null>(null);
    const [deletingIntegration, setDeletingIntegration] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const installationId = searchParams?.get('installation_id');
        const setupAction = searchParams?.get('setup_action');
        
        if (installationId && setupAction === 'install') {
            // The user was redirected here by GitHub instead of the API route.
            // Redirect them to the proper API route so the backend can process it.
            // We need to pass the state if possible, but the API route will fallback to the cookie.
            router.replace(`/api/auth/callback/github?installation_id=${installationId}&setup_action=${setupAction}`);
        }
    }, [searchParams, router]);

    const fetchIntegrations = async () => {
        try {
            const { data, error } = await supabase
                .from('integrations')
                .select('*');
            
            if (error) throw error;
            setUserIntegrations(data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleDeleteIntegration = async () => {
        if (!deletingIntegration) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('integrations')
                .delete()
                .eq('id', deletingIntegration.id);
            
            if (error) throw error;
            
            toast.success(`${deletingIntegration.service_name} disconnected successfully.`);
            await fetchIntegrations();
            setDeletingIntegration(null);
        } catch (error: any) {
            toast.error(`Removal failed: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchIntegrations();
            setIsLoading(false);
        };
        init();
    }, []);

    if (isLoading) {
        return <AnimatedLoader />;
    }

    return (
        <PageTransition pageTitle="Integrations">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
                            Core Hub
                        </h1>
                        <p className="text-[12px] font-bold text-white/40 uppercase tracking-[0.2em] mt-2">Engineered for every sprint.</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="relative group">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                 type="text"
                                 placeholder="Search systems..."
                                 className="h-12 w-64 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Hero Feature Card */}
                <motion.div 
                    variants={staggerItem}
                    className="relative p-12 rounded-[3.5rem] bg-gradient-to-br from-[#121316] to-[#0A0A0B] border border-white/5 overflow-hidden group shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]"
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Active Engine</span>
                            </div>
                            
                            <div className="space-y-4">
                                <h2 className="text-6xl lg:text-7xl font-black text-white tracking-[1px] leading-[0.85]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                                    Continuous<br />
                                    <span className="text-white/20">Sync.</span>
                                </h2>
                                <p className="text-xl font-medium text-white/40 max-w-lg leading-relaxed">
                                    Every commit. Every message. Perfectly aligned. Your engine watches every signal in real-time.
                                </p>
                            </div>

                            <button className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-violet-50 transition-all hover:translate-y-[-2px] active:translate-y-0 shadow-[0_15px_35px_rgba(255,255,255,0.1)] flex items-center gap-3">
                                Sync All Systems
                                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:gap-8">
                            <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group-hover:bg-white/[0.04] transition-all duration-700">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 text-center">Active Nodes</p>
                                <div className="text-center mb-6">
                                    <span className="text-6xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{userIntegrations.length}</span>
                                    <span className="text-xl font-black text-white/20 tracking-tighter">/32</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(userIntegrations.length / 32) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group-hover:bg-white/[0.04] transition-all duration-700">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 text-center">Engine Health</p>
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                                        <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full" />
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-white text-center tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>STABLE</p>
                                <p className="text-[9px] font-bold text-emerald-500/50 text-center uppercase tracking-widest mt-2">Verified Now</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {MOCK_INTEGRATIONS.map((app) => {
                        const integrations = userIntegrations.filter(ui => ui.service_name === app.id);
                        const isConnected = integrations.length > 0;
                        const firstIntegration = integrations[0];
                        
                        return (
                            <motion.div 
                                key={app.id}
                                variants={staggerItem}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className={cn(
                                    "p-8 rounded-[2.5rem] backdrop-blur-2xl border transition-all duration-500 group relative overflow-hidden",
                                    isConnected 
                                        ? "bg-white border-white/20 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.1)]" 
                                        : "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white"
                                )}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border",
                                        isConnected ? "bg-black/[0.03] border-black/5" : "bg-white/[0.04] backdrop-blur-xl border-white/5 group-hover:bg-black/[0.03] group-hover:border-black/5"
                                    )}>
                                        <Image 
                                            src={app.icon} 
                                            alt={app.name} 
                                            className={cn(
                                                "w-7 h-7 transition-all duration-500", 
                                                isConnected ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                                                // Invert white logos only when the background turns white
                                                ["github"].includes(app.id) && (isConnected ? "invert" : "group-hover:invert")
                                            )} 
                                            width={28} height={28} unoptimized
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                             <div className={cn(
                                                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md transition-colors",
                                                  isConnected 
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                                    : "bg-white/5 text-white/20 border-white/10 group-hover:bg-black/5 group-hover:text-black/40 group-hover:border-black/5"
                                             )}>
                                                  {isConnected ? (integrations.length > 1 ? `${integrations.length} Accounts` : "Connected") : "Not Linked"}
                                             </div>
                                             <p className={cn(
                                                "text-[8px] font-black uppercase tracking-widest mt-2 transition-colors",
                                                isConnected ? "text-black/20" : "text-white/10 group-hover:text-black/20"
                                             )}>
                                                {isConnected ? (firstIntegration.last_sync_at ? new Date(firstIntegration.last_sync_at).toLocaleDateString() : "Active") : "N/A"}
                                             </p>
                                        </div>

                                        {isConnected && (
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === app.id ? null : app.id);
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-black/40 hover:text-black"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {activeMenu === app.id && (
                                                    <div className="absolute right-0 top-12 w-48 bg-white border border-black/5 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200">
                                                        <button 
                                                            onClick={() => {
                                                                setViewingMembers(firstIntegration);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            Manage Members
                                                        </button>
                                                        <div className="h-px bg-black/5 my-1" />
                                                        <button 
                                                            onClick={() => {
                                                                setDeletingIntegration(firstIntegration);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Disconnect
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-8" onClick={() => {
                                    if (app.id === "discord") setActiveModal("discord");
                                    if (app.id === "telegram") setActiveModal("telegram");
                                    if (app.id === "slack") setActiveModal("slack");
                                    if (app.id === "github") setActiveModal("github");
                                    if (app.id === "jira") setActiveModal("jira");
                                }}>
                                    <h4 className={cn("text-xl font-black transition-colors", isConnected ? "text-black" : "text-white group-hover:text-black")}>{app.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", isConnected ? "text-black/40" : "text-white/20 group-hover:text-black/40")}>{app.category}</p>
                                        {isConnected && (
                                            <>
                                                <div className="w-1 h-1 rounded-full bg-black/10 group-hover:bg-black/10 transition-colors" />
                                                <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">
                                                    Hierarchy Active
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={cn("pt-6 border-t flex items-center justify-between transition-colors", isConnected ? "border-black/5" : "border-white/[0.03] group-hover:border-black/5")}>
                                    <button 
                                        onClick={() => {
                                            if (app.id === "discord") setActiveModal("discord");
                                            if (app.id === "telegram") setActiveModal("telegram");
                                            if (app.id === "slack") setActiveModal("slack");
                                            if (app.id === "github") setActiveModal("github");
                                            if (app.id === "jira") setActiveModal("jira");
                                        }}
                                        className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors", isConnected ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white group-hover:text-black/40 group-hover:hover:text-black")}
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Configure
                                    </button>
                                     {isConnected ? (
                                        <div className="flex items-center gap-2 text-violet-500 transition-colors">
                                            <Zap className="w-3.5 h-3.5 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Multi-Channel Active</span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                if (app.id === "discord") setActiveModal("discord");
                                                if (app.id === "telegram") setActiveModal("telegram");
                                                if (app.id === "slack") setActiveModal("slack");
                                                if (app.id === "github") setActiveModal("github");
                                                if (app.id === "jira") setActiveModal("jira");
                                            }}
                                            className="flex items-center gap-1.5 text-[#8B5CF6] group/btn group-hover:text-black transition-colors"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Modals */}
            <DiscordConnectorModal 
                isOpen={activeModal === "discord"} 
                onClose={() => setActiveModal(null)}
                initialData={userIntegrations.find(ui => ui.service_name === "discord")}
                onSuccess={() => {
                    fetchIntegrations();
                    toast.success("Discord interface active.");
                }}
            />
            <TelegramConnectorModal 
                isOpen={activeModal === "telegram"} 
                onClose={() => setActiveModal(null)}
                initialData={userIntegrations.find(ui => ui.service_name === "telegram")}
                onSuccess={() => {
                    fetchIntegrations();
                    toast.success("Telegram tunnel active.");
                }}
            />
            <SlackConnectorModal 
                isOpen={activeModal === "slack"} 
                onClose={() => setActiveModal(null)}
                initialData={userIntegrations.find(ui => ui.service_name === "slack")}
                onSuccess={() => {
                    fetchIntegrations();
                    toast.success("Slack Enterprise bridge enabled.");
                }}
            />
            <GitHubConnectorModal 
                isOpen={activeModal === "github"} 
                onClose={() => setActiveModal(null)}
                integration={userIntegrations.find(ui => ui.service_name === "github")}
            />
            <JiraConnectorModal 
                isOpen={activeModal === "jira"} 
                onClose={() => setActiveModal(null)}
                initialData={userIntegrations.find(ui => ui.service_name === "jira")}
                onSuccess={() => {
                    fetchIntegrations();
                    toast.success("Jira Agent established.");
                }}
            />

            {/* Managed Members Modal */}
            {viewingMembers && (
                <MembersModal 
                    isOpen={!!viewingMembers}
                    onClose={() => setViewingMembers(null)}
                    integration={viewingMembers}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal 
                isOpen={!!deletingIntegration}
                onClose={() => setDeletingIntegration(null)}
                onConfirm={handleDeleteIntegration}
                isLoading={isDeleting}
                title="Remove Integration?"
                description={`This will permanently disconnect ${deletingIntegration?.service_name} from Flowra. You will lose all synced channel data and member profiles.`}
            />
        </PageTransition>
    );
}
