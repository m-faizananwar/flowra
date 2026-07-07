"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Trello, 
    Zap, 
    ShieldCheck, 
    ExternalLink, 
    MessageSquare,
    CheckCircle2,
    Loader2,
    Search,
    Send,
    RefreshCw,
    AlertCircle,
    Globe
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import React from "react";

interface JiraConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function JiraConnectorModal({ isOpen, onClose, onSuccess, initialData }: JiraConnectorModalProps) {
    const [step, setStep] = useState(1);
    const [isConnecting, setIsConnecting] = useState(false);
    const [testCommand, setTestCommand] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [connectedSite, setConnectedSite] = useState<any>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setStep(3);
                setConnectedSite(initialData.credentials);
            } else {
                setStep(1);
                setConnectedSite(null);
            }
        }
    }, [isOpen, initialData]);

    // Handle Step 2: Polling for connection
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && step === 2) {
            interval = setInterval(async () => {
                const { data, error } = await supabase
                    .from('integrations')
                    .select('*')
                    .eq('service_name', 'jira')
                    .single();
                
                if (data && !error) {
                    setConnectedSite(data.credentials);
                    setStep(3);
                    onSuccess();
                    clearInterval(interval);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen, step]);

    const handleConnect = async () => {
        setIsConnecting(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("You must be logged in to connect Jira");
            setIsConnecting(false);
            return;
        }

        // Jira OAuth 2.0 (3LO) Construction
        const CLIENT_ID = process.env.NEXT_PUBLIC_JIRA_CLIENT_ID;
        const CALLBACK_URL = encodeURIComponent(process.env.NEXT_PUBLIC_JIRA_CALLBACK_URL || "http://localhost:3000/api/auth/jira/callback");
        const SCOPES = encodeURIComponent("offline_access read:jira-work write:jira-work read:me manage:jira-project read:project:jira read:jira-user read:board-scope:jira read:board-scope:jira-software read:sprint:jira-software read:issue:jira-software read:jira-report");
        
        if (!CLIENT_ID) {
            toast.error("Jira Client ID not configured in .env");
            setIsConnecting(false);
            return;
        }

        // Use User ID as state to link the token back to the correct user
        const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${CALLBACK_URL}&response_type=code&prompt=consent&state=${user.id}`;
        
        window.location.href = authUrl;
    };

    const handleTestAgent = async () => {
        if (!testCommand) return;
        setIsTesting(true);
        setTestResult(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // This calls our future Phase 3 endpoint
            const response = await fetch('/api/jira/agent/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: testCommand, userId: user.id })
            });
            
            const data = await response.json();
            setTestResult(data);
            toast.success("Agent processed signal.");
        } catch (error) {
            toast.error("Agent verification failed.");
            setTestResult({ error: "Communication link timeout." });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052CC]/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Trello className="w-6 h-6 text-[#0052CC]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Jira Tunnel</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">3LO Protocol // {step === 3 ? 'ACTIVE' : 'READY'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Step Indicator */}
                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3].map((s) => (
                                    <div 
                                        key={s}
                                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#0052CC]' : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[#0052CC]/10 flex items-center justify-center shrink-0 border border-[#0052CC]/20">
                                                <ShieldCheck className="w-5 h-5 text-[#0052CC]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">One-Click SaaS Auth</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Connect Flowra to your Jira Cloud instance using professional OAuth 2.0. No API tokens required.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-wider pl-2">
                                                <div className="w-1 h-1 rounded-full bg-[#0052CC]" />
                                                Read Projects & Boards
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-wider pl-2">
                                                <div className="w-1 h-1 rounded-full bg-[#0052CC]" />
                                                Transition Issues (Move Cards)
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-wider pl-2">
                                                <div className="w-1 h-1 rounded-full bg-[#0052CC]" />
                                                Offline Agentic Support
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="w-full h-14 bg-[#0052CC] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,82,204,0.3)] flex items-center justify-center gap-3"
                                    >
                                        {isConnecting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Establish Handshake
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-8 py-12 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-[#0052CC]/10 flex items-center justify-center border border-[#0052CC]/20 animate-pulse">
                                            <Globe className="w-10 h-10 text-[#0052CC]" />
                                        </div>
                                        <div className="absolute -inset-4 border border-[#0052CC]/10 rounded-[3rem] animate-spin-slow" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Authorizing...</h4>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Awaiting Atlassian Callback Signal</p>
                                    </div>
                                    <p className="text-[11px] text-white/40 text-center max-w-[240px] leading-relaxed">
                                        Please complete the login in the Jira window. We will automatically advance when the handshake is confirmed.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Success Card */}
                                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Connection Verified</p>
                                            <h4 className="text-sm font-bold text-white">
                                                {connectedSite?.url || "Your Jira Instance"}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Test Flight / Chatbot */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Test Flight Agent</label>
                                            <span className="text-[9px] font-bold text-[#0052CC] uppercase tracking-widest">Gemini 1.5 Pro</span>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-white/20" />
                                            </div>
                                            <input 
                                                type="text"
                                                value={testCommand}
                                                onChange={(e) => setTestCommand(e.target.value)}
                                                placeholder="Try: 'Get my projects'..."
                                                className="w-full h-14 bg-white/[0.05] border border-white/10 rounded-2xl pl-16 pr-14 text-sm text-white focus:outline-none focus:border-[#0052CC]/50 transition-all font-bold placeholder:text-white/10"
                                                onKeyDown={(e) => e.key === 'Enter' && handleTestAgent()}
                                            />
                                            <button 
                                                onClick={handleTestAgent}
                                                disabled={!testCommand || isTesting}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#0052CC] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                                            >
                                                {isTesting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Test Result Display */}
                                        {testResult && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-[10px] text-white/40 overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="uppercase tracking-widest text-[#0052CC]">Agent Response</span>
                                                    <span>{new Date().toLocaleTimeString()}</span>
                                                </div>
                                                <pre className="whitespace-pre-wrap">
                                                    {JSON.stringify(testResult, null, 2)}
                                                </pre>
                                            </motion.div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={onClose}
                                        className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] transition-all shadow-[0_15px_30px_rgba(255,255,255,0.05)]"
                                    >
                                        Complete Integration
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-[#0052CC] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Encrypted Storage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-[#0052CC] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Signal Priority</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
