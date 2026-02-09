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
        <p>Tidak ada salinan buku yang tersedia</p>
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
              <p className="font-medium">Kode: {copy.copy_code}</p>
              <Badge 
                variant={copy.status === "borrowed" ? "destructive" : "default"}
              >
                {copy.status === "borrowed" ? "Dipinjam" : "Tersedia"}
              </Badge>
            </div>
            {copy.condition && (
              <p className="text-sm text-muted-foreground">
                Kondisi: {copy.condition}
              </p>
            )}
          </div>

          {copy.status !== "borrowed" && (
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
              Pinjam Buku
            </Button>
          )}
        </div>
      ))}

      <BorrowDialog copy={selectedCopy} onClose={() => setSelectedCopy(null)} />
    </div>
  );
}
