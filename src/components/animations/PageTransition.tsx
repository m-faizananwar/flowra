"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    pageTitle: string;
}

// Stagger animation variants for child elements
export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
} as const;

export const staggerItem = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 24,
        },
    },
};

export function PageTransition({ children, pageTitle }: PageTransitionProps) {
    return (
        <motion.div
            key={`page-${pageTitle}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

// Exportable card wrapper with entrance animation
export function AnimatedCard({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay,
                type: "spring",
                stiffness: 260,
                damping: 24,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
