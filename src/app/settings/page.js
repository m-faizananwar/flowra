"use client";

import { useState } from "react";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { cn } from "@/lib/utils";

const TABS = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <DashboardLayout>
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

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Tabs */}
                        <motion.div variants={staggerItem} className="lg:col-span-1 space-y-2">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all active:scale-[0.98] group",
                                            isActive 
                                                ? "bg-white/[0.06] border-white/10 text-[#24FF7C]" 
                                                : "bg-transparent border-transparent text-white/40 hover:bg-white/[0.03] hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon className={cn("w-4 h-4", isActive ? "text-[#24FF7C]" : "group-hover:text-white")} />
                                            <span className="text-[13px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#24FF7C] shadow-[0_0_10px_rgba(36,255,124,0.5)]" />}
                                    </button>
                                );
                            })}
                        </motion.div>

                        {/* Content Area */}
                        <motion.div variants={staggerItem} className="lg:col-span-3">
                            <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-10 relative overflow-hidden backdrop-blur-3xl min-h-[600px]">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#24FF7C]/5 blur-[120px] pointer-events-none" />
                                
                                <div className="max-w-2xl space-y-10 relative z-10">
                                    {/* Tab Heading */}
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">{activeTab} Details</h2>
                                        <p className="text-xs font-bold text-white/20">Manage your core account information and preferences.</p>
                                    </div>

                                    {/* Form Simulation */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#24FF7C] to-[#3B82F6] flex items-center justify-center text-black font-black text-2xl shadow-xl">
                                                    M
                                                </div>
                                                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#17181C] border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-lg active:scale-90">
                                                    <Camera className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-white mb-1">Display Avatar</p>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Recommended: 400x400px</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue="Faizan"
                                                    className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Display Name</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue="Lead Architect"
                                                    className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Contact Email</label>
                                            <input 
                                                type="email" 
                                                defaultValue="mh230@flowra.ai"
                                                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:border-[#24FF7C]/50 transition-all"
                                            />
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="pt-8 border-t border-white/[0.05]">
                                            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-red-500/[0.02] border border-red-500/10">
                                                <div>
                                                    <p className="text-[13px] font-black text-red-400 mb-1">Deactivate Account</p>
                                                    <p className="text-[10px] font-bold text-red-500/30 uppercase tracking-widest">Permanent extraction from workspace</p>
                                                </div>
                                                <button className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400/50 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                                    Initiate
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center gap-4 pt-10">
                                        <button className="flex items-center gap-2.5 px-8 h-12 rounded-2xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-[0_4px_20px_rgba(36,255,124,0.15)] active:scale-95 transition-all">
                                            <Save className="w-3.5 h-3.5 stroke-[3px]" />
                                            Update Parameters
                                        </button>
                                        <button className="px-8 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all">
                                            Discard Edits
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </PageTransition>
        </DashboardLayout>
    );
}
