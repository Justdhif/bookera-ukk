import { useTranslations } from "next-intl";
import Link from "next/link";
import { SaveListItem } from "@/types/save";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SaveCover from "./SaveCover";

interface CollapsedSaveItemProps {
  save: SaveListItem;
}

/** Single save item (thumbnail) untuk collapsed sidebar mode */
export default function CollapsedSaveItem({ save }: CollapsedSaveItemProps) {
    const t = useTranslations("public");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/saves/${save.slug}`}
          className="w-12 h-16 rounded-lg overflow-hidden shrink-0 block hover:ring-2 hover:ring-primary transition-all"
        >
          <SaveCover
            cover={save.cover}
            name={save.name}
            className="w-full h-full"
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="font-medium">{save.name}</p>
        <p className="text-xs text-muted-foreground">
          {save.total_books} {save.total_books === 1 ? t("book") : t("books")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
