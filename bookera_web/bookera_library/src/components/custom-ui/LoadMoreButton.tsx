import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface LoadMoreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export default function LoadMoreButton({
  loading = false,
  className,
  ...props
}: LoadMoreButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      disabled={loading || props.disabled}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {t("loading")}
        </>
      ) : (
        t("loadMore")
      )}
    </Button>
  );
}
