"use client";

import { Save } from "@/types/save";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash, BookMarked } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface SaveHeaderProps {
  save: Save;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function SaveHeader({
  save,
  onEdit,
  onDelete,
  onBack,
}: SaveHeaderProps) {
  const t = useTranslations('collections.detail');
  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {save.cover ? (
          <div className="w-full lg:w-64 shrink-0">
            <div className="aspect-3/4 relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={save.cover}
                alt={save.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : save.covers && save.covers.length > 0 ? (
          <div className="w-full lg:w-64 shrink-0">
            <div className="aspect-3/4 relative rounded-lg overflow-hidden shadow-lg">
              <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full bg-muted">
                {save.covers.slice(0, 4).map((cover, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={cover || "/placeholder-book.png"}
                      alt={`Book ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {save.covers.length < 4 &&
                  Array.from({ length: 4 - save.covers.length }).map(
                    (_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="bg-muted flex items-center justify-center"
                      >
                        <BookMarked className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    ),
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-64 shrink-0">
            <div className="aspect-3/4 relative rounded-lg overflow-hidden shadow-lg bg-muted flex items-center justify-center">
              <BookMarked className="h-16 w-16 text-muted-foreground/30" />
            </div>
          </div>
        )}

        <div className="flex flex-col justify-end flex-1">
          <p className="text-muted-foreground text-sm">{t('collection')}</p>
          <h1 className="lg:text-6xl sm:text-4xl font-bold wrap-break-word">
            {save.name}
          </h1>
          {save.description && (
            <p className="text-muted-foreground text-sm lg:mt-2">
              {save.description}
            </p>
          )}
          <div className="lg:mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{save.total_books} books</span>
            <span>•</span>
            <span>
              {t('created')} {format(new Date(save.created_at), "MMM d, yyyy")}
            </span>
          </div>
          <div className="mt-2 flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="h-8 gap-1.5"
            >
              <Trash className="h-3.5 w-3.5" />
              {t('delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
