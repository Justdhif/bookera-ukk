"use client";
import { useRouter } from "next/navigation";

import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen } from "lucide-react";
export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="relative">
        <img
          src={book.cover_image_url ?? "/placeholder.png"}
          className="aspect-3/4 object-cover rounded w-full"
        />
        {book.total_copies !== undefined && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge 
              variant={book.available_copies && book.available_copies > 0 ? "default" : "secondary"}
              className={book.available_copies && book.available_copies > 0 ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs" : "text-xs"}
            >
              {book.available_copies || 0}/{book.total_copies} {"Available"}
            </Badge>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold line-clamp-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/books/${book.slug}`)}
        className="w-full"
      >
        {"Detail"}
      </Button>
    </div>
  );
}
