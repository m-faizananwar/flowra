"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    MessageSquare, 
    Zap, 
    ShieldCheck, 
    ExternalLink, 
    Copy,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface DiscordConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DiscordConnectorModal({ isOpen, onClose, onSuccess }: DiscordConnectorModalProps) {
    const [step, setStep] = useState(1);
    const [token, setToken] = useState("");
    const [guildId, setGuildId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (!token || !guildId) {
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
                    service_name: 'discord',
                    credentials: {
                        token,
                        guild_id: guildId
                    },
                    is_active: true
                });

            if (error) throw error;

            toast.success("Discord linked successfully! OpenClaw is synchronizing.");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Link error:", error);
            toast.error(error.message || "Failed to link Discord");
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865F2]/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20">
                                    <MessageSquare className="w-6 h-6 text-[#5865F2]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                                        Link Discord.
                                    </h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">OpenClaw Signal Bridge</p>
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
                                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#5865F2]' : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                                                <Zap className="w-4 h-4 text-[#5865F2]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Create a Discord Bot</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Head to the Discord Developer Portal, create an application, and enable "Message Content Intent".
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            className="w-full h-11 rounded-xl bg-white/5 flex items-center justify-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                            onClick={() => window.open('https://discord.com/developers/applications', '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Open Portal
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Bot Token</label>
                                        <input 
                                            type="password"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="MTQ5NjI..."
                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#5865F2]/50 transition-all font-bold"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => setStep(2)}
                                        disabled={!token}
                                        className="w-full h-14 bg-[#5865F2] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        Continue to Settings
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#24FF7C]/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-4 h-4 text-[#24FF7C]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Target Server Identification</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    We need your Server ID to listen for signals. Enable Developer Mode in Discord Settings to copy it.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Server (Guild) ID</label>
                                        <input 
                                            type="text"
                                            value={guildId}
                                            onChange={(e) => setGuildId(e.target.value)}
                                            placeholder="123456789..."
                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all font-bold"
                                        />
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
                                            disabled={!guildId || isConnecting}
                                            className="flex-[2] h-14 bg-[#24FF7C] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(36,255,124,0.2)] flex items-center justify-center gap-2"
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4" />
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
                                <CheckCircle2 className="w-3 h-3 text-[#24FF7C] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Encrypted Storage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-[#24FF7C] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">OpenClaw Ready</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
