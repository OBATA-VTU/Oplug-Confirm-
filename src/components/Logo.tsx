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
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="relative flex items-center justify-center">
        {/* The "O" - Center of Attraction */}
        <div className={cn(
          "relative w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 group-hover:rotate-180 shadow-lg",
          isWhite ? "border-white" : isDark ? "border-gray-900" : "border-blue-700"
        )}>
          {/* Inner Wire/Plug element */}
          <div className="flex gap-1">
            <div className={cn("w-1.5 h-4 rounded-full animate-pulse", isWhite || isDark ? "bg-blue-600" : "bg-white")} />
            <div className={cn("w-1.5 h-4 rounded-full", isWhite || isDark ? "bg-blue-400" : "bg-blue-200")} />
          </div>
          
          {/* Sparkle */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full blur-[1px] animate-ping opacity-75" />
        </div>
      </div>

      {!iconOnly && (
        <div className="flex items-baseline -space-x-0.5">
          <span className={cn(
            "text-2xl font-black tracking-tighter italic",
            isWhite ? "text-white" : isDark ? "text-gray-900" : "text-blue-700"
          )}>
            <span className="text-3xl">O</span>PLUG
          </span>
        </div>
      )}
    </div>
  );
}
