"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    User, 
    Shield, 
    Bell, 
    Globe, 
    Database, 
    Zap, 
    Save, 
    ChevronRight, 
    Camera,
    CreditCard,
    Terminal
} from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        full_name: "Loading...",
        email: "Loading...",
        display_name: "Lead Architect"
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    full_name: user.user_metadata?.full_name || "Faizan",
                    email: user.email || "",
                    display_name: user.user_metadata?.display_name || "Lead Architect"
                });
            }
        };
        fetchUser();
    }, []);

    const initial = profile.full_name.charAt(0).toUpperCase();

    return (
        <PageTransition pageTitle="Settings">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                        SYSTEM CONFIG
                    </h1>
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Global workspace and account parameters</p>
                </div>

                <div className="max-w-5xl mx-auto w-full">
                    {/* Content Area */}
                    <motion.div variants={staggerItem}>
                        <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-10 relative overflow-hidden backdrop-blur-3xl min-h-[500px]">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#24FF7C]/5 blur-[120px] pointer-events-none" />
                            
                            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
                                {/* Tab Heading */}
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight italic uppercase text-[#24FF7C]">User Profile Details</h2>
                                    <p className="text-xs font-bold text-white/20">Your core account information and preferences.</p>
                                </div>

                                {/* Profile Display */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#24FF7C] to-[#3B82F6] flex items-center justify-center text-black font-black text-3xl shadow-[0_0_30px_rgba(36,255,124,0.2)]">
                                                {initial}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-white mb-1">Identity Verified</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Workspace Member</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                            <div className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 flex items-center text-sm font-bold text-white">
                                                {profile.full_name}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Contact Email</label>
                                            <div className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 flex items-center text-sm font-bold text-white">
                                                {profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </PageTransition>
    );
}
