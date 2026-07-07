"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MetaballBackground from "@/components/MetaballBackground";
import FlowLoader from "@/components/Loader";
import { supabase } from "@/lib/supabase";

/* ─── Sprint Timeline Widget ─── */
function SprintWidget() {
  const integrations = [
    { name: "Jira", color: "#0052CC", abbr: "J" },
    { name: "GitHub", color: "#24292F", abbr: "GH" },
    { name: "Slack", color: "#4A154B", abbr: "SL" },
    { name: "Discord", color: "#5865F2", abbr: "DC" },
  ];

  const sprints = [
    { label: "Sprint 12", done: 18, total: 20, color: "#10B981" },
    { label: "Sprint 11", done: 15, total: 15, color: "#60A5FA" },
    { label: "Sprint 10", done: 12, total: 14, color: "#A78BFA" },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      {/* Connected Integrations Pill Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}
      >
        {integrations.map((int, i) => (
          <motion.div
            key={int.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 8px", borderRadius: 9999, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 5, background: int.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.45rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{int.abbr}</span>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>{int.name}</span>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
          </motion.div>
        ))}
      </motion.div>

      {/* Sprint Velocity Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        style={{ borderRadius: 20, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 8px 40px rgba(0,0,0,0.07)", padding: "20px", marginBottom: 14, position: "relative", overflow: "hidden" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#111", letterSpacing: "0.05em", textTransform: "uppercase" }}>Sprint Velocity</span>
          <span style={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500 }}>Last 3 sprints</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sprints.map(({ label, done, total, color }, i) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.73rem", fontWeight: 600, color: "#374151" }}>{label}</span>
                <span style={{ fontSize: "0.73rem", color: "#9CA3AF" }}>{done}/{total} tasks</span>
              </div>
              <div style={{ height: 8, borderRadius: 9999, background: "#f9fafb", overflow: "hidden", border: "1px solid #f3f4f6" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(done / total) * 100}%` }}
                  transition={{ delay: 0.9 + i * 0.15, duration: 0.9, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 9999, background: i === 0 ? `linear-gradient(to right, ${color}, ${color}bb)` : color, opacity: i === 0 ? 1 : 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "radial-gradient(circle, rgba(16,185,129,0.07), transparent 70%)", pointerEvents: "none" }} />
      </motion.div>

      {/* AI Suggestion Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        style={{ borderRadius: 20, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 8px 40px rgba(0,0,0,0.06)", padding: "16px 18px" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111", marginBottom: 4 }}>AI Suggestion Ready</div>
            <div style={{ fontSize: "0.7rem", color: "#9CA3AF", lineHeight: 1.5 }}>
              Move <span style={{ color: "#374151", fontWeight: 600 }}>PROJ-102</span> to Done — commit verified against ticket requirements.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={{ padding: "4px 12px", borderRadius: 8, background: "#10B981", color: "#fff", fontSize: "0.68rem", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
              <button style={{ padding: "4px 12px", borderRadius: 8, background: "#f9fafb", color: "#6B7280", fontSize: "0.68rem", fontWeight: 600, border: "1px solid #f3f4f6", cursor: "pointer", fontFamily: "inherit" }}>Skip</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Default name from email
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Redirect to verify-email
        router.push("/verify-email");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <FlowLoader
            key="signup-loader"
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
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 60%, rgba(139,92,246,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3rem", fontWeight: 700, color: "#111", letterSpacing: "-2px", lineHeight: 1 }}>
                Flowra
              </h1>
            </Link>
            <p style={{ color: "#6B7280", fontSize: "0.95rem", maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
              Join 200+ teams shipping faster with AI-powered Agile automation.
            </p>

            <SprintWidget />
          </motion.div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "60%", height: "60%", background: "radial-gradient(circle at bottom left, rgba(16,185,129,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="auth-form-card"
          >
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>
                Create your account
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>
                Start automating your Agile workflow in minutes
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#EF4444", fontSize: "0.85rem", fontWeight: 500 }}
              >
                {error}
              </motion.div>
            )}

            {/* OAuth Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="auth-oauth-btn" type="button" style={{ flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="auth-oauth-btn" type="button" style={{ flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>

            <div className="auth-divider">or</div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  Full Name
                </label>
                <input type="text" className="auth-input" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  Work Email
                </label>
                <input type="email" className="auth-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                  Confirm Password
                </label>
                <input type="password" className="auth-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <div style={{ position: "relative", width: 20, height: 20, flexShrink: 0, marginTop: 2 }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                    required
                  />
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    border: `1px solid ${agreedToTerms ? "#10B981" : "rgba(255,255,255,0.15)"}`,
                    background: agreedToTerms ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s"
                  }}>
                    {agreedToTerms && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <a href="#" style={{ color: "#10B981", textDecoration: "none" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "#10B981", textDecoration: "none" }}>Privacy Policy</a>
                </span>
              </label>

              <button type="submit" className="auth-submit" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "#000" }}
                    />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#10B981", textDecoration: "none", fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
