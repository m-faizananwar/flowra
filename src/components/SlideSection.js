"use client";

export default function SlideSection({ id, theme = "dark", children }) {
  return (
    <section id={id} className="slide-section" data-theme={theme}>
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      {children}
    </section>
  );
}
