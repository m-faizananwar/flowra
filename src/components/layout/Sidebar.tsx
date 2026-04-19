"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
    UserCircle,
    Zap,
    Bell,
    Home as HomeIcon,
    Table,
    CalendarClock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MENU_SECTIONS = [
    {
        title: "Home",
        items: [
            { icon: HomeIcon, label: "Overview", href: "/dashboard" },
        ]
    },
    {
        title: "Agile Orchestration",
        items: [
            { icon: WalletCards, label: "Jira Sync", href: "/jira", badge: "Live" },
            { icon: Activity, label: "PR Verification", href: "/pr" },
            { icon: Sparkles, label: "Audit Logs", href: "/audit" },
        ]
    },
    {
        title: "Connectivity",
        items: [
            { icon: PieChart, label: "Integrations", href: "/integrations" },
            { icon: Table, label: "Signals", href: "/signals" },
        ]
    },
    {
        title: "Intelligence & Data",
        items: [
            { icon: Gem, label: "Performance", href: "/performance" },
            { icon: PiggyBank, label: "Sprint Analytics", href: "/sprints" },
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

    return (
        <motion.aside 
            animate={{ width: isCollapsed ? 100 : 288 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
                "hidden lg:flex flex-col h-[calc(100vh-2rem)] bg-[#17181C] rounded-[2.5rem] relative overflow-hidden border border-white/5 shadow-2xl shadow-black/50 m-4 shrink-0 transition-colors",
                isCollapsed && "rounded-[1.5rem]"
            )}
        >
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header Profile Section */}
                    <div className={cn("p-7 pb-2", isCollapsed && "p-4")}>
                        <div className={cn("flex items-center justify-between mb-8", isCollapsed && "flex-col gap-6")}>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-full border-2 border-white/10 p-0.5 overflow-hidden">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10B981] to-[#3B82F6] flex items-center justify-center shadow-inner">
                                            <UserCircle className="w-7 h-7 text-white/80" />
                                        </div>
                                    </div>
                                    {!isCollapsed && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[3px] border-[#17181C]" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <h4 className="text-[14px] font-black text-white tracking-tight leading-none mb-1 uppercase">Faizan</h4>
                                        <div className="flex items-center gap-1 opacity-40">
                                            <div className="w-1 h-1 rounded-full bg-white" />
                                            <p className="text-[10px] text-white font-black uppercase tracking-wider">Lead Architect</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className={cn("flex items-center gap-1.5", isCollapsed && "flex-col")}>
                                <button 
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/20 active:scale-90 group relative"
                                >
                                    {isCollapsed ? <ChevronRight className="w-4 h-4 group-hover:text-white" /> : <ChevronLeft className="w-4 h-4 group-hover:text-white" />}
                                </button>
                                
                                <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/20 active:scale-90 relative group">
                                    <Bell className="w-4 h-4 group-hover:text-white" />
                                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#24FF7C] rounded-full border-2 border-[#17181C]" />
                                </button>
                            </div>
                        </div>

                        {/* ADVANCED Workspace Switcher */}
                        <div className="relative group">
                            <button className={cn(
                                "w-full flex items-center justify-between p-3.5 rounded-[1.25rem] bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all active:scale-[0.98]",
                                isCollapsed && "p-2 justify-center"
                            )}>
                                <div className="flex items-center gap-3">
                                    <motion.div 
                                        whileHover={{ rotate: [-5, 5, -5, 5, 0] }}
                                        className="w-8 h-8 rounded-lg bg-[#24FF7C] flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(36,255,124,0.3)] shrink-0"
                                    >
                                        F
                                    </motion.div>
                                    {!isCollapsed && (
                                        <div className="text-left">
                                            <span className="text-[13px] font-black text-white block leading-none mb-1">Flowra OS</span>
                                            <span className="text-[9px] font-black text-[#24FF7C]/40 uppercase tracking-widest leading-none">Primary Workspace</span>
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && <ChevronDown className="w-4 h-4 text-white/10 group-hover:text-white transition-all group-hover:translate-y-0.5" />}
                            </button>
                        </div>
                    </div>

                    <div className={cn("h-px bg-white/[0.04] mx-7 mt-6 mb-2", isCollapsed && "mx-4 mt-4")} />

                    {/* Navigation Regions */}
                    <div className={cn("flex-1 overflow-y-auto px-7 py-4 custom-scrollbar scrollbar-none", isCollapsed && "px-4")}>
                        {MENU_SECTIONS.map((section, idx) => (
                                <motion.div key={section.title} className={cn("space-y-1", idx > 0 && (isCollapsed ? "mt-6" : "mt-9"))}>
                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between px-2 mb-5">
                                            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] leading-none">
                                                {section.title}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            
                                            return (
                                                <Link key={item.label} href={item.href}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.02, x: 4 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className={cn(
                                                            "flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors duration-200 relative group overflow-hidden",
                                                            isCollapsed && "justify-center px-0",
                                                            isActive
                                                                ? "text-white bg-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                                                                : "text-white/30 hover:text-white hover:bg-white/[0.03]"
                                                        )}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-[#24FF7C]/5 to-transparent pointer-events-none" />
                                                        )}

                                                        <div className="flex items-center gap-3.5 relative z-10">
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="sidebar-pill"
                                                                    className={cn(
                                                                        "absolute -left-3.5 w-[3px] h-6 bg-[#24FF7C] rounded-r-full shadow-[0_0_15px_rgba(36,255,124,0.6)]",
                                                                        isCollapsed && "left-0"
                                                                    )}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                                />
                                                            )}
                                                            <item.icon className={cn("w-[20px] h-[20px] transition-colors shrink-0", isActive ? "text-[#24FF7C]" : "group-hover:text-white")} />
                                                            {!isCollapsed && (
                                                                <span className={cn("text-[14px] font-bold tracking-tight whitespace-nowrap", isActive ? "text-white" : "group-hover:text-white")}>
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
                                                                <span className="text-[10px] font-black text-black leading-none">
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
                    <div className={cn("p-5 pb-7 mt-auto", isCollapsed && "p-4 flex flex-col items-center")}>
                        {/* Special Triage Trigger */}
                        <button 
                            className={cn(
                                "w-full flex items-center gap-3.5 px-3.5 py-4 rounded-2xl bg-[#24FF7C]/5 border border-[#24FF7C]/10 mb-4 group transition-all hover:bg-[#24FF7C]/10 active:scale-[0.98]",
                                isCollapsed && "justify-center px-0 mb-4"
                            )}
                        >
                            <div className="w-8 h-8 rounded-xl bg-[#24FF7C] flex items-center justify-center shadow-[0_0_15px_rgba(36,255,124,0.3)] group-hover:scale-110 transition-transform shrink-0">
                                <Zap className="w-4 h-4 text-black stroke-[3px]" />
                            </div>
                            {!isCollapsed && (
                                <div className="text-left">
                                    <p className="text-[13px] font-black text-white leading-none mb-1 group-hover:text-[#24FF7C] transition-colors">TRIAGE HUB</p>
                                    <p className="text-[9px] font-black text-[#24FF7C]/40 uppercase tracking-widest leading-none">4 pending items</p>
                                </div>
                            )}
                        </button>

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
                                    <button className="mt-1 px-5 py-2.5 rounded-xl bg-white text-[#3D5AFE] text-[11px] font-black uppercase tracking-wider hover:bg-white/90 transition-colors shadow-lg">
                                        Upgrade Now
                                    </button>
                                </div>

                                {/* Crown Placeholder */}
                                <div className="absolute -top-6 -right-1 transform rotate-[15deg] group-hover:rotate-[25deg] group-hover:scale-110 transition-all duration-300 text-4xl select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                    👑
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Company Switcher Container */}
                        <div className={cn(
                            "flex items-center justify-between p-3 rounded-[1.25rem] bg-white/[0.04] border border-white/5 group hover:bg-white/[0.07] transition-all cursor-pointer w-full",
                            isCollapsed && "flex-col gap-4 p-2"
                        )}>
                            <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
                                <div className="w-9 h-9 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-xl ring-2 ring-white/5 shrink-0">
                                    <div className="text-[11px] font-black text-white italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">FLWR</div>
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-white tracking-tight leading-none mb-1">Flowra Inc.</span>
                                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Enterprise</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.aside>
    );
}
