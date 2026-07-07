"use client";

import React from "react";
import { 
  AlertTriangle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  isLoading 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "h-14 w-full rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-rose-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Permanently Disconnect"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-white/20" />
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Action cannot be undone • All synced data will be wiped</p>
        </div>
      </div>
    </div>
  );
}
