"use client";

import { motion } from "framer-motion";

interface AnimatedLoaderProps {
  fullScreen?: boolean;
}

const logoPaths = [
  "M16 16C16 16 16 10 20 10C24 10 26 14 22 18C18 22 16 16 16 16Z",
  "M16 16C16 16 22 16 22 20C22 24 18 26 14 22C10 18 16 16 16 16Z",
  "M16 16C16 16 16 22 12 22C8 22 6 18 10 14C14 10 16 16 16 16Z",
  "M16 16C16 16 10 16 10 12C10 8 14 6 18 10C22 14 16 16 16 16Z",
];

function FlowraLogo() {
  return (
    <motion.svg
      width="48"
      height="48"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {logoPaths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="#24FF7C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.5, delay: i * 0.15, ease: "easeOut" },
            opacity: { duration: 0.4, delay: i * 0.15 },
          }}
          style={{ originX: "16px", originY: "16px" }}
        />
      ))}
      <motion.circle
        cx="16"
        cy="16"
        r="2.5"
        fill="#24FF7C"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 20 }}
        style={{ originX: "16px", originY: "16px" }}
      />
    </motion.svg>
  );
}

function OrbitingDot({
  radius,
  size,
  duration,
  delay,
  color = "#24FF7C",
}: {
  radius: number;
  size: number;
  duration: number;
  delay: number;
  color?: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ originX: "50%", originY: "50%", width: 0, height: 0, left: "50%", top: "50%" }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 ${size * 5}px ${color}, 0 0 ${size * 10}px ${color}40`,
          position: "absolute",
          left: radius - size / 2,
          top: -size / 2,
        }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.4, 0.8],
        }}
        transition={{
          duration: 2 + (delay % 3),
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.div>
  );
}

function LoaderInner() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Background aura */}
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(36,255,124,0.08) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer orbit ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid transparent",
          backgroundImage: "conic-gradient(from 0deg, transparent, #24FF7C30, transparent, #10B98120, transparent)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner glow ring */}
      <motion.div
        className="absolute w-16 h-16 rounded-full border border-[#24FF7C]/10"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      <OrbitingDot radius={46} size={2} duration={4.5} delay={0} color="#24FF7C" />
      <OrbitingDot radius={38} size={1.8} duration={3.8} delay={0.6} color="#10B981" />
      <OrbitingDot radius={30} size={1.5} duration={3.2} delay={1.2} color="#34D399" />
      <OrbitingDot radius={50} size={1.3} duration={5.2} delay={0.3} color="#24FF7C" />

      {/* Flowra logo */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        <FlowraLogo />
      </motion.div>
    </div>
  );
}

export function AnimatedLoader({ fullScreen = false }: AnimatedLoaderProps) {
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      >
        <LoaderInner />
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      <LoaderInner />
    </div>
  );
}
