"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function RotatingText({
  prefix,
  words,
  className,
  wordClassName,
  align = "left",
  startDelay = 0,
  loop = true,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!loop || words.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [words.length, loop]);

  const currentItem = words[index];
  const currentText = typeof currentItem === "string" ? currentItem : currentItem.text;
  const currentClass = typeof currentItem === "string" ? wordClassName : currentItem.className;
  const letters = currentText.split("");

  const alignmentClass =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  const motionAlignClass =
    align === "center" ? "left-1/2 -translate-x-1/2" : align === "right" ? "right-0" : "left-0";

  return (
    <div className={cn("flex items-center gap-3 text-4xl font-black font-outfit uppercase italic tracking-tighter", alignmentClass, className)}>
      {prefix && <p className="m-0 text-black">{prefix}</p>}
      <div className="relative h-[1.2em] w-[600px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            className={cn("absolute top-0 whitespace-nowrap", currentClass, motionAlignClass)}
          >
            {letters.map((letter, i) => (
              <motion.span
                key={`${index}-${i}`}
                initial={{ opacity: 0, rotateX: -90, y: 10 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{
                  opacity: 0,
                  rotateX: 90,
                  y: -10,
                  transition: {
                    duration: 0.32,
                    ease: [0.55, 0.055, 0.675, 0.19],
                    delay: i * 0.04,
                  },
                }}
                transition={{
                  duration: 0.38,
                  ease: [0.175, 0.885, 0.32, 1.275],
                  delay: startDelay + i * 0.08,
                }}
                className="inline-block origin-[50%_50%_25px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
