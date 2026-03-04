"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { SaveListItem } from "@/types/save";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveCardProps {
  save: SaveListItem;
  onClick?: () => void;
}

export default function SaveCard({ save, onClick }: SaveCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/saves/${save.slug}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          
          <div className="shrink-0">
            {save.cover ? (
              <div className="w-16 h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={save.cover}
                  alt={save.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-20 rounded bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                <BookMarked className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
              {save.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {save.total_books} {save.total_books === 1 ? 'book' : 'books'}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(save.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
