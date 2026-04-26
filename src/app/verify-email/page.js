"use client";

import { motion } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight, RefreshCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import MetaballBackground from "@/components/MetaballBackground";

/* ─── Verification Pulse Widget ─── */
function VerificationPulseWidget() {
  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      {/* Node Status Pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          padding: "6px 16px", 
          borderRadius: 9999, 
          background: "#fff", 
          border: "1px solid #f3f4f6", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          width: "fit-content",
          marginBottom: 16
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Node Heartbeat Active</span>
      </motion.div>

      {/* Syncing Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ 
          borderRadius: 24, 
          background: "#fff", 
          border: "1px solid #f3f4f6", 
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)", 
          padding: "24px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="flex items-center justify-between mb-6">
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>Neural Sync</span>
            <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366F1" }}
                    />
                ))}
            </div>
        </div>

        <div className="space-y-5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Email Handshake</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#10B981" }}>Sent</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Activation Key</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#F59E0B" }}>Waiting</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-full w-1/3 bg-amber-400"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)", pointerEvents: "none" }} />
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel" style={{ background: "#FFFFFF" }}>
        <MetaballBackground backgroundColor="#FFFFFF" color="#f3f4f6" dotCount={10} />
        
        <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VerificationPulseWidget />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-[2px] bg-indigo-500/20" />
                    <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.2em" }}>Security Protocol</span>
                    <div className="w-8 h-[2px] bg-indigo-500/20" />
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
                    Securing your project node.
                </h2>
            </motion.div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "60%", height: "60%", background: "radial-gradient(circle at bottom left, rgba(99,102,241,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="auth-form-card"
        >
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 12, lineHeight: 1.1 }}>
                Please check <br /><span className="text-indigo-400">your email</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", lineHeight: 1.6 }}>
                We've sent a synchronization link to your inbox. Please click the link to activate your high-performance workspace.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div style={{ padding: "24px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>Link Dispatched</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Terminal: Secure Email Relay</div>
                    </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                    "The final step in establishing your neural link for automated Agile orchestration."
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Link href="/login" className="w-full">
                    <button className="auth-submit" style={{ background: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        Go to Sign In
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </Link>

                <button 
                  className="auth-oauth-btn" 
                  style={{ width: "100%", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <RefreshCcw className="w-4 h-4 text-white/40" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Resend synchronization link</span>
                </button>
            </div>
            
            <p className="text-center" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}>
                Didn't get the email? Check your spam folder or contact <a href="mailto:support@flowra.ai" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>support@flowra.ai</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
