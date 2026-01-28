"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { loanService } from "@/services/loan.service";
import { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyLoanHighlight() {
  const { isAuthenticated } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selected, setSelected] = useState<Loan | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    loanService.getMyLoans().then((res) => {
      setLoans(res.data.data);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated || loans.length === 0) return null;

  const activeLoan = loans[0];

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Peminjaman Saya</h3>
          </div>

          <Button
            variant="brand"
            onClick={() => router.push(`/my-loans`)}
          >
            Lihat Semua
          </Button>
        </CardHeader>

        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {activeLoan.loan_details.length} buku dipinjam
            </p>
            <p className="text-xs">
              Jatuh tempo:{" "}
              <span className="font-medium">
                {new Date(activeLoan.due_date).toLocaleDateString()}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge>{activeLoan.status}</Badge>
            <Button size="sm" onClick={() => setSelected(activeLoan)}>
              Detail
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Peminjaman</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <p className="text-sm">
                Jatuh Tempo:{" "}
                <strong>
                  {new Date(selected.due_date).toLocaleDateString()}
                </strong>
              </p>

              <div className="space-y-2">
                {selected.loan_details.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div>
                      <p className="font-medium">{d.book_copy.book.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Copy: {d.book_copy.copy_code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant="brand"
                onClick={() => router.push(`/my-loans`)}
              >
                Lihat Semua
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
