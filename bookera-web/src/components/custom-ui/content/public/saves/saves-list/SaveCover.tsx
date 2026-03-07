import { BookMarked } from "lucide-react";

interface SaveCoverProps {
  cover?: string | null;
  name: string;
  className?: string;
}

/** Thumbnail book cover: image or BookMarked icon as fallback */
export default function SaveCover({ cover, name, className }: SaveCoverProps) {
  if (cover) {
    return (
      <div className={className}>
        <img src={cover} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-linear-to-br from-brand-primary/15 to-brand-primary/5 dark:from-brand-primary/25 dark:to-brand-primary/10 ring-1 ring-brand-primary/20 dark:ring-brand-primary/25`}
    >
      <BookMarked className="h-5 w-5 text-brand-primary dark:text-brand-primary-light" />
    </div>
  );
}
