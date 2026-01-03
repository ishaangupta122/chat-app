"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, CopyCheck } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code]);

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden border border-border",
        className
      )}>
      {/* Header */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 text-sm">
        <span className="text-muted-foreground font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          {copied ? (
            <>
              <CopyCheck className="mr-1.5 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-4 w-4" />
              Copy code
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="bg-card p-4 overflow-x-auto">
        <pre className="text-sm text-foreground/90">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
