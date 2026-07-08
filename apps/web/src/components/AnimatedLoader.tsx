"use client";

import { motion } from "framer-motion";

interface AnimatedLoaderProps {
  fullScreen?: boolean;
}

export function AnimatedLoader({ fullScreen = false }: AnimatedLoaderProps) {
  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const loader = (
    <div className="relative flex items-center justify-center w-20 h-20">
      <motion.div
        variants={ringVariants}
        animate="animate"
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#24FF7C] border-r-[#24FF7C]/50"
      />
      <motion.div
        variants={ringVariants}
        animate="animate"
        className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#10B981] border-l-[#10B981]/50"
        style={{ animationDirection: "reverse" }}
      />
      <motion.div
        variants={ringVariants}
        animate="animate"
        className="absolute inset-5 rounded-full border border-transparent border-t-[#24FF7C]/30"
        style={{ animationDuration: "3s" }}
      />
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="w-3 h-3 rounded-full bg-[#24FF7C] shadow-[0_0_20px_rgba(36,255,124,0.8)]"
      />
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      >
        {loader}
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      {loader}
    </div>
  );
}
