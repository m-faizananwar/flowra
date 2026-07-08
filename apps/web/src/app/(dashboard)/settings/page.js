"use client";

import { useState, useEffect, useRef } from "react";
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
    Terminal,
    Upload,
    Loader2,
    Trash2
} from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        full_name: "Loading...",
        email: "Loading...",
        display_name: "Lead Architect"
    });
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [memberId, setMemberId] = useState(null);

    useEffect(() => {
        const cached = localStorage.getItem('flowra_avatar_url');
        if (cached) setAvatarUrl(cached);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    full_name: user.user_metadata?.full_name || "Faizan",
                    email: user.email || "",
                    display_name: user.user_metadata?.display_name || "Lead Architect"
                });

                const { data: member, error } = await supabase
                    .from("members")
                    .select("id, avatar_url")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (error) {
                    console.error("Failed to fetch member:", error);
                }

                if (member) {
                    setMemberId(member.id);
                    if (member.avatar_url) {
                        setAvatarUrl(member.avatar_url);
                        localStorage.setItem('flowra_avatar_url', member.avatar_url);
                    }
                }
            }
        };
        fetchUser();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File must be under 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        const fileInput = fileInputRef.current;
        const file = fileInput?.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const formData = new FormData();
            formData.append("avatar", file);

            const res = await fetch("/api/profile/avatar", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setAvatarUrl(data.avatar_url);
            localStorage.setItem('flowra_avatar_url', data.avatar_url);
            setMemberId(data.member_id || memberId);
            setPreview(null);
            if (fileInput) fileInput.value = "";
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const res = await fetch("/api/profile/avatar", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setAvatarUrl(null);
            localStorage.removeItem('flowra_avatar_url');
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const initial = (profile.full_name || "U").charAt(0).toUpperCase();

    return (
        <PageTransition pageTitle="Settings">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-8 pb-12"
            >
                <div>
                    <h1 className="text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight italic">
                        SYSTEM CONFIG
                    </h1>
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Global workspace and account parameters</p>
                </div>

                <div className="max-w-5xl mx-auto w-full">
                    <motion.div variants={staggerItem}>
                        <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-10 relative overflow-hidden backdrop-blur-3xl min-h-[500px]">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#24FF7C]/5 blur-[120px] pointer-events-none" />
                            
                            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight italic uppercase text-[#24FF7C]">User Profile Details</h2>
                                    <p className="text-xs font-bold text-white/20">Your core account information and preferences.</p>
                                </div>

                                <div className="space-y-8">
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group">
                                        <div className="relative">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#24FF7C] to-[#3B82F6] flex items-center justify-center text-black font-black text-3xl shadow-[0_0_30px_rgba(36,255,124,0.2)] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                {preview ? (
                                                    <Image src={preview} alt="" width={80} height={80} className="w-full h-full object-cover" />
                                                ) : avatarUrl ? (
                                                    <Image src={avatarUrl} alt="" width={80} height={80} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initial}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#24FF7C] flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera className="w-3.5 h-3.5 text-black" />
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />

                                        <div className="flex flex-col gap-2">
                                            {preview ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="px-4 py-2 rounded-xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[#24FF7C]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {uploading ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Upload className="w-3.5 h-3.5" />
                                                        )}
                                                        {uploading ? "Uploading..." : "Save Avatar"}
                                                    </button>
                                                    <button
                                                        onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                        className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : avatarUrl ? (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[13px] font-black text-white mb-0">Identity Verified</p>
                                                    <button
                                                        onClick={handleRemove}
                                                        disabled={uploading}
                                                        className="text-red-400/60 hover:text-red-400 transition-colors"
                                                        title="Remove avatar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-[13px] font-black text-white mb-0">Add Photo</p>
                                            )}
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Click the avatar or camera icon to upload</p>
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
