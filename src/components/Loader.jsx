"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const FlowLoader = ({ onComplete, word1 = "FLO", word2 = "WRA" }) => {
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const rimRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const loader = loaderRef.current;
    const rim = rimRef.current;
    if (!container || !loader) return;

    let ctx = gsap.context(() => {
      const loadingLetters = container.querySelectorAll(".willem__letter");
      const headingStart = container.querySelector(".willem__h1-start");
      const headingEnd = container.querySelector(".willem__h1-end");
      const mainContent = document.querySelector("#main-content");

      /* GSAP Timeline */
      const tl = gsap.timeline({
        defaults: {
          ease: "power4.inOut",
        },
        onStart: () => {
          container.classList.remove('is--hidden');
          // Force the page TO THE TOP
          window.scrollTo(0, 0);
          document.body.style.overflow = "hidden";
        },
        onComplete: () => {
          document.body.style.overflow = "";
          if (onComplete) onComplete();
        }
      });

      timelineRef.current = tl;

      /* 1. Initial Styles (Scale from TOP to reveal Hero) */
      if (mainContent) {
        gsap.set(mainContent, { 
          scale: 0.8, // Slightly tighter zoom for speed
          opacity: 0, 
          transformOrigin: "center top" 
        });
      }
      gsap.set(loader, { "--portal-radius": "0%" });
      if (rim) gsap.set(rim, { opacity: 0 });

      /* 2. Brand Reveal (Snappier Letters Reveal) */
      tl.from(loadingLetters, {
        yPercent: 100,
        stagger: 0.05,
        duration: 0.8,
      });

      /* 3. HIGH-SPEED DARK GREEN PORTAL Reveal */
      // Duration reduced from 2.5s to 1.2s for snappier feel
      tl.to(loader, {
        "--portal-radius": "150%",
        duration: 1.2,
        ease: "power4.in" // Use 'in' ease for initial velocity
      }, "+=0.1"); // Shorter pause

      if (rim) {
        tl.to(rim, {
          opacity: 1,
          duration: 0.3,
        }, "<");
        
        tl.to(rim, {
          opacity: 0,
          duration: 0.3,
        }, ">-0.4");
      }

      if (mainContent) {
        tl.to(mainContent, {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power4.inOut"
        }, "<"); // Perfect sync with portal growth
      }

      /* 4. Branding Disperse (Sync with High-Speed expansion) */
      tl.to(headingStart, {
        xPercent: -200,
        opacity: 0,
        duration: 1,
        ease: "power3.inOut"
      }, "<0.05");

      tl.to(headingEnd, {
        xPercent: 200,
        opacity: 0,
        duration: 1,
        ease: "power3.inOut"
      }, "<");
    }, container);

    return () => {
      document.body.style.overflow = "";
      ctx.revert(); // Automatically kills the timeline and reverts `.from()` styles
    };
  }, [onComplete]);

  return (
    <section ref={containerRef} className="willem-header is--loading is--hidden">
      <div ref={loaderRef} className="willem-loader">
        <div className="willem__h1">
          <div className="willem__h1-start">
            {word1.split('').map((char, i) => (
              <span key={`w1-${i}`} className="willem__letter">{char === " " ? "\\u00A0" : char}</span>
            ))}
          </div>
          <div className="willem__h1-end">
            {word2.split('').map((char, i) => (
              <span key={`w2-${i}`} className="willem__letter">{char === " " ? "\\u00A0" : char}</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dark Green Portal Rim */}
      <div ref={rimRef} className="portal-rim" />
    </section>
  );
};

export default FlowLoader;
