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
        {/* The "Wire" Path */}
        <svg viewBox="0 0 100 100" className={cn(
          "absolute inset-0 w-full h-full",
          isWhite ? "text-white" : isDark ? "text-gray-900" : "text-blue-700"
        )}>
          <path 
            d="M 10,50 C 10,20 90,20 90,50 C 90,80 10,80 10,50" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="6" 
            strokeLinecap="round"
            className="animate-dash"
            style={{ strokeDasharray: '200' }}
          />
        </svg>
        {/* The Plug Head */}
        <div className={cn(
          "relative z-10 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform",
          isWhite ? "bg-white" : isDark ? "bg-gray-900" : "bg-blue-700"
        )}>
          <div className="flex gap-1">
            <div className={cn("w-1 h-3 rounded-full", isWhite || isDark ? "bg-blue-700/40" : "bg-white/40")} />
            <div className={cn("w-1 h-3 rounded-full", isWhite || isDark ? "bg-blue-700" : "bg-white")} />
            <div className={cn("w-1 h-3 rounded-full", isWhite || isDark ? "bg-blue-700/40" : "bg-white/40")} />
          </div>
        </div>
      </div>
      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className={cn(
            "text-2xl font-black tracking-tighter",
            isWhite ? "text-white" : isDark ? "text-gray-900" : "text-blue-700"
          )}>OPLUG</span>
          <span className={cn(
            "text-[8px] font-bold tracking-[0.3em] uppercase",
            isWhite ? "text-white/60" : "text-gray-400"
          )}>The Ultimate Wire</span>
        </div>
      )}
    </div>
  );
}
