"use client";

import React, { useState, useEffect } from "react";
import FlowLoader from "./Loader";

const LoaderWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // We use a small delay or GSAP's onComplete to hide the loader
  const handleComplete = () => {
    // We can add a small fade out here if needed, 
    // but the GSAP timeline already handles the transition to the full screen image.
    // We just need to make sure the content underneath is ready.
    setTimeout(() => {
      setLoading(false);
    }, 500); // Small buffer
  };

  return (
    <>
      {loading && <FlowLoader onComplete={handleComplete} />}
      <main id="main-content" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </>
  );
};

export default LoaderWrapper;
