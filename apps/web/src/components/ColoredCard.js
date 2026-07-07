"use client";

export default function ColoredCard({ accent = "green", children, className = "", style = {} }) {
  return (
    <div className={`colored-card accent-${accent} ${className}`} style={style}>
      {children}
    </div>
  );
}
