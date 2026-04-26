"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { 
    WelcomeStep, 
    RoleStep, 
    ObjectiveStep, 
    WorkspaceStep, 
    ServiceSyncStep, 
    SourceStep, 
    FinalizingStep 
} from "@/components/onboarding/OnboardingSteps";
import { MouseTrail } from "@/components/onboarding/MouseTrail";
import { OnboardingCanvas } from "@/components/onboarding/OnboardingCanvas";
import MetaballBackground from "@/components/MetaballBackground";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        role: "",
        primaryGoal: "",
        workspaceName: "",
        services: [],
        source: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const isLightMode = step % 2 !== 0;

    const updateData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    const renderStepContent = (stepIdx) => {
        switch (stepIdx) {
            case 0: return <WelcomeStep onNext={nextStep} isLight={false} />;
            case 1: return <RoleStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} isLight={true} />;
            case 2: return <ObjectiveStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} isLight={false} />;
            case 3: return <WorkspaceStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} isLight={true} />;
            case 4: return <ServiceSyncStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} isLight={false} />;
            case 5: return <SourceStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} isLight={true} />;
            case 6: return <FinalizingStep onComplete={completeOnboarding} isSaving={isSaving} onBack={prevStep} isLight={false} />;
            default: return null;
        }
    };

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarded')
                .eq('id', user.id)
                .single();

            if (profile?.onboarded) {
                router.push("/dashboard");
            }
        };
        checkStatus();
    }, [router]);

    
    const completeOnboarding = async () => {
        setIsSaving(true);
        // Set local override immediately to prevent loop if DB fails
        localStorage.setItem('flowra_onboarding_bypass', 'true');
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Try a full update first
                const { error: fullError } = await supabase
                    .from('profiles')
                    .upsert({ 
                        id: user.id,
                        role: formData.role,
                        goal: formData.primaryGoal,
                        workspace_name: formData.workspaceName,
                        integrations: formData.services,
                        discovery_source: formData.source,
                        onboarded: true,
                        updated_at: new Date().toISOString()
                    });

                if (fullError) {
                    console.error("Full save rejected:", {
                        message: fullError.message,
                        details: fullError.details,
                        code: fullError.code
                    });
                    
                    // Fallback: Just mark as onboarded if the extended columns fail
                    const { error: fallbackError } = await supabase
                        .from('profiles')
                        .upsert({ 
                            id: user.id,
                            role: formData.role,
                            integrations: formData.services,
                            onboarded: true,
                            updated_at: new Date().toISOString()
                        });
                    
                    if (fallbackError) {
                        console.error("Fallback also rejected:", {
                            message: fallbackError.message,
                            code: fallbackError.code
                        });
                        // We still move forward because of the bypass
                    }
                }
            } else {
                localStorage.setItem('flowra_onboarding', JSON.stringify(formData));
            }
            
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (error) {
            console.error("Persistence failed completely:", error.message || error);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        }
    };

    return (
        <main className="min-h-screen bg-white font-[family-name:var(--font-inter)] relative overflow-x-hidden">
            {/* === PERSISTENT BACKGROUND TEXT === */}
            <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none">
                 <h1 className="text-[12rem] md:text-[20rem] font-black text-black opacity-[0.03] tracking-tighter uppercase italic select-none">
                    Setup
                </h1>
            </div>

            {/* === MAIN PAGE === */}
            <div className="relative z-10 px-4 pt-4 w-full h-screen flex flex-col">
                <motion.section 
                    animate={{ 
                        backgroundColor: isLightMode ? "#FFFFFF" : "#050505",
                    }}
                    transition={{ 
                        duration: 1.5, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="relative w-full flex-1 rounded-t-[3.5rem] rounded-b-none overflow-hidden shadow-2xl border-t border-x border-white/5"
                >
                    {/* Atmospheric floating orbs */}
                    <motion.div 
                        animate={{ opacity: isLightMode ? 0.4 : 0.8 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-0"
                    >
                        <MetaballBackground 
                            backgroundColor="transparent" 
                            color={isLightMode ? "#F3F4F6" : "rgba(255,255,255,0.05)"} 
                            dotCount={isLightMode ? 6 : 10} 
                        />
                    </motion.div>
                    
                    {/* === Gradient orbs for depth === */}
                    <AnimatePresence>
                        {!isLightMode && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5 }}
                                className="absolute top-[-20%] right-[-10%] h-[1200px] w-[1200px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] blur-[100px] pointer-events-none z-0" 
                            />
                        )}
                    </AnimatePresence>
                    
                    {/* === MOUSE TRAIL EFFECT === */}
                    {!isLightMode && <MouseTrail />}

                    {/* === SCROLLABLE CANVAS === */}
                    <div className="relative z-10 h-full w-full">
                        <OnboardingCanvas
                            currentStep={step}
                            formData={formData}
                            renderStepContent={renderStepContent}
                        />
                    </div>

                    {/* TOP-LEFT LOGO */}
                    <motion.div
                        initial={{ opacity: 0, y: -25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="absolute left-10 top-10 z-[20] pointer-events-auto"
                    >
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div 
                                animate={{ backgroundColor: isLightMode ? "#000000" : "#6366F1" }}
                                transition={{ duration: 1 }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-[10deg] transition-transform"
                            >
                                <Rocket className="w-6 h-6 text-white" />
                            </motion.div>
                            <motion.span 
                                animate={{ color: isLightMode ? "#000000" : "#FFFFFF" }}
                                transition={{ duration: 1 }}
                                className="text-xl font-black italic uppercase tracking-tighter"
                            >
                                Flowra
                            </motion.span>
                        </Link>
                    </motion.div>

                    {/* TOP-CENTER STEP INDICATOR */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        className="absolute top-12 left-1/2 -translate-x-1/2 z-[20] flex items-center gap-2 pointer-events-none"
                    >
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    width: i === step ? 32 : 8,
                                    backgroundColor:
                                        i <= step
                                            ? (isLightMode ? "#000000" : "rgba(99, 102, 241, 0.6)")
                                            : (isLightMode ? "#E5E7EB" : "rgba(255, 255, 255, 0.1)"),
                                }}
                                transition={{ duration: 0.4 }}
                                className="h-2 rounded-full"
                            />
                        ))}
                    </motion.div>
                </motion.section>
            </div>
        </main>
    );
}
