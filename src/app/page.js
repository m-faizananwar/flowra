"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MetalButton from "@/components/MetalButton";
import MetaballBackground from "@/components/MetaballBackground";
import FlowLoader from "@/components/Loader";

/* ─── Shared slide section style ─── */
const slideSection = (bg, extra = {}) => ({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  background: bg,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  paddingTop: "120px",
  paddingBottom: "80px",
  paddingLeft: "clamp(24px, 5vw, 48px)",
  paddingRight: "clamp(24px, 5vw, 48px)",
  boxSizing: "border-box",
  ...extra,
});

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Integrations", href: "#integrations" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "95%", maxWidth: 1400 }}>
      <div
        style={{
          display: "flex", height: 72, alignItems: "center", justifyContent: "space-between",
          padding: "0 32px",
          background: scrolled ? "rgba(9,10,13,0.85)" : "rgba(9,10,13,0.6)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 9999,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          transition: "background 0.3s ease"
        }}
      >
        <div style={{ display: "flex", gap: 32, height: "100%", alignItems: "center" }}>
          {navItems.slice(0, 2).map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
          <Link href="/" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "#fff", letterSpacing: "-1px", textDecoration: "none" }}>
            Flowra
          </Link>
        </motion.div>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {navItems.slice(2).map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 + i * 0.15 }}
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", cursor: "pointer", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
            >
              {item.label}
            </motion.a>
          ))}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", transition: "color 0.2s" }}>
              Sign In
            </Link>
          </motion.div>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
            <Link href="/signup">
              <MetalButton enableShader={false} style={{ padding: "10px 24px", fontSize: 14 }}>
                Get Started
              </MetalButton>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section style={slideSection("#000", { color: "#fff", alignItems: "center", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle at center, #1a3b32 0%, transparent 60%)", filter: "blur(100px)", opacity: 0.6, pointerEvents: "none" }} />
      <motion.div initial={{ opacity: 0.4, x: -20 }} animate={{ opacity: 0.6, x: 20 }} transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ position: "absolute", top: "-30%", left: "-5%", width: 600, height: 900, background: "linear-gradient(135deg, transparent, #2d5e46, transparent)", filter: "blur(80px)", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "110px 110px", maskImage: "radial-gradient(ellipse at top left, black 50%, transparent 90%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 48, maxWidth: 900, marginBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 9999, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)" }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#10B981", fontWeight: 600, letterSpacing: "0.05em" }}>Now in Public Beta</span>
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3.5rem,7vw,6.8rem)", fontWeight: 500, letterSpacing: "-3px", lineHeight: 0.92, background: "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Automate your<br />Agile. Completely.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}
          style={{ maxWidth: 520, fontSize: "1.15rem", color: "#9CA3AF", lineHeight: 1.7, fontWeight: 400 }}>
          AI agents that monitor your commits, PRs, and team chat — then automatically keep Jira in perfect sync. Zero manual board shuffling.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.3 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/signup">
            <MetalButton enableShader={false} style={{ height: 60, padding: "0 36px", fontSize: "1.05rem" }}>
              Get Started Free
            </MetalButton>
          </Link>
          <a href="#how-it-works" style={{ textDecoration: "none" }}>
            <button style={{ height: 60, padding: "0 36px", fontSize: "1.05rem", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.background = "transparent"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Watch Demo
            </button>
          </a>
        </motion.div>
      </div>

      {/* Dashboard Preview */}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.6, ease: "circOut" }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1280 }}>
        <div style={{ position: "relative", width: "100%", borderRadius: "3rem", border: "1px solid rgba(255,255,255,0.06)", background: "#090909", padding: "48px", overflow: "hidden", minHeight: 500, boxShadow: "0 25px 50px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 500, color: "#fff" }}>Dashboard</div>
            <div style={{ display: "flex", gap: 12 }}>
              {["Overview", "Sprints", "Analytics"].map(tab => (
                <button key={tab} style={{ padding: "8px 20px", borderRadius: 9999, background: tab === "Overview" ? "rgba(243,244,246,1)" : "transparent", color: tab === "Overview" ? "#000" : "#6B7280", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{tab}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            <div style={{ gridColumn: "span 2", borderRadius: 36, background: "#101010", padding: 32, minHeight: 220, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #27272a, #101010)", opacity: 0.4 }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>Jira Sync Status</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3.8rem", fontWeight: 500, color: "#F3F4F6", letterSpacing: "-2px", lineHeight: 1 }}>100%</div>
                <div style={{ fontSize: 13, color: "#4B5563", marginTop: 8 }}>Board Accuracy</div>
                <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
                  {[{ v: "6", l: "Integrations" }, { v: "24/7", l: "Monitoring" }, { v: "< 30s", l: "Sync Time" }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 20, color: "#D1D5DB", fontWeight: 600 }}>{s.v}</div>
                      <div style={{ fontSize: 12, color: "#4B5563", marginTop: 4 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 36, background: "#101010", border: "1px solid rgba(255,255,255,0.04)", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
              <div style={{ fontSize: 14, color: "#52525B", marginBottom: 24 }}>Sprint Velocity</div>
              <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="48" stroke="#161616" strokeWidth="16" fill="none" />
                <circle cx="60" cy="60" r="48" stroke="#10B981" strokeWidth="16" fill="none" strokeDasharray="301" strokeDashoffset="75" strokeLinecap="round" />
                <circle cx="60" cy="60" r="48" stroke="#8B5CF6" strokeWidth="16" fill="none" strokeDasharray="301" strokeDashoffset="240" strokeLinecap="round" />
              </svg>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                {[{ c: "#10B981", l: "Completed", p: "75%" }, { c: "#8B5CF6", l: "In Review", p: "25%" }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: x.c }} />
                    <span style={{ flex: 1 }}>{x.l}</span>
                    <span style={{ color: "#9CA3AF" }}>{x.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        style={{ position: "relative", zIndex: 10, marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
      >
        <p style={{ color: "#4B5563", fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Trusted by agile teams everywhere</p>
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {["200+ Teams", "50K+ Tasks Synced", "99.9% Uptime", "4.9★ Rating"].map((stat) => (
            <span key={stat} style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontWeight: 600 }}>{stat}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: "01", color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", title: "Connect & Listen", desc: "Link Jira, GitHub, and your team chat (Slack, Discord, or Telegram). Flowra's AI agents run silently in the background, listening to every commit, PR, and standup message." },
    { num: "02", color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", title: "Verify with Proof", desc: "When a developer says \"Done with the API,\" Flowra checks GitHub for the actual commits and PRs — not just their word for it. Real proof of work, automatically." },
    { num: "03", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)", title: "Approve & Sync", desc: "Flowra suggests a card move on the dashboard. Your PM approves it with one click. Jira updates instantly, staying 100% accurate — zero overhead." },
  ];

  return (
    <section id="how-it-works" style={slideSection("#000", { color: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 1000, height: 1000, background: "radial-gradient(circle at center, rgba(139,92,246,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 800, height: 800, background: "radial-gradient(circle at center, rgba(52,211,153,0.04) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 64, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3rem,5vw,5.5rem)", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-3px", marginBottom: 24 }}>
            How Flowra<br />
            <span style={{ background: "linear-gradient(to right, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>works.</span>
          </h2>
          <p style={{ color: "#6B7280", fontSize: "1.2rem", lineHeight: 1.7, fontWeight: 500 }}>
            Three simple steps to eliminate the overhead of manual board updates and execute project synchronization in real-time.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }}
              style={{ position: "relative", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "40px 28px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", right: -16, top: -24, fontFamily: "'Outfit', sans-serif", fontSize: "14rem", fontWeight: 900, color: "rgba(255,255,255,0.015)", lineHeight: 1, pointerEvents: "none", userSelect: "none", zIndex: 0 }}>{step.num}</div>
              <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 9999, background: step.bg, border: `1px solid ${step.border}`, color: step.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
                  Step {["One", "Two", "Three"][i]}
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.8rem", fontWeight: 600, color: "#fff", marginBottom: 12, lineHeight: 1.2, letterSpacing: "-1px" }}>{step.title}</h3>
                <p style={{ color: "#9CA3AF", fontSize: "1rem", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
              <div style={{ marginTop: 32, height: 64, position: "relative", borderRadius: 12, background: "#050505", border: "1px solid rgba(255,255,255,0.08)", padding: 12, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", zIndex: 1 }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `${step.color}22`, filter: "blur(30px)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[1, 0.6, 0.4].map((w, j) => (
                    <div key={j} style={{ height: 3, width: `${w * 100}%`, background: `linear-gradient(to right, ${step.color}, transparent)`, borderRadius: 9999 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const feats = [
    { col: 2, title: "Agentic Signal Listening", desc: "Discord, Slack & Telegram bots monitoring standups for completion signals and task mentions. AI agents translate chat logs into Jira actions automatically.", visual: "dots" },
    { col: 1, title: "One-Click Approval", desc: "Approval-first sync — changes identified by Flowra are presented on a dashboard for one-click Jira updates. You stay in control.", visual: "bars" },
    { col: 1, title: "Enterprise Security", desc: "Secure OAuth 2.0 authentication with role-based access control. SOC 2 compliant infrastructure with end-to-end encryption.", visual: "shield" },
    { col: 2, title: "Source-of-Truth Verification", desc: "GitHub integration checking PRs, commits, and reviews. Technical audit verifying code meets Jira ticket requirements before marking tasks done.", visual: "rings" },
  ];

  return (
    <section id="features" style={slideSection("#FFFFFF", { color: "#000", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" })}>
      <MetaballBackground backgroundColor="#FFFFFF" color="#E5E7EB" dotCount={15} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 14, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Core Capabilities</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4.5rem)", fontWeight: 500, letterSpacing: "-3px", lineHeight: 1, color: "#000" }}>
            Engineered<br /><span style={{ color: "#9CA3AF" }}>for every sprint.</span>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, gridAutoRows: 300 }}>
          {feats.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
              whileHover={{ scale: 0.98 }}
              style={{ gridColumn: `span ${f.col}`, position: "relative", borderRadius: 28, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 4px 30px rgba(0,0,0,0.03)", padding: 32, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {f.visual === "bars" && (
                <div style={{ position: "absolute", inset: 0, top: 0, paddingTop: 48, display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 6, opacity: 0.3 }}>
                  {[...Array(12)].map((_, j) => (
                    <motion.div key={j} animate={{ height: ["20%", "70%", "30%", "60%", "20%"] }} transition={{ duration: 2, repeat: Infinity, delay: j * 0.1, ease: "easeInOut" }}
                      style={{ width: 14, background: "linear-gradient(to top, #10B981, #34D399)", borderRadius: 4, minHeight: 20 }} />
                  ))}
                </div>
              )}
              {f.visual === "shield" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                </div>
              )}
              {f.visual === "dots" && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "50%", marginTop: 40, padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, opacity: 0.5 }}>
                  {[...Array(16)].map((_, j) => (
                    <motion.div key={j} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: j * 0.2 }}
                      style={{ borderRadius: 6, background: j % 3 === 0 ? "#e5e7eb" : j % 5 === 0 ? "rgba(59,130,246,0.3)" : "rgba(29,78,216,0.1)" }} />
                  ))}
                </div>
              )}
              {f.visual === "rings" && (
                <div style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <div style={{ position: "relative", width: 160, height: 160 }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #e5e7eb" }} />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 14, borderRadius: "50%", borderTop: "2px solid #10B981", borderLeft: "2px solid transparent", borderRight: "2px solid transparent", borderBottom: "2px solid transparent" }} />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 28, borderRadius: "50%", borderBottom: "2px solid #60A5FA", borderRight: "2px solid transparent", borderTop: "2px solid transparent", borderLeft: "2px solid transparent" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.2em" }}>LIVE</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#000", marginTop: 4 }}>SYNC</span>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.4rem", fontWeight: 500, marginBottom: 10, color: "#000" }}>{f.title}</h3>
                <p style={{ color: "#6B7280", fontWeight: 500, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Built For Every Role ─── */
function UserRoles() {
  const roles = [
    {
      color: "oklch(0.7 0.15 160)",
      title: "Developers",
      desc: "Track GitHub PRs, commits, and chat activity without manual overhead. AI verification of completion claims against real codebase changes.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    },
    {
      color: "oklch(0.65 0.25 280)",
      title: "Project Managers",
      desc: "Dashboard-driven approvals of AI-suggested Jira card movements. Sprint velocity analytics and real-time team performance evaluation.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>
    },
    {
      color: "oklch(0.65 0.15 240)",
      title: "QA Engineers",
      desc: "End-to-end traceability connecting codebase updates with bug reports. Automated regression test tracking via Jira and codebase analysis.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v4.5A2.5 2.5 0 0 0 9.8 8L3.2 18.5A2 2 0 0 0 5 22h14a2 2 0 0 0 1.8-3.5L14.2 8A2.5 2.5 0 0 0 15 6.5V2" /><path d="M8.5 2h7" /><path d="M3.2 16h17.6" /></svg>
    },
  ];

  return (
    <section style={slideSection("#050505", { color: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
      <div style={{ position: "absolute", width: "80vw", height: "80vw", borderRadius: "50%", background: "radial-gradient(circle at center, oklch(0.3 0.1 240) 0%, transparent 60%)", filter: "blur(100px)", top: "10%", left: "50%", transform: "translateX(-50%)", zIndex: 0, opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 10, width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#A78BFA" }} />
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Role-Based Intelligence</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 500, letterSpacing: "-2px", marginBottom: 12 }}>
            Built for Every Role
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: 560 }}>Intelligent workflows tailored to every team member, ensuring 100% Jira-to-Code synchronization.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {roles.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15 }}
              className="glass-prism" style={{ "--color-1": r.color }}>
              <div className="glass-prism-icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontSize: "1rem", margin: 0 }}>{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Integrations ─── */
function Integrations() {
  const integrations = [
    { name: "Jira", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zm-4.67 4.65c-.01 2.4 1.95 4.35 4.35 4.36h1.78v1.7c0 2.4 1.95 4.35 4.35 4.35V7.5a.84.84 0 0 0-.84-.84H6.86zm-4.67 4.67c0 2.4 1.96 4.35 4.35 4.35h1.79v1.7c0 2.4 1.95 4.34 4.34 4.35V12.16a.84.84 0 0 0-.84-.84H2.19z"/></svg> },
    { name: "GitHub", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
    { name: "Slack", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg> },
    { name: "Discord", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg> },
    { name: "Telegram", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { name: "GitLab", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0527.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 6.9909l.0113.0088.0312.0237 5.16 3.8676 2.5518 1.9324 1.5533 1.1724a1.0085 1.0085 0 0 0 1.2197 0l1.5533-1.1724 2.5518-1.9324 5.1913-3.8913.0125-.01a6.0682 6.0682 0 0 0 2.0094-6.9897z"/></svg> },
  ];

  return (
    <section id="integrations" style={slideSection("#000", { color: "#fff", minHeight: "auto", paddingTop: 100, paddingBottom: 100 })}>
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60A5FA" }} />
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Integrations</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 500, letterSpacing: "-2px", lineHeight: 1 }}>
            Connects to your<br /><span style={{ color: "#6B7280" }}>existing stack.</span>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {integrations.map((int, i) => (
            <motion.div key={int.name} className="integration-logo" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              {int.icon}
              <span>{int.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "For small teams getting started with agile automation.",
      features: ["Up to 5 team members", "1 Jira project", "GitHub integration", "Basic analytics", "Community support"],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      desc: "For growing teams that need full automation power.",
      features: ["Unlimited team members", "Unlimited Jira projects", "All integrations (Slack, Discord, Telegram)", "Advanced analytics & reports", "Priority support", "Custom approval workflows"],
      cta: "Start Free Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For organizations with advanced security and compliance needs.",
      features: ["Everything in Pro", "SSO & SAML authentication", "SOC 2 compliance", "Dedicated account manager", "Custom SLAs", "On-premise deployment option"],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" style={slideSection("#050505", { color: "#fff" })}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Pricing</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4.5rem)", fontWeight: 500, letterSpacing: "-3px", lineHeight: 1, marginBottom: 20 }}>
            Simple, transparent<br /><span style={{ color: "#6B7280" }}>pricing.</span>
          </h2>
          <p style={{ color: "#6B7280", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto" }}>Start free. Scale as your team grows. No hidden fees.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className={`pricing-card ${plan.featured ? "pricing-card--featured" : "pricing-card--dark"}`}
            >
              {plan.featured && (
                <div style={{ position: "absolute", top: 20, right: 20, padding: "4px 14px", borderRadius: 9999, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 12, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.3rem", fontWeight: 600, color: "#fff", marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: "0.95rem", color: "#6B7280", fontWeight: 500 }}>{plan.period}</span>
                </div>
                <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.5 }}>{plan.desc}</p>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "#10B981" : "#6B7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", padding: "16px", borderRadius: 14, border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.15)",
                  background: plan.featured ? "#fff" : "transparent",
                  color: plan.featured ? "#000" : "#fff",
                  fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.3s",
                  fontFamily: "inherit"
                }}
                  onMouseEnter={(e) => { if (!plan.featured) { e.target.style.background = "rgba(255,255,255,0.05)"; } else { e.target.style.transform = "translateY(-2px)"; } }}
                  onMouseLeave={(e) => { if (!plan.featured) { e.target.style.background = "transparent"; } else { e.target.style.transform = "none"; } }}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section style={slideSection("#000", { color: "#fff", alignItems: "center", textAlign: "center", minHeight: "auto", paddingTop: 120, paddingBottom: 120 })}>
      <MetaballBackground backgroundColor="#000" color="#1a1a1a" dotCount={10} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(16,185,129,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10 }}>
        <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3rem,7vw,6rem)", fontWeight: 500, letterSpacing: "-4px", lineHeight: 0.9, marginBottom: 32 }}>
          Build More.<br /><span style={{ color: "#10B981" }}>Admin Less.</span>
        </motion.h2>
        <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ fontSize: "1.2rem", color: "#9CA3AF", maxWidth: 520, marginBottom: 48, lineHeight: 1.7 }}>
          Stop wasting time shuffling Kanban cards. Let Flowra handle the overhead of Agile synchronization while your team focuses on shipping.
        </motion.p>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/signup">
            <MetalButton enableShader={false} style={{ height: 64, padding: "0 40px", fontSize: "1.1rem" }}>
              Get Started Free →
            </MetalButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Resources: ["Documentation", "API Reference", "Status", "Community"],
    Legal: ["Privacy", "Terms", "Security"],
  };

  return (
    <footer className="footer">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>Flowra</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 280 }}>
              AI-powered Agile orchestration that eliminates the friction of manual project management.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{category}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((item) => (
                  <a key={item} href="#">{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>© 2026 Flowra. All rights reserved.</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <a key={social} href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main style={{ width: "100%", minHeight: "100vh", background: "#000", overflowX: "hidden", position: "relative" }}>
      {isLoading && (
        <FlowLoader
          key="entrance-loader"
          word1="FLO"
          word2="WRA"
          onComplete={() => setIsLoading(false)}
        />
      )}

      <Navbar />

      <div id="main-content">
        <Hero />
        <HowItWorks />
        <div id="features-section">
          <Features />
        </div>
        <UserRoles />
        <Integrations />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
