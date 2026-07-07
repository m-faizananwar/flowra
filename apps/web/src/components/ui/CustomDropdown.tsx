"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
    icon?: React.ElementType;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
}

export function CustomDropdown({ options, value, onChange, placeholder = "Select...", className, label }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full min-w-[160px]", className)} ref={dropdownRef}>
            {label && <p className="text-[10px] font-black text-white/25 uppercase tracking-widest mb-1.5 px-1">{label}</p>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-11 flex items-center justify-between px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-sm font-bold text-white/80 group",
                    isOpen && "border-white/30 bg-white/[0.08]"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && <selectedOption.icon className="w-4 h-4 text-white/40" />}
                    <span className={cn(!selectedOption && "text-white/20")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-white/20 group-hover:text-white/40 transition-transform duration-300", isOpen && "rotate-180 text-white/60")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] mt-2 w-full bg-[#16171B]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group",
                                        value === option.value 
                                            ? "bg-[#24FF7C]/10 text-[#24FF7C]" 
                                            : "text-white/40 hover:bg-white/[0.05] hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {option.icon && <option.icon className={cn("w-3.5 h-3.5", value === option.value ? "text-[#24FF7C]" : "text-white/20 group-hover:text-white/40")} />}
                                        <span className="uppercase tracking-wider">{option.label}</span>
                                    </div>
                                    {value === option.value && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
