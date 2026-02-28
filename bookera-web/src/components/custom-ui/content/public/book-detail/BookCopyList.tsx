"use client";

import { BookCopy } from "@/types/book-copy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BorrowDialog from "./BorrowDialog";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
export default function BookCopyList({ copies }: { copies: BookCopy[] }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated } = useAuthStore();

  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  if (!copies || copies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{"No book copies available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {copies.map((copy) => (
        <div
          key={copy.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{"Copy Code"}: {copy.copy_code}</p>
              <Badge 
                variant={
                  copy.status === "available" 
                    ? "default" 
                    : copy.status === "borrowed" 
                    ? "destructive" 
                    : "secondary"
                }
                className={
                  copy.status === "available"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : copy.status === "borrowed"
                    ? "bg-orange-800 text-white hover:bg-orange-700"
                    : copy.status === "lost"
                    ? "bg-red-800 text-white hover:bg-red-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }
              >
                {copy.status === "available"
                  ? "Available"
                  : copy.status === "borrowed"
                  ? "Borrowed"
                  : copy.status === "lost"
                  ? "Lost"
                  : copy.status === "damaged"
                  ? "Damaged"
                  : copy.status}
              </Badge>
            </div>
            {copy.status && (
              <p className="text-sm text-muted-foreground">
                {"Book Condition"}: {copy.status === "available"
                  ? "Available"
                  : copy.status === "borrowed"
                  ? "Borrowed"
                  : copy.status === "lost"
                  ? "Lost"
                  : copy.status === "damaged"
                  ? "Damaged"
                  : copy.status}
              </p>
            )}
          </div>

          {copy.status === "available" && (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push(`/login?redirect=${pathname}`);
                  return;
                }

                setSelectedCopy(copy);
              }}
              className="w-full sm:w-auto"
            >
              {"Borrow Book"}
            </Button>
          )}
        </div>
      ))}

      <BorrowDialog copy={selectedCopy} onClose={() => setSelectedCopy(null)} />
    </div>
  );
}
