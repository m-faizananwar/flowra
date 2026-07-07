"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    MessageSquare, 
    Zap, 
    ShieldCheck, 
    ExternalLink, 
    Copy,
    CheckCircle2,
    Loader2,
    Info,
    Trash2,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface DiscordConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function DiscordConnectorModal({ isOpen, onClose, onSuccess, initialData }: DiscordConnectorModalProps) {
    const [step, setStep] = useState(initialData ? 3 : 1);
    const [guildId, setGuildId] = useState(initialData?.credentials?.guild_id || "");
    const [channels, setChannels] = useState<{id: string, name?: string}[]>([]);
    const [newChannelId, setNewChannelId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoadingChannels, setIsLoadingChannels] = useState(false);

    const fetchChannels = async (integrationId: string) => {
        setIsLoadingChannels(true);
        try {
            const { data, error } = await supabase
                .from('channels')
                .select('*')
                .eq('integration_id', integrationId);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                setChannels(data.map(c => ({ id: c.external_id, name: c.name })));
            } else if (initialData?.credentials?.channels) {
                // Fallback to legacy credentials format if sub-table is empty
                setChannels(initialData.credentials.channels.map((c: any) => ({
                    id: typeof c === 'string' ? c : (c.id || c.external_id),
                    name: typeof c === 'string' ? "Recovered Channel" : (c.name || "Recovered Channel")
                })));
            } else if (initialData?.credentials?.channel_ids) {
                // Fallback to array of IDs
                setChannels(initialData.credentials.channel_ids.map((id: string) => ({
                    id,
                    name: "Recovered Channel"
                })));
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
        } finally {
            setIsLoadingChannels(false);
        }
    };

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            Promise.resolve().then(() => setGuildId(initialData?.credentials?.guild_id || ""));
            if (initialData?.id) {
                Promise.resolve().then(() => fetchChannels(initialData.id));
            } else {
                Promise.resolve().then(() => setChannels([]));
            }
        }
    }, [isOpen, initialData]);

    const addChannel = () => {
        if (!newChannelId) return;
        if (channels.some(c => c.id === newChannelId)) {
            toast.error("Channel already added");
            return;
        }
        setChannels([...channels, { id: newChannelId, name: "Pending sync..." }]);
        setNewChannelId("");
    };

    const removeChannel = (id: string) => {
        setChannels(channels.filter(c => c.id !== id));
    };

    const handleConnect = async () => {
        if (!guildId) {
            toast.error("Please provide a Server ID");
            return;
        }

        setIsConnecting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            // 1. Upsert the integration (The Account)
            const { data: integration, error: integrationError } = await supabase
                .from('integrations')
                .upsert({
                    id: initialData?.id || undefined,
                    user_id: user.id,
                    service_name: 'discord',
                    credentials: {
                        guild_id: guildId,
                        channels: channels, // Backward compatibility
                        channel_ids: channels.map(c => c.id) // Plural for consistency
                    },
                    is_active: true
                }, { onConflict: 'id' })
                .select()
                .single();

            if (integrationError) throw integrationError;

            // 2. Sync the Sub-Table (Channels)
            const externalIds = channels.map(c => c.id);
            
            // First, remove channels that are no longer in our local list
            if (externalIds.length > 0) {
                await supabase
                    .from('channels')
                    .delete()
                    .eq('integration_id', integration.id)
                    .not('external_id', 'in', externalIds);
            } else {
                // If no channels left, clear all for this integration
                await supabase
                    .from('channels')
                    .delete()
                    .eq('integration_id', integration.id);
            }

            // Then, upsert the current list
            if (channels.length > 0) {
                const { error: channelError } = await supabase
                    .from('channels')
                    .upsert(
                        channels.map(c => ({
                            integration_id: integration.id,
                            external_id: c.id,
                            name: c.name === "Pending sync..." || c.name === "Recovered Channel" ? null : c.name
                        })),
                        { onConflict: 'integration_id,external_id' }
                    );

                if (channelError) throw channelError;
            }

            toast.success("Discord updated successfully!");
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

            toast.success("Discord disconnected.");
            onSuccess();
            onClose();
            setStep(1);
            setGuildId("");
            setChannels([]);
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
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Discord Bridge</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Protocol 1.0 // ACTIVE</p>
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
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3].map((s) => (
                                <div 
                                    key={s}
                                    className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#5865F2]' : 'bg-white/5'}`}
                                />
                            ))}
                        </div>

                        {/* Persistent Instructions */}
                        <div className="mb-6 p-4 rounded-2xl bg-[#5865F2]/5 border border-[#5865F2]/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20">
                                    <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Channel ID</p>
                                    <code className="text-[11px] font-black text-[#5865F2]">/flowra-id</code>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/5" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/20">
                                    <RefreshCw className="w-4 h-4 text-[#5865F2]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Bot Status</p>
                                    <code className="text-[11px] font-black text-[#5865F2]">/flowra-status</code>
                                </div>
                            </div>
                        </div>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                                <Zap className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Invite the Bot</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Invite the official Flowra bot to your Discord server to start synchronizing messages and managing tasks.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="w-full h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center gap-2 text-[10px] font-black text-[#5865F2] uppercase tracking-widest hover:bg-[#5865F2]/20 transition-all"
                                            onClick={() => window.open(process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.com/oauth2/authorize?client_id=1499705332027494420&permissions=68608&integration_type=0&scope=bot+applications.commands', '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Open Invite Portal
                                        </button>
                                    </div>


                                    <button 
                                        onClick={() => setStep(2)}
                                        className="w-full h-14 bg-[#5865F2] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        I have invited the bot
                                    </button>
                                </div>
                            ) : step === 2 ? (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#24FF7C]/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-4 h-4 text-[#24FF7C]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Get your Server ID</p>
                                                <p className="text-xs text-white/40 leading-relaxed">
                                                    Run the command <span className="text-[#5865F2] font-black">/flowra-id</span> in any channel on your server to get your ID.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">Server (Guild) ID</label>
                                            <input 
                                                type="text"
                                                value={guildId}
                                                onChange={(e) => setGuildId(e.target.value)}
                                                placeholder="123456789..."
                                                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white focus:outline-none focus:border-[#5865F2]/50 transition-all font-bold"
                                            />
                                        </div>

                                        <div className="h-px bg-white/5 mx-2" />

                                        <div className="flex items-center justify-between pl-2">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tracked Channels (Optional)</label>
                                            <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-widest">{channels.length} Added</span>
                                        </div>

                                        {/* Channel List */}
                                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                            {isLoadingChannels ? (
                                                <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-20">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <p className="text-[8px] font-black uppercase tracking-widest">Fetching Sync State...</p>
                                                </div>
                                            ) : channels.length === 0 ? (
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No channels tracked</p>
                                                </div>
                                            ) : (
                                                channels.map((channel) => (
                                                    <div key={channel.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#5865F2]/30 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#5865F2]/10 group-hover:border-[#5865F2]/20 transition-all">
                                                                <MessageSquare className="w-3.5 h-3.5 text-white/20 group-hover:text-[#5865F2]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-bold text-white tracking-tight">{channel.id}</p>
                                                                <p className={cn(
                                                                    "text-[9px] font-black uppercase tracking-widest",
                                                                    channel.name ? "text-emerald-500/50" : "text-white/20"
                                                                )}>
                                                                    {channel.name || 'Awaiting Sync'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeChannel(channel.id)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Add Channel */}
                                        <div className="relative group">
                                            <input 
                                                type="text"
                                                value={newChannelId}
                                                onChange={(e) => setNewChannelId(e.target.value)}
                                                placeholder="Specific Channel ID..."
                                                className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-6 pr-24 text-xs text-white focus:outline-none focus:border-[#5865F2]/50 transition-all font-bold placeholder:text-white/10"
                                                onKeyDown={(e) => e.key === 'Enter' && addChannel()}
                                            />
                                            <button 
                                                onClick={addChannel}
                                                disabled={!newChannelId}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg bg-[#5865F2] text-white font-black uppercase tracking-widest text-[8px] hover:scale-105 transition-all disabled:opacity-0"
                                            >
                                                Add
                                            </button>
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
                                            disabled={!guildId || isConnecting}
                                            className="flex-[2] h-14 bg-[#5865F2] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(88,101,242,0.2)] flex items-center justify-center gap-2"
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4" />
                                                    Sync Server
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2rem] bg-[#5865F2]/5 border border-[#5865F2]/10 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-[#5865F2]/10 flex items-center justify-center mb-4 border border-[#5865F2]/20">
                                            <CheckCircle2 className="w-8 h-8 text-[#5865F2]" />
                                        </div>
                                        <h4 className="text-xl font-black text-white mb-2">Discord is Linked</h4>
                                        <p className="text-xs text-white/40 leading-relaxed max-w-[240px]">
                                            Monitoring Server <span className="text-[#5865F2] font-bold">{guildId}</span> with <span className="text-[#5865F2] font-bold">{channels.length}</span> specific channels.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setStep(2)}
                                            className="w-full h-12 bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Manage Channel List
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
                                                This will permanently disconnect Discord and stop all message syncing.
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
