"use client";

import { Bell, User, Wallet, LayoutGrid } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
    userEmail?: string;
}

export function Header({ userEmail = "User" }: HeaderProps) {
    const pathname = usePathname();
    
    // Map pathname to title
    const getTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (!lastSegment || lastSegment === 'dashboard') return 'Overview';
        
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    };

    const getSubtitle = () => {
        const title = getTitle();
        if (title === 'Overview') return `Welcome back, ${userEmail.split('@')[0]}`;
        return 'Optimizing your agile delivery stream';
    };

    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40 font-[family-name:var(--font-outfit)] tracking-tight uppercase leading-none">
                    {getTitle()}
                </h1>
                <p className="text-white/50 mt-2 text-[15px] font-medium tracking-tight">
                    {getSubtitle()}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <LayoutGrid className="w-6 h-6 stroke-[1.5px]" />
                    </button>

                    <button className="relative p-2 text-white/40 hover:text-white transition-colors group">
                        <Bell className="w-6 h-6 stroke-[1.5px]" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF8A8A] rounded-full border-2 border-[#0A0B0D]" />
                    </button>
                    
                    <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <Wallet className="w-6 h-6 stroke-[1.5px]" />
                    </button>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">{userEmail.split('@')[0]}</p>
                        <p className="text-[8px] font-bold text-[#24FF7C] uppercase tracking-widest leading-none mt-0.5">Pro Member</p>
                    </div>
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 rounded-full border border-white/10 group-hover:border-white/20 transition-colors" />
                        <div className="relative w-10 h-10 rounded-full bg-[#FDE6D2] border-2 border-[#33353F] flex items-center justify-center overflow-hidden">
                            <User className="w-6 h-6 text-[#4A4C56] mt-2" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
