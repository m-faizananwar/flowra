"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0A0B0D] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className="flex-1 min-w-0 relative overflow-y-auto h-screen">
                {/* Top fade for clean scrolling */}
                <motion.div 
                    animate={{ left: isCollapsed ? '7.5rem' : '20rem' }}
                    className="fixed top-0 right-0 h-8 bg-gradient-to-b from-[#0A0B0D] to-transparent z-20 pointer-events-none lg:block hidden" 
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="p-6 lg:p-10 w-full pb-24 lg:pb-10"
                    >
                        <Header userEmail="faizan@flowra.ai" />
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-1 left-4 right-4 h-20 bg-black/80 backdrop-blur-3xl border border-white/5 z-50 rounded-[2.5rem] flex items-center justify-around px-8 shadow-2xl">
                {/* Mobile nav items */}
            </div>
        </div>
    );
}
