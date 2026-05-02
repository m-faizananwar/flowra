"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ExternalLink, Loader2, ShieldAlert, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ReactNode> = {
    risk_assessment: <ShieldAlert className="w-4 h-4 text-orange-400" />,
    member_evaluation: <Trophy className="w-4 h-4 text-[#24FF7C]" />,
    info: <Bell className="w-4 h-4 text-white/40" />,
};

const TYPE_ROUTE: Record<string, string> = {
    risk_assessment: "/triage",
    member_evaluation: "/performance",
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPanel() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(30);
            setNotifications(data || []);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("id", id);
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase
                .from("notifications")
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq("user_id", user.id)
                .eq("is_read", false);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } finally {
            setMarkingAll(false);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) await markAsRead(notification.id);
        const route = TYPE_ROUTE[notification.target_type || notification.type];
        if (route) {
            router.push(route);
            setOpen(false);
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => { setOpen((prev) => !prev); if (!open) loadNotifications(); }}
                className="relative p-2 text-white/40 hover:text-white transition-colors group"
            >
                <Bell className="w-6 h-6 stroke-[1.5px]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[#FF8A8A] rounded-full border-2 border-[#0A0B0D] flex items-center justify-center text-[9px] font-black text-black leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-3 w-[380px] bg-[#0F0F12] border border-white/10 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FF8A8A]/15 text-[#FF8A8A] text-[10px] font-black border border-[#FF8A8A]/20">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={markingAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                                    All read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 text-white/20 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32 gap-3">
                                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
                                <p className="text-[11px] text-white/20 font-black uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-3 text-center px-6">
                                <Bell className="w-8 h-8 text-white/10" />
                                <p className="text-xs text-white/25">No notifications yet. AI runs will appear here for approval.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "w-full text-left px-5 py-4 border-b border-white/[0.04] transition-all hover:bg-white/[0.03] flex items-start gap-3",
                                        !notification.is_read && "bg-white/[0.02]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5",
                                        !notification.is_read ? "bg-white/5 border-white/10" : "bg-transparent border-white/5 opacity-50"
                                    )}>
                                        {TYPE_ICON[notification.target_type || notification.type] ?? TYPE_ICON.info}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn("text-sm font-bold leading-tight", notification.is_read ? "text-white/40" : "text-white")}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-[#24FF7C] flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        {notification.body && (
                                            <p className="text-[11px] text-white/30 mt-1 leading-relaxed line-clamp-2">{notification.body}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] text-white/20">{timeAgo(notification.created_at)}</span>
                                            {TYPE_ROUTE[notification.target_type || notification.type] && (
                                                <span className="flex items-center gap-1 text-[10px] text-[#24FF7C]/60 font-bold">
                                                    <ExternalLink className="w-3 h-3" /> Review
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-white/5 text-center">
                            <p className="text-[10px] text-white/15 font-black uppercase tracking-widest">{notifications.length} total notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
