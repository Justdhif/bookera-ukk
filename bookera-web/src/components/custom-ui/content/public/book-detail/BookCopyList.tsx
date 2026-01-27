"use client";

import { BookCopy } from "@/types/book-copy";
import { Button } from "@/components/ui/button";
import BorrowDialog from "./BorrowDialog";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";

export default function BookCopyList({ copies }: { copies: BookCopy[] }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated } = useAuthStore();

  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Daftar Copy</h2>

      {copies.map((copy) => (
        <div
          key={copy.id}
          className="flex justify-between items-center border p-3 rounded"
        >
          <div>
            <p>Kode Copy: {copy.copy_code}</p>
            <p className="text-sm text-muted-foreground">
              Status: {copy.status}
            </p>
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
            >
              Borrow
            </Button>
          )}
        </div>
      ))}

      <BorrowDialog copy={selectedCopy} onClose={() => setSelectedCopy(null)} />
    </div>
  );
}
