import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className, iconOnly = false, variant = 'default' }: LogoProps & { variant?: 'default' | 'white' | 'dark' }) {
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Modern Plug Icon */}
        <div className={cn(
          "relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300",
          isWhite ? "bg-white" : isDark ? "bg-gray-900" : "bg-blue-700"
        )}>
          <div className="flex gap-1.5">
            <div className={cn("w-1.5 h-4 rounded-full animate-pulse", isWhite || isDark ? "bg-blue-600" : "bg-white")} />
            <div className={cn("w-1.5 h-4 rounded-full", isWhite || isDark ? "bg-blue-400" : "bg-blue-200")} />
            <div className={cn("w-1.5 h-4 rounded-full animate-pulse", isWhite || isDark ? "bg-blue-600" : "bg-white")} style={{ animationDelay: '0.2s' }} />
          </div>
          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full blur-[2px] animate-ping opacity-50" />
        </div>
        {/* Outer Ring */}
        <div className={cn(
          "absolute inset-0 border-2 rounded-[1.5rem] opacity-20 group-hover:opacity-40 transition-opacity",
          isWhite ? "border-white" : isDark ? "border-gray-900" : "border-blue-700"
        )} />
      </div>
      {!iconOnly && (
        <div className="flex flex-col -space-y-1.5">
          <span className={cn(
            "text-2xl font-black tracking-tighter italic",
            isWhite ? "text-white" : isDark ? "text-gray-900" : "text-blue-700"
          )}>OPLUG</span>
          <span className={cn(
            "text-[7px] font-black tracking-[0.4em] uppercase",
            isWhite ? "text-white/60" : "text-gray-500"
          )}>The Ultimate Wire</span>
        </div>
      )}
    </div>
  );
}
