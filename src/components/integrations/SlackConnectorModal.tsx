"use client";

import { useState, useEffect } from "react";
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
    Info,
    Trash2,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SlackConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function SlackConnectorModal({ isOpen, onClose, onSuccess, initialData }: SlackConnectorModalProps) {
    const [step, setStep] = useState(initialData ? 3 : 1);
    const [channelId, setChannelId] = useState(initialData?.credentials?.channel_id || "");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(initialData ? 3 : 1);
            setChannelId(initialData?.credentials?.channel_id || "");
        }
    }, [isOpen, initialData]);

    const handleConnect = async () => {
        if (!channelId) {
            toast.error("Please provide a Channel ID");
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
                        channel_id: channelId
                    },
                    is_active: true
                }, { onConflict: 'user_id, service_name' });

            if (error) throw error;

            toast.success("Slack updated successfully!");
            onSuccess();
            setStep(3);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }
        
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('integrations')
                .delete()
                .eq('id', initialData.id);

            if (error) throw error;

            toast.success("Slack disconnected.");
            onSuccess();
            onClose();
            setStep(1);
            setChannelId("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
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
                        className="relative w-full max-w-lg bg-[#1A1D21] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E01E5A]/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Slack className="w-6 h-6 text-[#E01E5A]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Slack Connect</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Enterprise Bridge // ACTIVE</p>
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
                                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#E01E5A]' : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                                <Zap className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Add Flowra to Slack</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Invite the official Flowra bot to your workspace to start syncing messages and tasks automatically.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="w-full h-12 rounded-xl bg-[#E01E5A]/10 border border-[#E01E5A]/20 flex items-center justify-center gap-2 text-[10px] font-black text-[#E01E5A] uppercase tracking-widest hover:bg-[#E01E5A]/20 transition-all"
                                            onClick={() => window.open(process.env.NEXT_PUBLIC_SLACK_INVITE_URL || 'https://slack.com/oauth/v2/authorize?client_id=1498961614140080230&scope=channels:history,chat:write,users:read', '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Add to Slack
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-amber-500/60 leading-tight">
                                            Note: You'll need to invite the bot to specific channels using <span className="text-white font-black">/invite @Flowra</span> once installed.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setStep(2)}
                                        className="w-full h-14 bg-[#E01E5A] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        I have installed the bot
                                    </button>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#E01E5A]/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-4 h-4 text-[#E01E5A]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Get your Channel ID</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Open Slack and find the Channel ID in the channel settings (at the bottom of the 'About' tab).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Channel ID</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E01E5A] transition-colors" />
                                            <input 
                                                type="text"
                                                value={channelId}
                                                onChange={(e) => setChannelId(e.target.value)}
                                                placeholder="C0123456789"
                                                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 text-sm text-white focus:outline-none focus:border-[#E01E5A]/50 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setStep(initialData ? 3 : 1)}
                                            className="flex-1 h-14 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            onClick={handleConnect}
                                            disabled={!channelId || isConnecting}
                                            className="flex-[2] h-14 bg-[#E01E5A] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(224,30,90,0.2)] flex items-center justify-center gap-2"
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
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2rem] bg-[#E01E5A]/5 border border-[#E01E5A]/10 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-[#E01E5A]/10 flex items-center justify-center mb-4 border border-[#E01E5A]/20">
                                            <CheckCircle2 className="w-8 h-8 text-[#E01E5A]" />
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2">Slack is Linked</h4>
                                        <p className="text-xs text-white/40 leading-relaxed max-w-[240px]">
                                            Flowra is currently monitoring Channel: <span className="text-[#E01E5A] font-bold">{channelId}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setStep(2)}
                                            className="w-full h-12 bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Change Channel ID
                                        </button>
                                        
                                        <button 
                                            onClick={handleDisconnect}
                                            disabled={isDeleting}
                                            className="w-full h-12 bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20 flex items-center justify-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Remove Integration
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button 
                                        onClick={onClose}
                                        className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] transition-all"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Confirmation Overlay */}
                        <AnimatePresence>
                            {showDeleteConfirm && (
                                <motion.div 
                                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                    animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                    className="absolute inset-0 z-[110] bg-black/60 flex items-center justify-center p-8 text-center"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="w-20 h-20 rounded-[2rem] bg-rose-500/20 flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                                            <AlertCircle className="w-10 h-10 text-rose-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white mb-2">Are you sure?</h4>
                                            <p className="text-[11px] font-bold text-white/40 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider">
                                                This will permanently disconnect Slack and stop all message syncing.
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 h-12 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all border border-white/5"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleDisconnect}
                                                className="flex-1 h-12 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-rose-600 transition-all shadow-[0_10px_20px_rgba(244,63,94,0.3)]"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Disconnect"}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Tips */}
                        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-[#E01E5A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Protocol Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-[#E01E5A] opacity-40" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Socket Mode</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
