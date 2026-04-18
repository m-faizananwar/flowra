"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MetaballBackground from "@/components/MetaballBackground";
import FlowLoader from "@/components/Loader";

/* ─── Activity Feed Item ─── */
function ActivityItem({ ev, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * i, duration: 0.5 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: "12px"
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${ev.color}15`,
        border: `1px solid ${ev.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        {ev.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>{ev.title}</div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{ev.desc}</div>
      </div>
      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{ev.time}</div>
    </motion.div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ title, value, subtext, color, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="glass-card"
      style={{
        padding: "24px",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: "240px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color
        }}>
          {icon}
        </div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</div>
      </div>
      <div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.2rem", fontWeight: 600, color: "#fff", letterSpacing: "-1px" }}>{value}</div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{subtext}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const activities = [
    { title: "Jira Sync Complete", desc: "Board 'Sprint 12' perfectly matched with 42 commits.", time: "Just now", color: "#10B981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { title: "AI Verification Passed", desc: "PR #245 verified against ticket requirements.", time: "12m ago", color: "#8B5CF6", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> },
    { title: "New Integration Active", desc: "Slack bot 'Flowra-Notify' is now listening.", time: "1h ago", color: "#60A5FA", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { title: "Sprint Goal Risk", desc: "AI detected potential delay in PROJ-88 backend.", time: "3h ago", color: "#F59E0B", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m10.29 3.86 7.94 13.14a2 2 0 0 1-1.71 3H3.48a2 2 0 0 1-1.71-3l7.94-13.14a2 2 0 0 1 3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <FlowLoader
            key="dashboard-loader"
            word1="DA"
            word2="SH"
            onComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>

      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", position: "relative", overflowX: "hidden" }}>
        <MetaballBackground backgroundColor="#050505" color="#1A1A1A" dotCount={6} />
        
        {/* Navigation Sidebar-like top bar */}
        <header style={{ 
          position: "sticky", top: 0, zIndex: 100, 
          background: "rgba(5,5,5,0.7)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 40px", height: "80px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", letterSpacing: "-1px" }}>Flowra</div>
            </Link>
            <nav style={{ display: "flex", gap: 24 }}>
              {["Overview", "Board", "Teams", "Settings"].map((item) => (
                <a key={item} href="#" style={{ 
                  fontSize: "0.9rem", fontWeight: 600, color: item === "Overview" ? "#fff" : "rgba(255,255,255,0.4)", 
                  textDecoration: "none", transition: "color 0.2s" 
                }}>{item}</a>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: "99px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10B981" }}>SYNC ACTIVE</span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #8B5CF6)", border: "2px solid rgba(255,255,255,0.1)" }} />
          </div>
        </header>

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px" }}>
          {/* Header Section */}
          <div style={{ marginBottom: "40px" }}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-1.5px" }}
            >
              Welcome back, <span style={{ color: "rgba(255,255,255,0.5)" }}>Agile Maverick</span>
            </motion.h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 8, fontSize: "1.1rem" }}>Flowra AI has automated 12 tasks since your last login.</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: "40px" }}>
            <StatCard title="Board Accuracy" value="100%" subtext="Synced across 4 platforms" color="#10B981" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>} delay={0.1} />
            <StatCard title="Avg Sync Time" value="2.4s" subtext="Real-time event processing" color="#60A5FA" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} delay={0.2} />
            <StatCard title="Sprint Velocity" value="38" subtext="+12% from last week" color="#8B5CF6" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m11 17 2 2 4-4"/><path d="m11 12 2 2 4-4"/><path d="M5 21v-8"/><path d="M5 7V3"/><path d="m2 9 3-3 3 3"/><path d="m2 17 3-3 3 3"/></svg>} delay={0.3} />
            <StatCard title="Active Agents" value="6" subtext="Listening to Slack & GitHub" color="#F59E0B" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="m21 12-2-4H5l-2 4"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/><path d="M12 12V3"/><path d="M7 12V8"/><path d="M17 12V8"/></svg>} delay={0.4} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            {/* Main Preview Area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="glass-card"
              style={{ borderRadius: "32px", padding: "40px", minHeight: "500px", overflow: "hidden", position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.5rem", fontWeight: 600 }}>Active Sprint Board</h2>
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={{ padding: "8px 16px", borderRadius: "12px", background: "#fff", color: "#000", border: "none", fontSize: "0.85rem", fontWeight: 700 }}>Export</button>
                  <button style={{ padding: "8px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", fontWeight: 600 }}>Filter</button>
                </div>
              </div>
              
              {/* Kanban Mock */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                {["To Do", "In Progress", "Done"].map((col, idx) => (
                  <div key={col} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{col}</div>
                    {[1, 2].map((card) => (
                      <div key={card} style={{ 
                        padding: "20px", borderRadius: "20px", background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.05)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                      }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: idx === 2 ? "#10B981" : "#8B5CF6", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                          PROJ-{100 + idx * 5 + card}
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 400, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
                          {idx === 0 ? "Implement OAuth2.0 with Redux" : idx === 1 ? "Refactor Metaball shader for performance" : "Sync GitHub PRs to Jira board"}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                          <div style={{ display: "flex", gap: -8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#444", border: "2px solid #050505" }} />
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#666", border: "2px solid #050505", marginLeft: -8 }} />
                          </div>
                          {idx === 2 && (
                            <div style={{ fontSize: "0.7rem", color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              VERIFIED
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Decorative radial overlay */}
              <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
            </motion.div>

            {/* Sidebar Activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
                style={{ borderRadius: "24px", padding: "24px", flex: 1 }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
                  AI Signal Feed
                  <span style={{ color: "#10B981", cursor: "pointer" }}>Live</span>
                </div>
                {activities.map((ev, i) => (
                  <ActivityItem key={i} ev={ev} i={i} />
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card"
                style={{ borderRadius: "24px", padding: "24px", background: "linear-gradient(135deg, rgba(16,185,129,0.1), transparent)" }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>Suggested Action</div>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 16 }}>
                  Move <span style={{ color: "#fff", fontWeight: 700 }}>PROJ-102</span> to Done — commit verified against ticket requirements.
                </p>
                <button style={{ 
                  width: "100%", padding: "12px", borderRadius: "12px", background: "#10B981", 
                  color: "#fff", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" 
                }}>Approve Move</button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
