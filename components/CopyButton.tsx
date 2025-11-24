import React, { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, label, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 border border-transparent 
      ${copied 
        ? "bg-green-500/10 text-green-400 border-green-500/20" 
        : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-700"} 
      ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : (label || 'Copy')}</span>
    </button>
  );
};

export default CopyButton;