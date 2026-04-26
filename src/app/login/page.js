"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MetaballBackground from "@/components/MetaballBackground";
import FlowLoader from "@/components/Loader.jsx";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

/* ─── Live Activity Widget ─── */
function LiveActivityWidget() {
  const events = [
    { type: "sync", user: "Alex K.", action: "Closed API bug — Jira synced", time: "now", color: "#10B981" },
    { type: "pr",   user: "Sarah M.", action: "PR #214 merged → In Review", time: "1m",  color: "#60A5FA" },
    { type: "verify", user: "James T.", action: "Commit verified for PROJ-88", time: "3m",  color: "#A78BFA" },
    { type: "sync", user: "Priya R.", action: "Sprint velocity updated", time: "5m",  color: "#10B981" },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      {/* Mini Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{ borderRadius: 20, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", padding: "20px", marginBottom: 16, overflow: "hidden", position: "relative" }}
      >
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase" }}>Jira Board Sync</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 9999, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}
            />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#10B981" }}>LIVE</span>
          </div>
        </div>

        {/* Big stat */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.8rem", fontWeight: 600, color: "#111", letterSpacing: "-2px", lineHeight: 1 }}>100%</div>
          <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: 4 }}>Board Accuracy</div>
        </div>

        {/* Progress bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Completed", pct: 75, color: "#10B981" },
            { label: "In Review",  pct: 18, color: "#60A5FA" },
            { label: "Blocked",    pct: 7,  color: "#F59E0B" },
          ].map(({ label, pct, color }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#9CA3AF", marginBottom: 4, fontWeight: 500 }}>
                <span>{label}</span><span style={{ color: "#6B7280" }}>{pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 9999, background: "#f3f4f6", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 9999, background: color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Subtle glow */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)", pointerEvents: "none" }} />
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        style={{ borderRadius: 20, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 8px 40px rgba(0,0,0,0.06)", padding: "16px 20px" }}
      >
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>Recent Activity</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.12 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ev.color}12`, border: `1px solid ${ev.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {ev.type === "sync" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ev.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                )}
                {ev.type === "pr" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ev.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>
                )}
                {ev.type === "verify" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ev.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{ev.user}</div>
                <div style={{ fontSize: "0.68rem", color: "#9CA3AF", lineHeight: 1.4, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.action}</div>
              </div>
              <div style={{ fontSize: "0.65rem", color: "#D1D5DB", fontWeight: 600, flexShrink: 0, marginTop: 2 }}>{ev.time}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();
        
        if (profile?.onboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', data.user.id)
          .single();

        if (profile?.onboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Invalid login credentials";
      setError(errorMessage);
      setIsSubmitting(false);
      
      toast.error("Authentication Failed", {
        description: errorMessage,
        icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <FlowLoader
            key="login-loader"
            word1="FLO"
            word2="WRA"
            onComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>

      <div className="auth-page">
        {/* Brand Panel */}
        <div className="auth-brand-panel" style={{ background: "#FFFFFF" }}>
          <MetaballBackground backgroundColor="#FFFFFF" color="#E5E7EB" dotCount={8} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(16,185,129,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3rem", fontWeight: 700, color: "#111", letterSpacing: "-2px", lineHeight: 1 }}>
                Flowra
              </h1>
            </Link>
            <p style={{ color: "#6B7280", fontSize: "0.95rem", maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
              AI agents that keep your Jira board perfectly in sync — automatically.
            </p>

            <LiveActivityWidget />
          </motion.div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "60%", background: "radial-gradient(circle at top right, rgba(139,92,246,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="auth-form-card"
          >
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>
                Welcome back
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>
                Sign in to your Flowra account
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#EF4444", fontSize: "0.85rem", fontWeight: 500, marginBottom: 12 }}
              >
                {error}
              </motion.div>
            )}

            {/* OAuth Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="auth-oauth-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <button className="auth-oauth-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Continue with GitHub
              </button>
            </div>

            <div className="auth-divider">or</div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                    Password
                  </label>
                  <a href="#" style={{ fontSize: "0.8rem", color: "#10B981", textDecoration: "none", fontWeight: 500 }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "#000" }}
                    />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#10B981", textDecoration: "none", fontWeight: 600 }}>
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
