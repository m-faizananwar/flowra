"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CalendarClock, 
    Check, 
    Sparkles, 
    ChevronRight, 
    CheckCircle2, 
    CircleDashed, 
    Plus,
    ShoppingBag,
    Coffee,
    Home,
    Zap,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
    { value: "food", label: "Food", icon: Coffee, activeClass: "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]", iconClass: "bg-orange-500/10 text-orange-400" },
    { value: "shopping", label: "Shopping", icon: ShoppingBag, activeClass: "bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.3)]", iconClass: "bg-purple-500/10 text-purple-400" },
    { value: "home", label: "Home", icon: Home, activeClass: "bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.3)]", iconClass: "bg-blue-500/10 text-blue-400" },
    { value: "utilities", label: "Utilities", icon: Zap, activeClass: "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]", iconClass: "bg-yellow-500/10 text-yellow-400" },
    { value: "other", label: "Other", icon: Wallet, activeClass: "bg-zinc-400 text-black shadow-[0_0_15px_rgba(161,161,170,0.3)]", iconClass: "bg-zinc-500/10 text-zinc-400" },
];

const MOCK_ACTIONS = [
    { id: '1', merchant: 'Risk: High Bug Density', amount: 0, dueDate: new Date(Date.now() + 86400000 * 2), status: 'pending', isAuto: true },
    { id: '2', merchant: 'Review: Core API', amount: 0, dueDate: new Date(Date.now() - 86400000), status: 'overdue', isAuto: true },
];

interface PendingCommitmentsProps {
    commitmentsData?: any[];
}

export function PendingCommitments({ commitmentsData }: PendingCommitmentsProps) {
    const [commitments, setCommitments] = useState<any[]>(commitmentsData?.length ? commitmentsData : MOCK_ACTIONS);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<any | null>({
        merchant: "AWS Infrastructure",
        amount: 842.12,
        occurrences: 3,
        detectedDay: 18,
        category: "utilities"
    });
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newDay, setNewDay] = useState("18");
    const [selectedCategory, setSelectedCategory] = useState("other");

    useEffect(() => {
        if (commitmentsData && commitmentsData.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCommitments(commitmentsData);
        }
    }, [commitmentsData]);

    const markAsPaid = (id: string) => {
        setCommitments(prev => prev.map(c => c.id === id ? { ...c, status: 'paid' } : c));
    };

    const handleAcceptSuggestion = () => {
        if (!suggestion) return;
        const newEntry = {
            id: Math.random().toString(),
            merchant: suggestion.merchant,
            amount: suggestion.amount,
            dueDate: new Date(),
            isAuto: false,
            status: 'pending'
        };
        setCommitments([newEntry, ...commitments]);
        setSuggestion(null);
    };

    const handleCreateNew = () => {
        if (!newTitle || !newAmount) return;
        const newEntry = {
            id: Math.random().toString(),
            merchant: newTitle,
            amount: parseFloat(newAmount),
            dueDate: new Date(),
            isAuto: true,
            status: 'pending'
        };
        setCommitments([newEntry, ...commitments]);
        setIsCreating(false);
        setNewTitle("");
        setNewAmount("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col space-y-4"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Action Center
                        </h3>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Pending Intelligence Approvals</p>
                    </div>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="h-8 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        {isCreating ? <Sparkles className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
                        <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none mt-0.5">
                            {isCreating ? "Cancel" : "Setup New"}
                        </span>
                    </button>
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/40">Action Clearance</span>
                        <span className="text-[#24FF7C]">
                            {commitments.filter(c => c.status === 'paid').length} / {commitments.length}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${commitments.length > 0 ? (commitments.filter(c => c.status === 'paid').length / commitments.length) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#24FF7C] shadow-[0_0_10px_rgba(36,255,124,0.5)]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-[1.5rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col relative min-h-[500px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#24FF7C]/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-none p-5 space-y-6 relative z-10">
                    
                    <AnimatePresence>
                        {suggestion && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0 }}
                                className="overflow-hidden mb-4"
                            >
                                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 backdrop-blur-md relative group">
                                    <div className="absolute top-0 right-10 w-20 h-20 bg-indigo-500/20 blur-[30px] rounded-full pointer-events-none" />
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Detection</span>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-white leading-tight">{suggestion.merchant}</p>
                                            <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wider font-medium">Detected {suggestion.occurrences}x consecutively</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white tracking-tighter italic" style={{ fontFamily: 'Outfit, sans-serif' }}>High Risk</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={handleAcceptSuggestion}
                                            className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors active:scale-95 text-center"
                                        >
                                            Lock as Commitment
                                        </button>
                                        <button 
                                            onClick={() => setSuggestion(null)}
                                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest transition-colors active:scale-95"
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Action Required
                            </h4>
                            {commitments.filter(c => c.status !== 'paid').map((item) => {
                                const isOverdue = item.status === "overdue";
                                
                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:bg-white/[0.04]",
                                            isOverdue ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10" : "border-white/10 bg-white/[0.03]"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <button 
                                                onClick={() => markAsPaid(item.id)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 relative group/btn",
                                                    isOverdue ? "bg-red-500/10 text-red-400 hover:bg-[#24FF7C]/20 hover:text-[#24FF7C]" : 
                                                    "bg-white/5 text-white/30 hover:bg-[#24FF7C]/20 hover:text-[#24FF7C]"
                                                )}
                                            >
                                                <CircleDashed className="w-5 h-5 absolute transition-opacity group-hover/btn:opacity-0" />
                                                <CheckCircle2 className="w-5 h-5 absolute opacity-0 transition-opacity group-hover/btn:opacity-100" />
                                            </button>
                                            
                                            <div>
                                                <p className="text-[14px] font-bold tracking-tight text-white group-hover:text-[#24FF7C] transition-colors">
                                                    {item.merchant}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        isOverdue ? "text-red-400" : "text-white/40"
                                                    )}>
                                                        Due Soon
                                                    </span>
                                                    {item.isAuto && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                                                                Auto
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right relative z-10">
                                            <p className="text-[12px] font-black uppercase tracking-widest text-white/50">
                                                Review
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {commitments.some(c => c.status === 'paid') && (
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    Settled
                                </h4>
                                {commitments.filter(c => c.status === 'paid').map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] opacity-60 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#24FF7C]/10 text-[#24FF7C]">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            
                                            <div>
                                                <p className="text-[14px] font-bold tracking-tight text-white/60 line-through decoration-white/20">
                                                    {item.merchant}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#24FF7C]">
                                                        Cleared
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right relative z-10">
                                            <p className="text-[12px] font-black uppercase tracking-widest text-[#24FF7C]">
                                                Done
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isCreating && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 z-30 bg-[#0A0B0D] rounded-[1.5rem] p-5 flex flex-col"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-[#24FF7C] flex items-center justify-center shadow-[0_0_15px_rgba(36,255,124,0.3)]">
                                        <CalendarClock className="w-4 h-4 text-black stroke-[3px]" />
                                    </div>
                                    <h4 className="text-lg font-black text-white tracking-tight uppercase">New Fixed Liability</h4>
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Description</label>
                                        <input 
                                            type="text" 
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            placeholder="e.g. Netflix, Gym..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50 transition-colors"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-1 flex-1">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Amount</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={newAmount}
                                                    onChange={e => setNewAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#24FF7C]/50 transition-colors"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCreateNew}
                                    className="w-full py-4 rounded-xl bg-[#24FF7C] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(36,255,124,0.2)]"
                                >
                                    Activate Deductions
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between z-20 backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Pending Review</span>
                        <span className="text-[14px] font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {commitments.filter(c => c.status !== 'paid').length} Actions
                        </span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-[#24FF7C] transition-colors">
                        View Full Schedule
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
