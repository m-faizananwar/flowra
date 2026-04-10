"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MetalButton from "@/components/MetalButton";
import MetaballBackground from "@/components/MetaballBackground";
import TeamGallery from "@/components/TeamGallery";
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

/* ─── Team data ─── */
const team = [
  { name: "Muhammad Waleed", role: "Product Owner", num: "01", note: "Initial Sprint" },
  { name: "Furqan Basra", role: "Scrum Master", num: "02", note: "Initial Sprint" },
  { name: "Muhammad Anas", role: "QA Tester", num: "03", note: "Initial Sprint" },
  { name: "Faizan Anwar", role: "Developer", num: "04", note: "Initial Sprint" },
  { name: "Zarsham Waleed", role: "Developer", num: "05", note: "Initial Sprint" },
  { name: "Haleema Imran", role: "Developer", num: "06", note: "Initial Sprint" },
];

const rotationNote = "Scrum roles will rotate among members across the 3 required sprints.";

const metrics = [
  { role: "Developer", metric: "PRs, Commits, Code Reviews", source: "GitHub / GitLab" },
  { role: "Project Manager", metric: "Sprint Velocity, Blockers Cleared", source: "Jira / Slack" },
  { role: "Marketing", metric: "Campaign Updates, Deliveries", source: "Telegram / Drive" },
  { role: "QA / Tester", metric: "Defect Reports, Regression Tests", source: "Jira / Codebase" },
];

/* ─── Navbar ─── */
function Navbar() {
  const [menu, setMenu] = useState(null);
  const navItems = [
    { label: "Overview", href: "#overview" },
    { label: "Features", href: "#features" },
    { label: "Roles", href: "#roles" },
    { label: "Team", href: "#team" },
    { label: "Metrics", href: "#metrics" },
  ];

  return (
    <header style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "95%", maxWidth: 1400 }}>
      <div
        onMouseLeave={() => setMenu(null)}
        style={{ display: "flex", height: 72, alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(9,10,13,0.6)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
      >
        <div style={{ display: "flex", gap: 32, height: "100%", alignItems: "center" }}>
          {navItems.slice(0, 3).map((item, i) => (
            <motion.a 
              key={item.label} 
              href={item.href}
              initial={{ y: -40, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2 + i * 0.15 }}
              onMouseEnter={() => setMenu(item.label)}
              style={{ fontSize: 14, fontWeight: 500, color: menu === item.label ? "#fff" : "rgba(255,255,255,0.7)", cursor: "pointer", transition: "color 0.2s", textDecoration: "none" }}>
              {item.label}
            </motion.a>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Outfit', sans-serif", fontSize: "1.7rem", fontWeight: 700, color: "#fff", letterSpacing: "-1px" }}>
          Flowra
        </motion.div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navItems.slice(3).map((item, i) => (
            <motion.a 
              key={item.label} 
              href={item.href}
              initial={{ y: -20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.75 + i * 0.15 }}
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", cursor: "pointer", textDecoration: "none" }}>
              {item.label}
            </motion.a>
          ))}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
            <MetalButton variant="outline" background="#ffffff" style={{ padding: "8px 20px", fontSize: 14 }}>
              Group 3 ↗
            </MetalButton>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#000", { color: "#fff", alignItems: "center", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle at center, #1a3b32 0%, transparent 60%)", filter: "blur(100px)", opacity: 0.6, pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0.4, x: -20 }} animate={{ opacity: 0.6, x: 20 }} transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ position: "absolute", top: "-30%", left: "-5%", width: 600, height: 900, background: "linear-gradient(135deg, transparent, #2d5e46, transparent)", filter: "blur(80px)", opacity: 0.5, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "110px 110px", maskImage: "radial-gradient(ellipse at top left, black 50%, transparent 90%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 48, maxWidth: 900, marginBottom: 80 }}>
          <motion.h1
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3.5rem,7vw,6.8rem)", fontWeight: 500, letterSpacing: "-3px", lineHeight: 0.92, background: "linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Automate your<br />Agile. Completely.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}
            style={{ maxWidth: 480, fontSize: "1.15rem", color: "#9CA3AF", lineHeight: 1.7, fontWeight: 400 }}>
            Agentic Software Engineering Infrastructure. Powered by **Subagents of Flowra** that monitor development signals across chat and code to automate your entire SDLC.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.3 }}>
            <MetalButton enableShader={false} style={{ height: 60, padding: "0 36px", fontSize: "1.05rem" }}>
              Let&apos;s Start
            </MetalButton>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.6, ease: "circOut" }}
          style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1280 }}>
          <div style={{ position: "relative", width: "100%", borderRadius: "3rem", border: "1px solid rgba(255,255,255,0.06)", background: "#090909", padding: "48px", overflow: "hidden", minHeight: 500, boxShadow: "0 25px 50px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 500, color: "#fff" }}>Dashboard</div>
              <div style={{ display: "flex", gap: 12 }}>
                {["Overview", "Sprints", "Analytics"].map(tab => (
                  <button key={tab} style={{ padding: "8px 20px", borderRadius: 9999, background: tab === "Overview" ? "rgba(243,244,246,1)" : "transparent", color: tab === "Overview" ? "#000" : "#6B7280", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{tab}</button>
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
                    {[{ v: "6", l: "Integrations" }, { v: "15+", l: "User Stories" }, { v: "3", l: "Sprints" }].map(s => (
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
      </section>
    </div>
  );
}

/* ─── ScrollStory ─── */
function ScrollStory() {
  const steps = [
    { num: "01", color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", title: "Connect & Listen", desc: "Link Jira, GitHub, Slack, Discord and Telegram. Flowra's agents run silently in the background, listening to every commit, PR, and standup message." },
    { num: "02", color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", title: "Verify with Proof", desc: 'When a developer says "Done with the API," Flowra checks GitHub for the actual commits and PRs   not just their word for it. Real proof of work.' },
    { num: "03", color: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)", title: "Approve & Sync", desc: "Flowra suggests a card move on the dashboard. The PM approves it with one click. Jira updates instantly, staying 100% accurate   automatically." },
  ];

  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#000", { color: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 1000, height: 1000, background: "radial-gradient(circle at center, rgba(139,92,246,0.05) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 800, height: 800, background: "radial-gradient(circle at center, rgba(52,211,153,0.04) 0%, transparent 60%)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 64, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3rem,5vw,5.5rem)", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-3px", marginBottom: 24 }}>
              Agile moves<br />
              <span style={{ background: "linear-gradient(to right, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>differently.</span>
            </h2>
            <p style={{ color: "#6B7280", fontSize: "1.2rem", lineHeight: 1.7, fontWeight: 500 }}>
              We&apos;ve re-engineered how Agile state flows. Eliminate the overhead of manual board updates and execute project synchronization in real-time.
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
    </div>
  );
}

/* ─── Features ─── */
function Features() {
  const ref = useRef(null);
  const feats = [
    { col: 2, title: "Agentic Signal Listening", desc: "Discord, Slack & Telegram bots monitoring standups for 'Done' signals and task mentions. Subagents translate chat logs into Jira actions.", visual: "dots" },
    { col: 1, title: "Manager Approval", desc: "Approval-first sync   changes identified by Flowra are presented on a dashboard for one-click Jira updates.", visual: "bars" },
    { col: 1, title: "Technical Baseline", desc: "Mandatory baseline: Secure OAuth 2.0 Auth and persistent Database integration (PostgreSQL).", visual: "shield" },
    { col: 2, title: "Source-of-Truth Verification", desc: "GitHub integration checking PRs, commits, and reviews. Technical audit verifying code meets Jira ticket requirements.", visual: "rings" },
  ];

  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#FFFFFF", { color: "#000", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" })}>
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
          <div ref={ref} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, gridAutoRows: 300 }}>
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
    </div>
  );
}

/* ─── Team ─── */
function Team() {
  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#FFFFFF", { color: "#000", alignItems: "center" })}>
        <MetaballBackground backgroundColor="#FFFFFF" color="#f3f4f6" dotCount={8} />
        <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 style={{ fontFamily: "'Jura', sans-serif", fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 700, letterSpacing: "-3px", marginBottom: 12, textAlign: "center", color: "#000" }}>
              The <span style={{ color: "rgb(0, 132, 209)" }}>Orchestrators</span>
            </h2>
            <p style={{ textAlign: "center", color: "#666", fontSize: "1rem", fontWeight: 500, marginBottom: 32, maxWidth: 600, margin: "0 auto 40px" }}>
              {rotationNote}
            </p>
          </motion.div>
          <TeamGallery />
        </div>
      </section>
    </div>
  );
}

/* ─── Metrics ─── */
function Metrics() {
  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#FFFFFF", { color: "#000" })}>
        <MetaballBackground backgroundColor="#FFFFFF" color="#E5E7EB" dotCount={10} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#fff", marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6" }} />
              <span style={{ fontSize: 14, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Analytics</span>
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 500, letterSpacing: "-2px", color: "#000" }}>
              Performance<br /><span style={{ color: "#9CA3AF" }}>Metrics Matrix</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ background: "#FFFFFF", borderRadius: 28, border: "1px solid #f3f4f6", boxShadow: "0 4px 30px rgba(0,0,0,0.03)", padding: "40px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Role", "Metric Tracked", "Verification Source"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#10B981" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "18px 20px", fontWeight: 700, color: "#000" }}>{row.role}</td>
                    <td style={{ padding: "18px 20px", color: "#6B7280" }}>{row.metric}</td>
                    <td style={{ padding: "18px 20px", color: "#6B7280" }}>{row.source}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ─── User Roles ─── */
function UserRoles() {
  const roles = [
    {
      color: "oklch(0.7 0.15 160)",
      title: "Developers",
      desc: "Track GitHub PRs, commits, and Slack activity without manual overhead. AI verification of 'Done' claims against real codebase changes.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    },
    {
      color: "oklch(0.65 0.25 280)",
      title: "Project Managers",
      desc: "Dashboard-driven approvals of AI-suggested Jira card movements. Sprint velocity analytics and team performance evaluation.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>
    },
    {
      color: "oklch(0.65 0.15 240)",
      title: "QA Testers",
      desc: "End-to-end traceability connecting codebase updates with bug reports. Regression test tracking via Jira and codebase analysis.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v4.5A2.5 2.5 0 0 0 9.8 8L3.2 18.5A2 2 0 0 0 5 22h14a2 2 0 0 0 1.8-3.5L14.2 8A2.5 2.5 0 0 0 15 6.5V2" /><path d="M8.5 2h7" /><path d="M3.2 16h17.6" /></svg>
    },
  ];

  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#050505", { color: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
        <div style={{ position: "absolute", width: "80vw", height: "80vw", borderRadius: "50%", background: "radial-gradient(circle at center, oklch(0.3 0.1 240) 0%, transparent 60%)", filter: "blur(100px)", top: "10%", left: "50%", transform: "translateX(-50%)", zIndex: 0, opacity: 0.5, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 10, width: "100%" }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 500, letterSpacing: "-2px", marginBottom: 12 }}>
            3 Distinct User Roles
          </motion.h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", marginBottom: 56 }}>Our agentic infrastructure drives the workflow across distinct roles, ensuring 100% Jira-to-Code synchronization.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            <style>{`
              .glass-prism {
                position: relative; padding: 2.5rem; border-radius: 24px;
                background: oklch(from var(--color-1) 0.1 0.02 h / 0.3);
                backdrop-filter: blur(20px);
                border: 1px solid oklch(from var(--color-1) 0.9 0.05 h / 0.3);
                border-bottom-color: rgba(255,255,255,0.05);
                box-shadow: 0 30px 60px color-mix(in oklab, var(--color-1) 10%, black);
                transition: all 0.5s cubic-bezier(0.25,1,0.5,1);
                display: flex; flex-direction: column; align-items: flex-start;
              }
              .glass-prism:hover { transform: translateY(-10px) scale(1.02); border-color: oklch(from var(--color-1) 0.95 0.1 h / 0.6); }
              .glass-prism-icon {
                display: inline-flex; align-items: center; justify-content: center;
                width: 60px; height: 60px; border-radius: 14px; margin-bottom: 28px;
                background: oklch(from var(--color-1) 0.3 0.1 h / 0.3);
                color: oklch(from var(--color-1) 0.95 0.05 h);
                border: 1px solid oklch(from var(--color-1) 0.8 0.1 h / 0.5);
                box-shadow: 0 0 20px oklch(from var(--color-1) 0.5 0.1 h / 0.2);
              }
              .glass-prism h3 {
                font-family: 'Outfit', sans-serif; font-size: 1.7rem; font-weight: 500; margin-bottom: 14px;
                background: linear-gradient(135deg, oklch(from var(--color-1) 0.95 0.05 h), oklch(from var(--color-1) 0.7 0.1 h));
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                line-height: 1.1; letter-spacing: -1px;
              }
            `}</style>
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
    </div>
  );
}

/* ─── Execution ─── */
function Execution() {
  const cards = [
    {
      title: "Approval-First Sync",
      desc: "The Manager Dashboard stages AI-identified task completions. A single-click approval triggers an instant, secure synchronization with Jira, ensuring the board reflects reality.",
      tag: "Verification Hub",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
      color: "#10B981"
    },
    {
      title: "3-Phase Strategy",
      desc: "Foundations → Core Development → Refinement. Full traceability is maintained for every mid-project requirement change across all phases.",
      tag: "Execution Model",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>,
      color: "#60A5FA"
    },
    {
      title: "Technical Baseline",
      desc: "Persistent PostgreSQL integration for subagent state and secure OAuth 2.0 Identity Management for role-based access control.",
      tag: "Infrastructure",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>,
      color: "#8B5CF6"
    }
  ];

  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#FFFFFF", { color: "#000", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" })}>
        <MetaballBackground backgroundColor="#FFFFFF" color="#E5E7EB" dotCount={10} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: 13, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>Project Architecture</span>
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.5rem,4.5vw,4.8rem)", fontWeight: 500, letterSpacing: "-3px", lineHeight: 0.95, color: "#000" }}>
              Manager Orchestration<br /><span style={{ color: "#9CA3AF" }}>& Technical Baseline</span>
            </h2>
          </motion.div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, padding: "0 20px" }}>
            {cards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ position: "relative", borderRadius: 32, background: "#fff", border: "1px solid #f3f4f6", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${card.color}15, transparent 70%)` }} />
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${card.color}10`, color: card.color, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${card.color}20` }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: card.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{card.tag}</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.6rem", fontWeight: 500, color: "#000", marginBottom: 12, letterSpacing: "-0.5px" }}>{card.title}</h3>
                  <p style={{ color: "#6B7280", lineHeight: 1.6, fontSize: "0.95rem", margin: 0 }}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
            style={{ marginTop: 48, textAlign: "center", fontStyle: "italic", color: "#9CA3AF", fontSize: "0.9rem" }}>
            Ensuring 100% board accuracy through automated agentic verification.
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#030405", { color: "#fff", alignItems: "center", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" })}>
        <MetaballBackground backgroundColor="#030405" color="#333333" dotCount={12} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(16,185,129,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10 }}>
          <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(3rem,7vw,6.5rem)", fontWeight: 500, letterSpacing: "-4px", lineHeight: 0.9, marginBottom: 40 }}>
            Build More.<br /><span style={{ color: "#10B981" }}>Admin Less.</span>
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: "1.2rem", color: "#9CA3AF", maxWidth: 560, marginBottom: 56, lineHeight: 1.7 }}>
            Flowra turns the tedious &quot;Work about Work&quot; into an automated background process. Your team focuses on building. AI handles Agile synchronization.
          </motion.p>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <MetalButton enableShader={false} style={{ height: 72, padding: "0 48px", fontSize: "1.2rem" }}>
              Thank You   Q&amp;A ↗
            </MetalButton>
          </motion.div>
          <div style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {["Group 3", "Section C", "SE Project 2026"].map(tag => (
              <span key={tag} style={{ padding: "10px 24px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
          <div style={{ marginTop: 48, padding: "24px 40px", borderRadius: 24, border: "1px solid rgba(16,185,129,0.1)", background: "rgba(16,185,129,0.03)", maxWidth: 700 }}>
            <h4 style={{ color: "#10B981", fontSize: "1.1rem", fontWeight: 600, marginBottom: 12 }}>3-Phase Execution Strategy</h4>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", fontSize: "0.9rem", color: "#9CA3AF" }}>
              <div>• Phase 1: Foundations</div>
              <div>• Phase 2: Core Dev</div>
              <div>• Phase 3: Refinement</div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#6B7280", marginTop: 12 }}>Full traceability for mid-project requirement changes across all phases.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Thanks ─── */
function ThanksSlide() {
  return (
    <div style={{ height: "100%" }}>
      <section style={slideSection("#FFFFFF", { color: "#000", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" })}>
        <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ borderTop: "1.5px solid #b7b7bc", width: "100%" }}>
            <div style={{ width: "100%", paddingTop: "clamp(48px, 8vh, 120px)", paddingBottom: "clamp(24px, 5vh, 56px)", paddingLeft: "clamp(8px, 2vw, 24px)", paddingRight: "clamp(8px, 2vw, 24px)" }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}
              >
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.15rem, 2vw, 1.8rem)", fontWeight: 500, color: "#1f1f1f", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
                  Thank you for your time and attention.
                </p>
                <p style={{ marginTop: 10, fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)", color: "#5f6368", fontWeight: 500 }}>
                  We appreciate your support and feedback.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{ position: "relative", marginTop: "clamp(32px, 6vh, 64px)", height: "clamp(300px, 45vh, 520px)", width: "100%", maxWidth: 1200, marginLeft: "auto", marginRight: "auto", borderRadius: 32, overflow: "hidden", border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 12px 40px rgba(0,0,0,0.06)" }}
              >
                <MetaballBackground
                  color="#E5E7EB"
                  backgroundColor="#FFFFFF"
                  dotCount={14}
                />

                <div style={{ pointerEvents: "none", position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2.2rem, 7vw, 4.6rem)", fontWeight: 600, color: "#000000", letterSpacing: "-0.03em", textAlign: "center" }}>
                    Thank You
                  </h2>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main style={{ width: "100%", minHeight: "100vh", background: "#FFFFFF", overflowX: "hidden", position: "relative" }}>
      {isLoading && (
        <FlowLoader
          key="entrance-loader"
          word1="FLO"
          word2="WRA"
          onComplete={() => setIsLoading(false)}
        />
      )}

      {/* Navbar fixed */}
      <Navbar />

      <div id="overview">
        <Hero />
      </div>

      <ScrollStory />

      <div id="features">
        <Features />
      </div>

      <div id="roles">
        <UserRoles />
      </div>

      <div id="team">
        <Team />
      </div>

      <div id="metrics">
        <Metrics />
      </div>

      <Execution />

      <CTA />

      <ThanksSlide />
    </main>
  );
}
