"use client";

import { useEffect, useRef } from "react";

export default function MetalButton({ 
  children, 
  className = "", 
  style = {}, 
  onClick,
  variant = "solid", // "solid" or "outline"
  background = "#ffffff", // for outline variant inner bg
  enableShader = true // toggle the liquid metal animation
}) {
  const containerRef = useRef(null);
  const shaderInstance = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initShader = async () => {
      try {
        const { ShaderMount, liquidMetalFragmentShader } = await import(
          "@paper-design/shaders"
        );

        if (containerRef.current && mounted) {
          shaderInstance.current = new ShaderMount(
            containerRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 2.0,
              u_softness: 0.6,
              u_shiftRed: 0.2,
              u_shiftBlue: 0.2,
              u_distortion: 0.1,
              u_contour: 0,
              u_angle: 120,
              u_scale: 2.0,
              u_shape: 1,
              u_offsetX: 0,
              u_offsetY: 0,
            },
            undefined,
            variant === "outline" ? 1.0 : 0.5 // clearer shader if it's just a border
          );
        }
      } catch (error) {
        console.error("Failed to load metal shader:", error);
      }
    };

    if (enableShader) {
      initShader();
    }

    return () => {
      mounted = false;
    };
  }, [variant, enableShader]); // Re-init on variant or shader toggle

  const isOutline = variant === "outline";

  return (
    <button
      onClick={onClick}
      className={`metal-button ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "none",
        cursor: "pointer",
        padding: isOutline ? "1.5px" : "0", // this padding creates space for the "border"
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* Shader background layer (always is at the very back) */}
      {enableShader ? (
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        />
      ) : (
        <div 
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: "#ffffff",
            borderRadius: "inherit",
          }}
        />
      )}
      
      {/* Inner background (only used for outline variant to hide center shader) */}
      {isOutline && (
        <div 
          style={{
            position: "absolute",
            inset: "1.5px", // same as padding above
            background: background,
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: "9999px",
          }}
        />
      )}

      {/* Button content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </button>
  );
}
