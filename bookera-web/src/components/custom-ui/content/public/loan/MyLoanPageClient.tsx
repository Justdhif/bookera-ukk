"use client";

import { useEffect, useState } from "react";
import { loanService } from "@/services/loan.service";
import { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyLoanPageClient() {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    loanService.getMyLoans().then((res) => {
      setLoans(res.data.data);
    });
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Peminjaman Saya</h1>

      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader className="flex justify-between flex-row">
            <span>
              Jatuh Tempo: {new Date(loan.due_date).toLocaleDateString()}
            </span>
            <Badge>{loan.status}</Badge>
          </CardHeader>

          <CardContent className="space-y-2">
            {loan.loan_details.map((d) => (
              <div key={d.id} className="border rounded p-2 text-sm">
                {d.book_copy.book.title} — {d.book_copy.copy_code}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
