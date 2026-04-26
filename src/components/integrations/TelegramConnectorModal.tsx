"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Send, 
    ShieldCheck, 
    ExternalLink, 
    MessageCircle,
    CheckCircle2,
    Loader2,
    Info,
    Copy
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface TelegramConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TelegramConnectorModal({ isOpen, onClose, onSuccess }: TelegramConnectorModalProps) {
    const [step, setStep] = useState(1);
    const [chatId, setChatId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (!chatId) {
            toast.error("Please provide a Chat ID");
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
                    service_name: 'telegram',
                    credentials: {
                        chat_id: chatId
                    },
                    is_active: true
                });

            if (error) throw error;

            toast.success("Telegram tunnel established.");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Link error:", error);
            toast.error(error.message || "Failed to link Telegram");
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#26A69A]/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#26A69A]/10 flex items-center justify-center border border-[#26A69A]/20">
                                    <Send className="w-6 h-6 text-[#26A69A]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                                        Telegram Bridge.
                                    </h3>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Signal Intake</p>
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
                            <div className="flex items-center gap-4">
                                {[1, 2].map((s) => (
                                    <div 
                                        key={s}
                                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#26A69A]' : 'bg-white/5'}`}
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
                                                <p className="text-sm font-bold text-white mb-1">Add Flowra to your Group</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Invite <span className="text-[#26A69A] font-black">@FlowraAgentBot</span> to your project group and make it an admin to listen for Agile signals.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                className="flex-1 h-12 rounded-xl bg-[#26A69A]/10 border border-[#26A69A]/20 flex items-center justify-center gap-2 text-[10px] font-black text-[#26A69A] uppercase tracking-widest hover:bg-[#26A69A]/20 transition-all"
                                                onClick={() => window.open('https://t.me/FlowraAgentBot', '_blank')}
                                            >
                                                Open Bot
                                            </button>
                                            <button 
                                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                                                onClick={() => {
                                                    navigator.clipboard.writeText("@FlowraAgentBot");
                                                    toast.success("Bot username copied");
                                                }}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-amber-500/60 leading-tight">
                                            Note: The bot must be present in the group BEFORE you can finalize the link.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setStep(2)}
                                        className="w-full h-14 bg-[#26A69A] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        I have added the Bot
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#26A69A]/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-4 h-4 text-[#26A69A]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Tunnel Configuration</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Enter the Group Chat ID. You can get this by sending <span className="text-white font-black italic">/id</span> to the bot in your group.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Chat (Group) ID</label>
                                        <input 
                                            type="text"
                                            value={chatId}
                                            onChange={(e) => setChatId(e.target.value)}
                                            placeholder="-100..."
                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#26A69A]/50 transition-all font-bold"
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
                                            disabled={!chatId || isConnecting}
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

                        {/* Footer */}
                        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-3 h-3 text-[#26A69A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Public/Private Groups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-[#26A69A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Signal Validation</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
