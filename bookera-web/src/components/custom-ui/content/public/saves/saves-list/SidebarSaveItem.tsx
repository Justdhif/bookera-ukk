import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SaveListItem } from "@/types/save";
import SaveCover from "./SaveCover";

interface SidebarSaveItemProps {
  save: SaveListItem;
}

/** Single save item untuk sidebar mode (full) */
export default function SidebarSaveItem({ save }: SidebarSaveItemProps) {
    const t = useTranslations("public");
  return (
    <Link
      href={`/saves/${save.slug}`}
      className="group flex gap-3 rounded-xl p-2.5 transition-all bg-muted/40 dark:bg-white/8 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 border border-border dark:border-white/10 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 hover:shadow-sm"
    >
      <SaveCover
        cover={save.cover}
        name={save.name}
        className="w-12 h-16 rounded-lg shrink-0 shadow-sm ring-1 ring-border dark:ring-white/15 overflow-hidden"
      />

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <p className="font-medium text-foreground dark:text-white text-[13px] line-clamp-2 leading-snug">
          {save.name}
        </p>
        <p className="text-[11px] text-muted-foreground dark:text-white/55">
          {save.total_books} {save.total_books === 1 ? t("book") : t("books")}
        </p>
      </div>

      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-3.5 w-3.5 text-brand-primary dark:text-brand-primary-light" />
      </div>
    </Link>
  );
}
