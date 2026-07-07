"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";

// ---------- constants ----------
const CANVAS_W = 3200;
const CANVAS_H = 3000;

const STEP_MARKERS = [
    { x: 600, y: 400, label: "Welcome" },
    { x: 2400, y: 800, label: "Your Role" },
    { x: 700, y: 1200, label: "Primary Goal" },
    { x: 2500, y: 1600, label: "Workspace Identity" },
    { x: 800, y: 2000, label: "Integrations" },
    { x: 2200, y: 2400, label: "Discovery" },
    { x: 1400, y: 2800, label: "Finalizing" },
];

const STEP_QUOTES = [
    { line1: "Build better", line2: "Flow faster" },
    { line1: "Define your", line2: "Project role" },
    { line1: "Set your goals", line2: "Hit your targets" },
    { line1: "Name your", line2: "Agile hub" },
    { line1: "Your Stack", line2: "Your rules" },
    { line1: "Glad you", line2: "joined Flowra" },
    { line1: "Setting up", line2: "your workspace" },
];

const FORM_WIDTH = 480;

function generateSmoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const dx = next.x - curr.x;
        const dy = next.y - curr.y;
        const cp1x = curr.x + dx * 0.5;
        const cp1y = curr.y + dy * 0.1;
        const cp2x = next.x - dx * 0.5;
        const cp2y = next.y - dy * 0.1;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
}

function GhostSummary({ step, formData }) {
    let text = "";
    switch (step) {
        case 0: text = "Initialized"; break;
        case 1: text = formData.role || "Architect"; break;
        case 2: text = formData.primaryGoal || "Automate"; break;
        case 3: text = formData.workspaceName || "Main Node"; break;
        case 4: text = (formData.services || []).join(", ") || "Sync Active"; break;
        case 5: text = formData.source || "Pulse"; break;
        case 6: text = "Ready"; break;
    }

    return (
        <div className="pointer-events-none select-none text-center">
            <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-400/30 font-semibold mb-1">
                {STEP_MARKERS[step].label}
            </div>
            <div className="text-sm text-white/20 font-medium">{text}</div>
            <div className="w-4 h-4 mx-auto mt-2 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <svg className="w-2 h-2 text-indigo-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </div>
    );
}

export function OnboardingCanvas({ currentStep, formData, renderStepContent }) {
    const canvasRef = useRef(null);
    const viewportRef = useRef(null);
    const formRef = useRef(null);
    const trailRef = useRef(null);
    const trailGlowRef = useRef(null);
    const markerRefs = useRef([]);
    const [formReady, setFormReady] = useState(false);

    const pathD = generateSmoothPath(STEP_MARKERS);

    const positionForm = useCallback((stepIdx, immediate = false) => {
        if (!formRef.current) return;
        const marker = STEP_MARKERS[stepIdx];
        const targetX = marker.x - FORM_WIDTH / 2;
        const targetY = marker.y - 320; // Re-centered to 'attach' the trail

        if (immediate) {
            gsap.set(formRef.current, { x: targetX, y: targetY });
        } else {
            gsap.to(formRef.current, {
                x: targetX, y: targetY, duration: 0.8, ease: "power4.inOut"
            });
        }
    }, []);

    const panToStep = useCallback((stepIdx, immediate = false) => {
        if (!canvasRef.current || !viewportRef.current) return;
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;
        const marker = STEP_MARKERS[stepIdx];
        const tx = -(marker.x - vw / 2);
        const ty = -(marker.y - vh / 2); // Center marker in viewport

        if (immediate) {
            gsap.set(canvasRef.current, { x: tx, y: ty });
        } else {
            gsap.to(canvasRef.current, {
                x: tx, y: ty, duration: 0.8, ease: "power4.inOut"
            });
        }
    }, []);

    const animateTrail = useCallback((stepIdx, immediate = false) => {
        [trailRef, trailGlowRef].forEach((ref) => {
            if (!ref.current) return;
            const totalLength = ref.current.getTotalLength();
            const progress = stepIdx / (STEP_MARKERS.length - 1);
            const offset = totalLength * (1 - progress);
            if (immediate) {
                ref.current.style.strokeDasharray = `${totalLength}`;
                ref.current.style.strokeDashoffset = `${offset}`;
            } else {
                gsap.to(ref.current, { strokeDashoffset: offset, duration: 0.8, ease: "power4.inOut" });
            }
        });
    }, []);

    useEffect(() => {
        positionForm(currentStep, true);
        panToStep(currentStep, true);
        animateTrail(currentStep, true);
        Promise.resolve().then(() => setFormReady(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!formReady) return;
        positionForm(currentStep);
        panToStep(currentStep);
        animateTrail(currentStep);
    }, [currentStep, positionForm, panToStep, animateTrail, formReady]);

    return (
        <div ref={viewportRef} className="absolute inset-0 overflow-hidden z-[1]">
            <div ref={canvasRef} className="absolute will-change-transform" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px),
                        linear-gradient(90deg,rgba(255,255,255,0.035) 2px, transparent 2px)
                    `,
                    backgroundSize: "100px 100px",
                }} />

                <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
                    <path d={pathD} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="6 10" />
                    <path ref={trailGlowRef} d={pathD} fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="10" strokeLinecap="round" />
                    <path ref={trailRef} d={pathD} fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>

                {STEP_MARKERS.map((marker, i) => (
                    <div key={i} ref={el => { markerRefs.current[i] = el; }} className="absolute" style={{ left: marker.x, top: marker.y, transform: "translate(-50%, 0)" }}>
                        {i < currentStep && <GhostSummary step={i} formData={formData} />}
                        {i === currentStep && <div className="w-2 h-2 rounded-full bg-indigo-500/20 mx-auto" />}
                        {i > currentStep && (
                            <div className="text-center opacity-[0.08]">
                                <div className="text-[10px] uppercase font-bold tracking-widest mb-1">Step {i + 1}</div>
                                <div className="text-lg font-black italic uppercase tracking-tighter leading-none">{STEP_QUOTES[i].line1}<br/>{STEP_QUOTES[i].line2}</div>
                            </div>
                        )}
                    </div>
                ))}

                <div ref={formRef} className="absolute will-change-transform" style={{ width: FORM_WIDTH, zIndex: 10 }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }} className="relative z-10 w-full">
                            {renderStepContent(currentStep)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export { STEP_MARKERS };
