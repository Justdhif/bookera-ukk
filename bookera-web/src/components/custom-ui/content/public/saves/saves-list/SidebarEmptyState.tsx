import { useTranslations } from "next-intl";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarEmptyStateProps {
  onCreateClick: () => void;
}

/** Empty state untuk sidebar mode */
export default function SidebarEmptyState({
  onCreateClick,
}: SidebarEmptyStateProps) {
    const t = useTranslations("public");
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15">
        <BookMarked className="h-6 w-6 text-brand-primary/60 dark:text-brand-primary-light/60" />
      </div>
      <p className="text-xs font-medium text-muted-foreground dark:text-white/60 mb-1">
        
                      {t("noCollections")}
                    </p>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs text-brand-primary hover:text-brand-primary-dark dark:hover:text-brand-primary-light"
        onClick={onCreateClick}
      >
        
                      {t("createFirst")}
                    </Button>
    </div>
  );
}
