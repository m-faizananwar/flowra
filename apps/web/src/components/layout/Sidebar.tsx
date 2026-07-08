"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    PieChart,
    WalletCards,
    History,
    Sparkles,
    Gem,
    PiggyBank,
    HandCoins,
    Calculator,
    Settings,
    Activity,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Zap,
    Home as HomeIcon,
    Table,
    CalendarClock,
    LayoutGrid,
    Puzzle,
    Target,
    AreaChart,
    LogOut,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const MENU_SECTIONS = [
    {
        title: "Workspace",
        items: [
            { icon: HomeIcon, label: "Overview", href: "/dashboard" },
            { icon: LayoutGrid, label: "Jira Sync", href: "/jira", badge: "Live" },
            { icon: Puzzle, label: "Integrations", href: "/integrations" },
        ]
    },
    {
        title: "Intelligence & Data",
        items: [
            { icon: Target, label: "Performance", href: "/performance" },
            { icon: AlertTriangle, label: "Risk Assessment", href: "/risk" },
            { icon: AreaChart, label: "Sprint Analytics", href: "/sprints" },
        ]
    },
    {
        title: "System",
        items: [
            { icon: Settings, label: "Settings", href: "/settings" },
        ]
    }
];

export function Sidebar({ 
    isCollapsed, 
    setIsCollapsed 
}: { 
    isCollapsed: boolean; 
    setIsCollapsed: (v: boolean) => void 
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<{ email?: string; name?: string }>({});
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        () => typeof window !== 'undefined' ? localStorage.getItem('flowra_avatar_url') || null : null
    );
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear local bypasses as well
        localStorage.removeItem('flowra_onboarding_bypass');
        router.push("/login");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserData({
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0]
                });
                const { data: members } = await supabase
                    .from("members")
                    .select("avatar_url")
                    .eq("user_id", user.id)
                    .order("updated_at", { ascending: false })
                    .limit(1);
                const member = members?.[0];
                if (member?.avatar_url) {
                    setAvatarUrl(member.avatar_url);
                    localStorage.setItem('flowra_avatar_url', member.avatar_url);
                }
            }
        };
        fetchUser();

        const handleAvatarUpdate = () => {
            setAvatarUrl(localStorage.getItem('flowra_avatar_url'));
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'flowra_avatar_url') {
                handleAvatarUpdate();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('flowra_avatar_updated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('flowra_avatar_updated', handleAvatarUpdate);
        };
    }, []);

    return (
        <motion.aside 
            animate={{ width: isCollapsed ? 100 : 288 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
                "hidden lg:flex flex-col h-[calc(100vh-2rem)] bg-white/85 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden border border-gray-200/50 shadow-xl shadow-gray-200/30 m-4 shrink-0 transition-colors",
                isCollapsed && "rounded-[1.5rem]"
            )}
        >
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-400/[0.15] blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className={cn("p-7 pb-2", isCollapsed && "p-4")}
                    >
                        <div className={cn("flex items-center justify-between mb-8", isCollapsed && "flex-col gap-6")}>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-full border-2 border-gray-200 p-0.5 overflow-hidden">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10B981] to-[#3B82F6] flex items-center justify-center shadow-inner overflow-hidden">
                                            {avatarUrl ? (
                                                <Image src={avatarUrl} alt="" width={44} height={44} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-black text-lg">{(userData.name || "U").charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                    {!isCollapsed && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[3px] border-white" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="min-w-0"
                                    >
                                        <h4 className="text-[14px] font-bold text-gray-900 tracking-tight leading-none mb-1 truncate">
                                            {userData.name || "User"}
                                        </h4>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                                            <p className="text-[10px] text-gray-500 font-semibold tracking-wider truncate">
                                                {userData.name ? "Node Active" : "Initializing..."}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className={cn("flex items-center gap-2 shrink-0 ml-4", isCollapsed && "flex-col ml-0")}>
                                <button 
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 hover:border-[#24FF7C]/50 transition-all text-gray-700 group shadow-sm"
                                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                                >
                                    <motion.div
                                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-[#24FF7C]" />
                                    </motion.div>
                                </button>
                            </div>
                        </div>

                        {/* ADVANCED Workspace Switcher */}
                        <div className="relative group">
                            <button className={cn(
                                "w-full flex items-center justify-between p-3.5 rounded-[1.25rem] bg-gray-900 shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98]",
                                isCollapsed && "p-2 justify-center"
                            )}>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#24FF7C]/10 to-transparent pointer-events-none rounded-[1.25rem]" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <motion.div 
                                        whileHover={{ rotate: [-5, 5, -5, 5, 0] }}
                                        className="w-8 h-8 rounded-lg bg-[#24FF7C] flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-[0_0_12px_rgba(36,255,124,0.5)]"
                                    >
                                        F
                                    </motion.div>
                                    {!isCollapsed && (
                                        <div className="text-left">
                                    <span className="text-[13px] font-semibold text-white block leading-none mb-1">Flowra OS</span>
                                    <span className="text-[9px] font-semibold text-[#24FF7C]/90 uppercase tracking-widest leading-none">Primary Workspace</span>
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-all group-hover:translate-y-0.5 relative z-10" />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={cn("h-px bg-gray-200 mx-7 mt-6 mb-2 origin-left", isCollapsed && "mx-4 mt-4")}
                    />

                    {/* Navigation Regions */}
                    <div className={cn("flex-1 overflow-y-auto px-7 py-4 custom-scrollbar scrollbar-none", isCollapsed && "px-4")}>
                        {MENU_SECTIONS.map((section, idx) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 25 }}
                                    className={cn("space-y-1", idx > 0 && (isCollapsed ? "mt-6" : "mt-9"))}
                                >
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.08 + 0.05 }}
                                            className="flex items-center justify-between px-2 mb-5"
                                        >
                                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] leading-none">
                                                {section.title}
                                            </span>
                                        </motion.div>
                                    )}

                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            
                                            return (
                                                <Link key={item.label} href={item.href}>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02, x: 4 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            initial={{ opacity: 0, x: -12 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.08 + 0.15, type: "spring", stiffness: 260, damping: 24 }}
                                                            className={cn(
                                                                "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                                                                isCollapsed && "justify-center px-0",
                                                                isActive
                                                                        ? "bg-gray-900 shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
                                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                                                            )}
                                                        >
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-gradient-to-r from-[#24FF7C]/25 to-transparent pointer-events-none" />
                                                            )}

                                                            <div className="flex items-center gap-3.5 relative z-10">
                                                                {isActive && (
                                                                    <motion.div
                                                                        layoutId="sidebar-pill"
                                                                        className={cn(
                                                                            "absolute -left-3.5 w-[3px] h-7 bg-[#24FF7C] rounded-r-full shadow-[0_0_20px_rgba(36,255,124,0.9)]",
                                                                            isCollapsed && "left-0"
                                                                        )}
                                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                                    />
                                                                )}
                                                                <item.icon className={cn("w-[21px] h-[21px] transition-all shrink-0", isActive ? "text-[#24FF7C] drop-shadow-[0_0_12px_rgba(36,255,124,0.7)]" : "group-hover:text-gray-900")} />
                                                                {!isCollapsed && (
                                                                    <span className={cn("text-[14px] font-semibold tracking-tight whitespace-nowrap transition-colors", isActive ? "text-white" : "group-hover:text-gray-900")}>
                                                                        {item.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        
                                                        {!isCollapsed && item.badge && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                                                className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#24FF7C] flex items-center justify-center shadow-[0_0_10px_rgba(36,255,124,0.2)]"
                                                            >
                                                                <span className="text-[10px] font-bold text-black leading-none">
                                                                    {item.badge}
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                        ))}
                    </div>

                    {/* Footer Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 25 }}
                        className={cn("p-5 pb-7 mt-auto", isCollapsed && "p-4 flex flex-col items-center")}
                    >

                        {/* Floating Upgrade Card */}
                        {!isCollapsed && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-[#4F6EF7] to-[#3D5AFE] group cursor-pointer shadow-xl active:scale-[0.98] transition-transform duration-200 mb-5"
                            >
                                {/* Animated Background Highlights */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-[40px] group-hover:scale-125 transition-transform duration-500" />
                                
                                <div className="relative z-10 flex flex-col gap-2.5 items-center text-center">
                                    <p className="text-[13px] font-bold text-white leading-relaxed px-2">
                                        Upgrade to <span className="underline decoration-white/40 underline-offset-4 decoration-2">Pro</span> for getting all features
                                    </p>
                                    <button className="mt-1 px-5 py-2.5 rounded-xl bg-white text-[#3D5AFE] text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-colors shadow-lg">
                                        Upgrade Now
                                    </button>
                                </div>

                                {/* Crown Placeholder */}
                                <div className="absolute -top-6 -right-1 transform rotate-[15deg] group-hover:rotate-[25deg] group-hover:scale-110 transition-all duration-300 text-4xl select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                    👑
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Company Switcher & Logout Container */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="relative w-full">
                            <div className={cn(
                                "flex items-center justify-between p-3 rounded-[1.25rem] bg-gray-50 border border-gray-200 group hover:bg-gray-100 transition-all cursor-pointer w-full",
                                isCollapsed && "flex-col gap-4 p-2"
                            )}
                                onClick={() => setIsProfileMenuOpen((v) => !v)}
                            >
                                <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
                                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-gray-100 shrink-0">
                                        <div className="text-[11px] font-semibold text-gray-500 tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">FLWR</div>
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-gray-900 tracking-tight leading-none mb-1">Flowra Inc.</span>
                                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Enterprise</span>
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileMenuOpen && "rotate-180")} />
                                )}
                            </div>
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className={cn(
                                                "absolute z-50 mb-2 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden",
                                                isCollapsed ? "left-1/2 -translate-x-1/2 w-40" : "right-0 w-44"
                                            )}
                                            style={{ bottom: "100%" }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[11px] font-bold uppercase tracking-widest"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.aside>
    );
}
