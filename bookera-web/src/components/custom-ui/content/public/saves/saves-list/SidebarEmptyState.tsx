import { useTranslations } from "next-intl";
import { BookMarked } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";

interface SidebarEmptyStateProps {
  onCreateClick: () => void;
}

export default function SidebarEmptyState({ onCreateClick }: SidebarEmptyStateProps) {
  const t = useTranslations("public");
  return (
    <EmptyState
      variant="compact"
      icon={<BookMarked className="h-5 w-5" />}
      title={t("noCollections")}
      actionLabel={t("createFirst")}
      onAction={onCreateClick}
    />
  );
}
