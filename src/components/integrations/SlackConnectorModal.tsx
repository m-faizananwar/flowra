"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Slack, 
    Zap, 
    ShieldCheck, 
    ExternalLink, 
    MessageSquare,
    CheckCircle2,
    Loader2,
    Hash,
    Copy,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SlackConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SlackConnectorModal({ isOpen, onClose, onSuccess }: SlackConnectorModalProps) {
    const [step, setStep] = useState(1);
    const [token, setToken] = useState("");
    const [channelId, setChannelId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (!token || !channelId) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsConnecting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            const { error } = await supabase
                .from('integrations')
                .upsert({
                    user_id: user.id,
                    service_name: 'slack',
                    credentials: {
                        token,
                        channel_id: channelId
                    },
                    is_active: true
                });

            if (error) throw error;

            toast.success("Slack Enterprise bridge established.");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Link error:", error);
            toast.error(error.message || "Failed to link Slack");
        } finally {
            setIsConnecting(false);
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
                        className="relative w-full max-w-lg bg-[#17181C] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E01E5A]/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#E01E5A]/10 flex items-center justify-center border border-[#E01E5A]/20">
                                    <Slack className="w-6 h-6 text-[#E01E5A]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                                        Slack Tunnel.
                                    </h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Enterprise Signal Sync</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8">
                            {/* Step Indicator */}
                            <div className="flex items-center gap-4">
                                {[1, 2].map((s) => (
                                    <div 
                                        key={s}
                                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#E01E5A]' : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                                <ExternalLink className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Create Slack App</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Go to Slack API, create an app "From Scratch", and add <span className="text-[#E01E5A] font-black italic">channels:history</span> and <span className="text-[#E01E5A] font-black italic">chat:write</span> scopes.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                                            onClick={() => window.open('https://api.slack.com/apps', '_blank')}
                                        >
                                            Slack API Dashboard
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Bot User OAuth Token</label>
                                        <input 
                                            type="password"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="xoxb-..."
                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#E01E5A]/50 transition-all font-bold"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => setStep(2)}
                                        disabled={!token}
                                        className="w-full h-14 bg-[#E01E5A] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Next: Channel Settings
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#E01E5A]/10 flex items-center justify-center shrink-0">
                                                <Hash className="w-4 h-4 text-[#E01E5A]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Target Channel ID</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Open Slack, right-click your channel, and select "View Channel Details" to find the ID at the bottom (e.g., C0123ABC).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Channel ID</label>
                                        <input 
                                            type="text"
                                            value={channelId}
                                            onChange={(e) => setChannelId(e.target.value)}
                                            placeholder="C0..."
                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#E01E5A]/50 transition-all font-bold"
                                        />
                                    </div>

                                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-blue-500/60 leading-tight">
                                            Don't forget to invite the bot to the channel by typing <span className="text-white font-black">/invite @YourBotName</span> in Slack.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-14 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            onClick={handleConnect}
                                            disabled={!channelId || isConnecting}
                                            className="flex-[2] h-14 bg-[#24FF7C] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(36,255,124,0.2)] flex items-center justify-center gap-2"
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Finalize Bridge
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-[#E01E5A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">TLS Encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-[#E01E5A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Instant Polling</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
