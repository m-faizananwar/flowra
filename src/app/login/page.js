"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MetaballBackground from "@/components/MetaballBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auth logic will be connected later
  };

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel" style={{ background: "#FFFFFF" }}>
        <MetaballBackground backgroundColor="#FFFFFF" color="#E5E7EB" dotCount={8} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(16,185,129,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3.5rem", fontWeight: 700, color: "#111", letterSpacing: "-2px", lineHeight: 1 }}>
              Flowra
            </h1>
          </Link>
          <p style={{ color: "#6B7280", fontSize: "1.1rem", maxWidth: 340, lineHeight: 1.6 }}>
            AI-powered Agile orchestration that keeps your Jira board perfectly in sync.
          </p>

          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 300 }}>
            {[
              { icon: "🔗", text: "Connect Jira, GitHub & Chat" },
              { icon: "🤖", text: "AI verifies task completion" },
              { icon: "✅", text: "One-click board sync" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f9fafb", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ color: "#6B7280", fontSize: "0.9rem", fontWeight: 500 }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
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
            <button type="submit" className="auth-submit" style={{ marginTop: 8 }}>
              Sign In
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
  );
}
