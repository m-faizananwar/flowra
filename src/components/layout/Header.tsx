"use client";

import { usePathname } from "next/navigation";
import { NotificationsPanel } from "./NotificationsPanel";

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
                    <NotificationsPanel />
                </div>
                
                <div className="flex items-center">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">{userEmail.split('@')[0]}</p>
                        <p className="text-[8px] font-bold text-[#24FF7C] uppercase tracking-widest leading-none mt-0.5">Pro Member</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
