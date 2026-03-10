import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* The "Wire" Path */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-blue-700">
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
        <div className="relative z-10 w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-white/40 rounded-full" />
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className="text-2xl font-black tracking-tighter text-blue-700">OPLUG</span>
          <span className="text-[8px] font-bold text-gray-400 tracking-[0.3em] uppercase">The Ultimate Wire</span>
        </div>
      )}
    </div>
  );
}
