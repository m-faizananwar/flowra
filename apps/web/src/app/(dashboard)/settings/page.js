"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    Upload,
    Loader2,
    Trash2,
    Check,
    User,
    Mail,
    Shield,
    ChevronRight,
} from "lucide-react";
import { PageTransition, staggerContainer, staggerItem } from "@/components/animations/PageTransition";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const SectionCard = ({ children, className = "" }) => (
    <motion.div
        variants={staggerItem}
        className={`rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

const Field = ({ label, icon: Icon, children }) => (
    <div className="flex items-start gap-5 px-6 py-5 border-b border-white/[0.05] last:border-b-0">
        <div className="flex items-center gap-3 w-40 shrink-0 pt-1">
            {Icon && <Icon className="w-3.5 h-3.5 text-white/25" />}
            <label className="text-xs font-semibold text-white/40">
                {label}
            </label>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

export default function SettingsPage() {
    const [profile, setProfile] = useState({ full_name: "", email: "" });
    const [avatarUrl, setAvatarUrl] = useState(
        () => typeof window !== "undefined" ? localStorage.getItem("flowra_avatar_url") || null : null
    );
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [preview, setPreview] = useState(null);
    const [memberId, setMemberId] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    full_name: user.user_metadata?.full_name || "",
                    email: user.email || "",
                });
                const { data: members, error } = await supabase
                    .from("members")
                    .select("id, avatar_url")
                    .eq("user_id", user.id)
                    .order("updated_at", { ascending: false })
                    .limit(1);
                if (error) console.error("Failed to fetch member:", JSON.stringify(error));
                const member = members?.[0];
                if (member) {
                    setMemberId(member.id);
                    if (member.avatar_url) {
                        setAvatarUrl(member.avatar_url);
                        localStorage.setItem("flowra_avatar_url", member.avatar_url);
                    }
                }
            }
        };
        fetchUser();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
        if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); return; }
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
            localStorage.setItem("flowra_avatar_url", data.avatar_url);
            window.dispatchEvent(new Event("flowra_avatar_updated"));
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
        if (!confirm("Remove your profile photo?")) return;
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
            localStorage.removeItem("flowra_avatar_url");
            window.dispatchEvent(new Event("flowra_avatar_updated"));
        } catch (err) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await supabase.auth.updateUser({ data: { full_name: profile.full_name } });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    const initial = (profile.full_name || profile.email || "U").charAt(0).toUpperCase();
    const displayAvatar = preview || avatarUrl;

    return (
        <PageTransition pageTitle="Settings">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-2xl space-y-1 pb-20"
            >
                {/* ── Profile Photo ── */}
                <SectionCard>
                    <div className="px-6 pt-5 pb-1">
                        <p className="text-xs font-semibold text-white/30">Profile Photo</p>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-5">
                        {/* Avatar with hover overlay */}
                        <div className="relative shrink-0">
                            <motion.button
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 flex items-center justify-center text-white font-black text-2xl hover:border-white/25 transition-all duration-300 group"
                                disabled={uploading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                {displayAvatar ? (
                                    <Image src={displayAvatar} alt="" width={72} height={72} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="select-none">{initial}</span>
                                )}
                                {/* Camera overlay on hover */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </motion.button>

                            {/* Spinner ring when uploading */}
                            {uploading && (
                                <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-white/60 animate-spin pointer-events-none" />
                            )}
                        </div>

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

                        {/* Context-aware action buttons */}
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                {preview ? (
                                    <motion.div
                                        key="preview-actions"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center gap-2 flex-wrap"
                                    >
                                        <motion.button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/8 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-white/12 transition-all disabled:opacity-50"
                                            whileHover={{ scale: 1.03, y: -1 }}
                                            whileTap={{ scale: 0.96 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            {uploading ? "Uploading…" : "Confirm upload"}
                                        </motion.button>
                                        <motion.button
                                            onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                            className="px-4 py-2 rounded-lg text-white/40 text-[11px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] hover:bg-white/10 hover:text-white/70 hover:border-white/20 transition-all"
                                            whileHover={{ scale: 1.03, y: -1 }}
                                            whileTap={{ scale: 0.96 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                            Cancel
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle-actions"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center gap-2"
                                    >
                                        <motion.button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white/80 hover:border-white/20 transition-all"
                                            whileHover={{ scale: 1.03, y: -1 }}
                                            whileTap={{ scale: 0.96 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            Change photo
                                        </motion.button>
                                        {avatarUrl && (
                                            <motion.button
                                            onClick={handleRemove}
                                            disabled={uploading}
                                            className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-40"
                                            title="Remove photo"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <p className="text-[11px] text-white/20">JPG, PNG or GIF · max 5 MB</p>
                        </div>
                    </div>
                </SectionCard>

                {/* ── Identity ── */}
                <SectionCard>
                    <div className="px-6 pt-5 pb-1">
                        <p className="text-xs font-semibold text-white/30">Identity</p>
                    </div>

                    <Field label="Full Name" icon={User}>
                        <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            className="w-full bg-transparent text-sm font-medium text-white placeholder-white/20 outline-none border-b border-white/[0.08] focus:border-white/30 transition-colors duration-200 py-1 pb-1.5"
                            placeholder="Your name"
                        />
                    </Field>

                    <Field label="Email" icon={Mail}>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/45 truncate">{profile.email}</span>
                            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400/70 bg-emerald-400/[0.08] border border-emerald-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Shield className="w-2.5 h-2.5" />
                                Verified
                            </span>
                        </div>
                    </Field>

                    {/* Save row */}
                    <div className="px-6 py-4 flex justify-end border-t border-white/[0.05]">
                        <motion.button
                            onClick={handleSave}
                            disabled={saving}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-300 border disabled:opacity-50"
                            style={{
                                background: saved ? "rgba(36,255,124,0.08)" : "rgba(255,255,255,0.04)",
                                borderColor: saved ? "rgba(36,255,124,0.3)" : "rgba(255,255,255,0.1)",
                                color: saved ? "#24FF7C" : "rgba(255,255,255,0.5)",
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {saving ? (
                                    <motion.span key="spin" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    </motion.span>
                                ) : saved ? (
                                    <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                        <Check className="w-3.5 h-3.5" />
                                    </motion.span>
                                ) : null}
                            </AnimatePresence>
                            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
                        </motion.button>
                    </div>
                </SectionCard>

                {/* ── Danger Zone ── */}
                <SectionCard>
                    <div className="px-6 pt-5 pb-1">
                        <p className="text-xs font-semibold text-red-400/50">Danger Zone</p>
                    </div>
                    <div className="flex items-center justify-between px-6 py-5">
                        <div>
                            <p className="text-sm font-semibold text-white/50">Delete account</p>
                            <p className="text-[11px] text-white/25 mt-0.5">Permanently remove your data from Flowra.</p>
                        </div>
                        <motion.button
                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-red-400/50 border border-red-500/15 bg-red-500/[0.04] text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all"
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                            Delete
                            <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>
                </SectionCard>

            </motion.div>
        </PageTransition>
    );
}

