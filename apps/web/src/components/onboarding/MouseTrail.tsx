"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const POOL_SIZE = 20;
const GAP = 100;

export function MouseTrail({ className }) {
    const containerRef = useRef(null);
    const cleanupRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Build flair pool (div elements with interactive glow)
        const flairEls = [];
        const colors = ["#6366F1", "#10B981", "#F59E0B", "#EC4899"];
        
        for (let i = 0; i < POOL_SIZE; i++) {
            const el = document.createElement("div");
            const color = colors[i % colors.length];
            const size = Math.random() * 8 + 8;
            const isSquare = Math.random() > 0.5;
            
            el.style.cssText = `
                position:absolute;
                opacity:0;
                width:${size}px;
                height:${size}px;
                pointer-events:none;
                background:${color};
                border-radius:${isSquare ? "4px" : "50%"};
                filter:blur(${size/3}px);
                box-shadow:0 0 ${size*2}px ${color}66;
            `;
            container.appendChild(el);
            flairEls.push(el);
        }

        let index = 0;
        const wrapper = gsap.utils.wrap(0, flairEls.length);
        gsap.defaults({ duration: 1 });

        let mousePos = { x: 0, y: 0 };
        let lastMousePos = { x: 0, y: 0 };
        let isInside = false;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
            mousePos = { x, y };
        };

        window.addEventListener("mousemove", handleMouseMove);

        function playAnimation(shape) {
            const tl = gsap.timeline();
            tl.from(shape, {
                opacity: 0,
                scale: 0,
                ease: "elastic.out(1,0.3)",
            })
            .to(shape, {
                y: "120vh",
                ease: "back.in(.4)",
                duration: 1.5,
                opacity: 0
            }, 0);
        }

        function animateImage() {
            const wrappedIndex = wrapper(index);
            const el = flairEls[wrappedIndex];

            gsap.killTweensOf(el);
            gsap.set(el, {
                opacity: 1,
                left: mousePos.x,
                top: mousePos.y,
                xPercent: -50,
                yPercent: -50,
                clearProps: "scale,rotation,y"
            });

            playAnimation(el);
            index++;
        }

        function imageTrail() {
            if (!isInside) return;

            const travelDistance = Math.hypot(
                lastMousePos.x - mousePos.x,
                lastMousePos.y - mousePos.y
            );

            if (travelDistance > GAP) {
                animateImage();
                lastMousePos = { ...mousePos };
            }
        }

        gsap.ticker.add(imageTrail);

        cleanupRef.current = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            gsap.ticker.remove(imageTrail);
            flairEls.forEach(el => {
                gsap.killTweensOf(el);
                el.remove();
            });
        };

        return () => {
            cleanupRef.current?.();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden z-[2] pointer-events-none opacity-40 ${className || ""}`}
        />
    );
}
