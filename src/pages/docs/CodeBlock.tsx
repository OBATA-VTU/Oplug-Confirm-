import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'json', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-white/5 my-6">
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title || language}</span>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="text-sm font-mono text-blue-400">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
