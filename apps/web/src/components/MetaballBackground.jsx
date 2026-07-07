"use client";

import React, { useEffect, useRef } from "react";

const MetaballBackground = ({ color = "#1A1A1A", backgroundColor = "#E8E4D9", dotCount = 12 }) => {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let dots = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Re-init dots on large resize for better distribution? 
      // Or just let them keep moving.
    };

    class Dot {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 80 + 100;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.002 + Math.random() * 0.005; // Slightly slower for elegance
        this.range = 80 + Math.random() * 120;
        this.baseX = this.x;
        this.baseY = this.y;
      }

      update() {
        this.angle += this.speed;
        this.x = this.baseX + Math.cos(this.angle) * this.range;
        this.y = this.baseY + Math.sin(this.angle) * this.range;
      }

      draw() {
        ctx.fillStyle = "white"; // Canvas is blurred then thresholded
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      dots = [];
      for (let i = 0; i < dotCount; i++) {
        dots.push(new Dot());
      }
    };

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((dot) => {
        dot.update();
        dot.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [dotCount]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: backgroundColor,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        ref={stageRef}
        style={{
          width: "100%",
          height: "100%",
          filter: "url(#topo-hollow)",
          opacity: 0.8, // Subtle
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>

      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="topo-hollow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur" />
            <feComponentTransfer in="blur" result="rings">
              {/* This creates the hollow ring look by quantizing the alpha */}
              <feFuncA type="discrete" tableValues="0 1 0 1 0 1 0 1 0 1 0 1 0 1 0" />
            </feComponentTransfer>
            <feFlood floodColor={color} result="strokeFill" />
            <feComposite in="strokeFill" in2="rings" operator="in" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default MetaballBackground;
