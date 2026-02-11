"use client";

import { useEffect, useState } from "react";
import { SaveListItem } from "@/types/save";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { BookMarked } from "lucide-react";
import { useRouter } from "next/navigation";
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
      router.push(`/saves/${save.id}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Cover Images Grid */}
          <div className="shrink-0">
            {save.covers.length > 0 ? (
              <div className={cn(
                "grid gap-1",
                save.covers.length === 1 && "grid-cols-1",
                save.covers.length === 2 && "grid-cols-2",
                save.covers.length >= 3 && "grid-cols-2"
              )}>
                {save.covers.slice(0, 4).map((cover, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "rounded overflow-hidden bg-gray-100 dark:bg-gray-800",
                      save.covers.length === 1 ? "w-16 h-20" : "w-8 h-10"
                    )}
                  >
                    <img
                      src={cover || '/placeholder-book.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-16 h-20 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookMarked className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Save Info */}
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
