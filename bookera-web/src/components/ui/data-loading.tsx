"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataLoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function DataLoading({
  message = "Loading data...",
  className,
  size = "md",
}: DataLoadingProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-64",
    lg: "h-96",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-primary animate-spin blur-sm opacity-30" />
        
        {/* Inner spinning loader */}
        <div className="relative bg-background rounded-full p-4">
          <Loader2
            className={cn(
              "animate-spin text-brand-primary",
              iconSizes[size]
            )}
          />
        </div>
      </div>

      {/* Loading message with animated dots */}
      <div className="mt-6 flex items-center gap-2">
        <p className={cn("font-medium text-muted-foreground", textSizes[size])}>
          {message}
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-primary to-purple-500 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" />
      </div>

      {/* Additional decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-primary/20 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-500/20 rounded-full animate-ping [animation-delay:0.5s]" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-brand-primary/20 rounded-full animate-ping [animation-delay:1s]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
