"use client";

export default function GlassContainer({ children, className = "" }) {
  return (
    <div className={`glass-container gsap-reveal ${className}`}>
      {children}
    </div>
  );
}
