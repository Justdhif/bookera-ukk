"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlurIn, FadeIn, SlideIn } from "@/components/custom-ui/motion";

interface ContentHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  isAdmin?: boolean;
  rightActions?: ReactNode;
  className?: string;
}

export default function ContentHeader({
  title,
  description,
  showBackButton = false,
  onBack,
  isAdmin = false,
  rightActions,
  className,
}: ContentHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center justify-between border-b pb-6 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBackButton && (
          <SlideIn direction="left" delay={0.2} distance={20}>
            <Button
              variant="brand"
              size="icon"
              className={cn(
                "shrink-0 transition-transform hover:scale-105 active:scale-95",
                isAdmin ? "h-8 w-8" : "h-10 w-10"
              )}
              onClick={handleBack}
            >
              <ArrowLeft className={isAdmin ? "h-4 w-4" : "h-5 w-5"} />
            </Button>
          </SlideIn>
        )}
        <div className={cn("flex flex-col", !isAdmin && "space-y-1")}>
          <BlurIn
            className={cn(
              "font-bold tracking-tight text-foreground line-clamp-1 transition-all",
              isAdmin ? "text-3xl" : "text-2xl md:text-3xl"
            )}
          >
            {title}
          </BlurIn>
          {description && (
            <FadeIn
              delay={0.1}
              className={cn(
                "text-muted-foreground transition-all",
                isAdmin ? "text-base" : "text-sm md:text-base"
              )}
            >
              {description}
            </FadeIn>
          )}
        </div>
      </div>

      {rightActions && (
        <div className="flex flex-wrap items-center gap-3 sm:mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
          {rightActions}
        </div>
      )}
    </div>
  );
}
