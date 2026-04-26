"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
    Sparkles, 
    ArrowRight, 
    ArrowLeft, 
    Rocket, 
    Users, 
    Terminal, 
    Github, 
    Slack, 
    Layers,
    CheckCircle2,
    Loader2,
    Target,
    Zap,
    MessageSquare,
    Search,
    Share2,
    HelpCircle,
    Boxes,
    Code2,
    LayoutDashboard,
    UserCog,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Animation Variants ----------

const fieldVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 1.0,
            delay: 0.1 + i * 0.08,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

const titleVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// ---------- Sub-Components ----------

function AnimatedCard({ children, stepKey, isLight }) {
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [2, -2]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-2, 2]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            key={stepKey}
            ref={cardRef}
            initial="hidden"
            animate="visible"
            className={cn(
                "relative w-full max-w-[560px] rounded-[3.5rem] p-[1px] overflow-hidden group/card transition-shadow duration-1000",
                isLight ? "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.12)]" : "shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)]"
            )}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                isLight ? "bg-black/5" : "bg-gradient-to-br from-white/20 via-white/5 to-white/20"
            )} />
            <div className={cn(
                "relative w-full h-full rounded-[3.5rem] p-12 backdrop-blur-3xl overflow-hidden transition-colors duration-1000",
                isLight ? "bg-white border border-black/5" : "bg-[#000]"
            )}>
                {!isLight && <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />}
                <div className="relative z-10 w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

function StepNav({ onNext, onBack, nextLabel = "Continue", isFirst = false, isLast = false, isLoading = false, canProceed = true, isLight = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.0 }}
            className="mt-12 flex items-center gap-6 w-full max-w-[560px]"
        >
            {!isFirst && (
                <button
                    onClick={onBack}
                    className={cn(
                        "h-20 px-10 rounded-[2rem] transition-all duration-700 font-bold uppercase tracking-widest font-sans text-[11px] flex items-center gap-2 backdrop-blur-xl border",
                        isLight 
                            ? "bg-black/5 text-black border-black/10 hover:bg-black/10" 
                            : "bg-white/[0.03] text-white border-white/5 hover:bg-white/10"
                    )}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
            )}
            <button
                disabled={!canProceed || isLoading}
                onClick={onNext}
                style={{ fontFamily: 'Outfit, sans-serif' }}
                className={cn(
                    "flex-1 h-20 rounded-[2rem] font-bold tracking-normal transition-all duration-1000 relative overflow-hidden group",
                    canProceed 
                        ? (isLight ? "bg-black text-white hover:scale-[1.01]" : "bg-white text-black shadow-[0_20px_50px_-10px_rgba(255,255,255,0.1)] hover:scale-[1.01]") 
                        : (isLight ? "bg-black/10 text-black/20" : "bg-white/20 text-black/40 cursor-not-allowed border-none")
                )}
            >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center w-full h-full"
                        >
                            <Loader2 className={cn("w-7 h-7 animate-spin", isLight ? "text-white" : "text-black")} />
                        </motion.div>
                    ) : (
                        <motion.span
                            key="label"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative z-10 flex items-center justify-center gap-3 text-lg font-black uppercase italic"
                        >
                            {nextLabel}
                            <ChevronRight className="w-6 h-6 stroke-[3px]" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        </motion.div>
    );
}

// ---------- Inner Selection Item ----------

function SelectionItem({ id, label, icon: Icon, isSelected, onClick, index, isLight }) {
    return (
        <motion.button
            key={id}
            custom={index}
            variants={fieldVariants}
            onClick={onClick}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex flex-col items-center justify-center gap-5 p-10 rounded-[3rem] border transition-colors duration-700 text-center group relative overflow-hidden",
                isLight 
                    ? (isSelected 
                        ? "bg-black text-white border-black shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)]" 
                        : "bg-white text-black border-black/5 hover:bg-black/5")
                    : (isSelected 
                        ? "bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.15)]" 
                        : "bg-black text-white border-white/10 hover:bg-white/80 hover:text-black hover:border-white/20")
            )}
        >
            <motion.div
                animate={isSelected ? { 
                    scale: [1, 1.25, 1],
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.5, ease: "easeOut" }
                } : {}}
            >
                <Icon className="w-8 h-8 transition-colors duration-700" />
            </motion.div>
            
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-4 right-6"
                    >
                        <CheckCircle2 className={cn("w-5 h-5", isLight ? "text-white" : "text-black")} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>

            <span style={{ fontFamily: 'Outfit, sans-serif' }} className="text-[12px] font-black uppercase tracking-[0.2em] leading-none transition-colors duration-700">
                {label}
            </span>
        </motion.button>
    );
}

// ---------- Title Helper ----------

const OnboardingTitle = ({ primary, secondary, isLight, secondaryClass = "" }) => (
    <motion.h1 
        variants={titleVariants} 
        initial="hidden" 
        animate="visible" 
        style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-2px", lineHeight: 1 }}
        className={cn(
            "text-5xl md:text-6xl font-medium mb-6 text-center transition-colors duration-1000",
            isLight ? "text-black" : "text-white"
        )}
    >
        {primary}<br />
        <span className={cn("transition-all duration-1000", secondaryClass)}>
            {secondary}
        </span>
    </motion.h1>
);

const StepLabel = ({ text, isLight }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }} 
        className={cn(
            "font-black uppercase tracking-[0.5em] text-[10px] mb-4 text-center transition-colors duration-1000",
            isLight ? "text-black/10" : "text-white/20"
        )}
    >
        {text}
    </motion.div>
);

const SubHeading = ({ text, isLight }) => (
    <motion.p 
        variants={subtitleVariants} 
        initial="hidden" 
        animate="visible" 
        style={{ color: "#6B7280", lineHeight: 1.7, fontWeight: 500 }}
        className="text-[1.1rem] max-w-[500px] text-center mx-auto transition-all duration-1000"
    >
        {text}
    </motion.p>
);

// ---------- Step Components ----------

export function WelcomeStep({ onNext, isLight }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Start here" isLight={isLight} />
                <OnboardingTitle 
                    primary="Ready to" 
                    secondary="start building." 
                    isLight={isLight} 
                    secondaryClass="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent"
                />
                <SubHeading text="Three simple steps to eliminate the overhead of manual board updates." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="welcome" isLight={isLight}>
                <motion.div custom={0} variants={fieldVariants} className="text-center space-y-10 py-6">
                    <div className="relative mx-auto w-24 h-24">
                        <div className={cn("absolute inset-0 blur-2xl rounded-full scale-150 animate-pulse", isLight ? "bg-black/5" : "bg-indigo-500/20")} />
                        <div className={cn("relative w-full h-full rounded-[2.5rem] border flex items-center justify-center shadow-2xl transition-colors duration-1000", isLight ? "bg-black border-black/10" : "bg-black border-white/10")}>
                            <Rocket className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </motion.div>
            </AnimatedCard>

            <StepNav onNext={onNext} isFirst nextLabel="Continue" isLight={isLight} />
        </div>
    );
}

export function RoleStep({ data, updateData, onNext, onBack, isLight }) {
    const roles = [
        { id: "product", label: "Product", icon: LayoutDashboard },
        { id: "engineer", label: "Engineer", icon: Code2 },
        { id: "scrum", label: "Scrum Master", icon: UserCog },
        { id: "other", label: "Other Member", icon: Users }
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Your Role" isLight={isLight} />
                <OnboardingTitle 
                    primary="Choose your" 
                    secondary="primary focus." 
                    isLight={isLight} 
                    secondaryClass={isLight ? "text-violet-600" : "text-violet-400"}
                />
                <SubHeading text="Intelligent workflows tailored to every team member, ensuring 100% synchronization." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="role" isLight={isLight}>
                <div className="grid grid-cols-2 gap-4">
                    {roles.map((role, i) => (
                        <SelectionItem
                            key={role.id}
                            id={role.id}
                            label={role.label}
                            icon={role.icon}
                            index={i}
                            isSelected={data.role === role.id}
                            onClick={() => updateData({ role: role.id })}
                            isLight={isLight}
                        />
                    ))}
                </div>
            </AnimatedCard>

            <StepNav onNext={onNext} onBack={onBack} canProceed={!!data.role} isLight={isLight} />
        </div>
    );
}

export function ObjectiveStep({ data, updateData, onNext, onBack, isLight }) {
    const goals = [
        { id: "automation", label: "Automation", icon: Zap },
        { id: "velocity", label: "Velocity", icon: Target },
        { id: "reporting", label: "Reporting", icon: MessageSquare },
        { id: "sync", label: "Synchronization", icon: Boxes }
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="The Objective" isLight={isLight} />
                <OnboardingTitle 
                    primary="Define the" 
                    secondary="main objective." 
                    isLight={isLight} 
                    secondaryClass="text-[#6B7280]"
                />
                <SubHeading text="Connect codebase updates with business goals automatically." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="goal" isLight={isLight}>
                <div className="grid grid-cols-2 gap-4">
                    {goals.map((goal, i) => (
                        <SelectionItem
                            key={goal.id}
                            id={goal.id}
                            label={goal.label}
                            icon={goal.icon}
                            index={i}
                            isSelected={data.primaryGoal === goal.id}
                            onClick={() => updateData({ primaryGoal: goal.id })}
                            isLight={isLight}
                        />
                    ))}
                </div>
            </AnimatedCard>

            <StepNav onNext={onNext} onBack={onBack} canProceed={!!data.primaryGoal} isLight={isLight} />
        </div>
    );
}

export function WorkspaceStep({ data, updateData, onNext, onBack, isLight }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Identity" isLight={isLight} />
                <OnboardingTitle 
                    primary="Build More." 
                    secondary="Admin Less." 
                    isLight={isLight} 
                    secondaryClass="text-[#10B981]"
                />
                <SubHeading text="Create a dedicated space for your team to thrive." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="workspace" isLight={isLight}>
                <motion.div custom={0} variants={fieldVariants} className="space-y-8 py-6">
                    <input
                        type="text"
                        placeholder="My Project..."
                        className={cn(
                            "w-full h-20 bg-transparent border-b-2 outline-none px-4 text-3xl font-medium text-center transition-all font-outfit duration-1000",
                            isLight 
                                ? "border-black/10 text-black focus:border-black placeholder:text-black/5" 
                                : "border-white/10 text-white focus:border-indigo-500 placeholder:text-white/5"
                        )}
                        value={data.workspaceName}
                        onChange={(e) => updateData({ workspaceName: e.target.value })}
                        autoFocus
                    />
                </motion.div>
            </AnimatedCard>

            <StepNav onNext={onNext} onBack={onBack} canProceed={data.workspaceName.length > 2} isLight={isLight} />
        </div>
    );
}

export function ServiceSyncStep({ data, updateData, onNext, onBack, isLight }) {
    const services = [
        { id: "jira", label: "Jira", icon: Layers },
        { id: "github", label: "GitHub", icon: Github },
        { id: "slack", label: "Slack", icon: Slack },
        { id: "linear", label: "Linear", icon: Target }
    ];

    const toggle = (id) => {
        const current = data.services || [];
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        updateData({ services: next });
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Integrations" isLight={isLight} />
                <OnboardingTitle 
                    primary="Connects to your" 
                    secondary="existing stack." 
                    isLight={isLight} 
                    secondaryClass="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                />
                <SubHeading text="Automated project synchronization in real-time." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="services" isLight={isLight}>
                <div className="grid grid-cols-2 gap-4">
                    {services.map((item, i) => (
                        <SelectionItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            index={i}
                            isSelected={data.services?.includes(item.id)}
                            onClick={() => toggle(item.id)}
                            isLight={isLight}
                        />
                    ))}
                </div>
            </AnimatedCard>

            <StepNav onNext={onNext} onBack={onBack} canProceed={(data.services || []).length > 0} isLight={isLight} />
        </div>
    );
}

export function SourceStep({ data, updateData, onNext, onBack, isLight }) {
    const sources = [
        { id: "social", label: "Social", icon: Share2 },
        { id: "colleague", label: "Friend", icon: Users },
        { id: "search", label: "Search", icon: Search },
        { id: "other", label: "Other", icon: HelpCircle }
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Discovery" isLight={isLight} />
                <OnboardingTitle 
                    primary="Help us find" 
                    secondary="the story." 
                    isLight={isLight} 
                    secondaryClass="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                />
                <SubHeading text="Zero manual overhead. Just proof of work." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="source" isLight={isLight}>
                <div className="grid grid-cols-2 gap-4">
                    {sources.map((src, i) => (
                        <SelectionItem
                            key={src.id}
                            id={src.id}
                            label={src.label}
                            icon={src.icon}
                            index={i}
                            isSelected={data.source === src.id}
                            onClick={() => updateData({ source: src.id })}
                            isLight={isLight}
                        />
                    ))}
                </div>
            </AnimatedCard>

            <StepNav onNext={onNext} onBack={onBack} canProceed={!!data.source} isLight={isLight} />
        </div>
    );
}

export function FinalizingStep({ onComplete, isSaving, onBack, isLight }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center mb-16">
                <StepLabel text="Finalizing" isLight={isLight} />
                <OnboardingTitle 
                    primary="Board Accurate." 
                    secondary="Team Synced." 
                    isLight={isLight} 
                    secondaryClass="text-[#10B981]"
                />
                <SubHeading text="Your workspace is prepared for complete automation." isLight={isLight} />
            </div>

            <AnimatedCard stepKey="final" isLight={isLight}>
                <motion.div custom={0} variants={fieldVariants} className="text-center space-y-10 py-10">
                    <div className="relative mx-auto w-24 h-24">
                        <div className={cn("absolute inset-0 blur-2xl rounded-full scale-150 animate-pulse", isLight ? "bg-black/5" : "bg-indigo-600/40")} />
                        <div className={cn("relative w-full h-full rounded-full border flex items-center justify-center shadow-2xl transition-colors duration-1000", isLight ? "bg-black border-black/10 shadow-black/10" : "bg-black border-white/10 shadow-indigo-500/30")}>
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </motion.div>
            </AnimatedCard>

            <StepNav onNext={onComplete} onBack={onBack} isLoading={isSaving} isLast nextLabel="Go to Dashboard" isLight={isLight} />
        </div>
    );
}
