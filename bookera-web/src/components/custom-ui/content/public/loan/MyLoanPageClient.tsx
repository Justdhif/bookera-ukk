"use client";

import { useEffect, useState } from "react";
import { loanService } from "@/services/loan.service";
import { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom-ui/EmptyState";
import { ReturnDialog } from "./ReturnDialog";
import { PackageX, BookOpen, Clock, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';

export default function MyLoanPageClient() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    loan: Loan | null;
  }>({ open: false, loan: null });
  const tLoans = useTranslations('loans');
  const tStatus = useTranslations('status');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.data.data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (loan: Loan) => {
    const statusConfig: Record<
      Loan["status"],
      { variant: any; label: string; className?: string }
    > = {
      pending: { variant: "secondary", label: tStatus('pending'), className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      waiting: { variant: "default", label: tStatus('waiting'), className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
      borrowed: { variant: "default", label: tStatus('borrowed'), className: "bg-green-100 text-green-800 hover:bg-green-100" },
      returned: { variant: "outline", label: tStatus('returned'), className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
      rejected: { variant: "destructive", label: tStatus('rejected') },
      late: { variant: "destructive", label: tStatus('late') },
    };

    return (
      <Badge variant={statusConfig[loan.status]?.variant || "secondary"} className={statusConfig[loan.status]?.className}>
        {statusConfig[loan.status]?.label || loan.status}
      </Badge>
    );
  };

  const getApprovalBadge = (loan: Loan) => {
    const approvalConfig: Record<
      Loan["approval_status"],
      { variant: any; label: string; className?: string } | null
    > = {
      pending: { variant: "secondary", label: tStatus('waitingApproval'), className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      approved: { variant: "default", label: tStatus('approved'), className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
      rejected: { variant: "destructive", label: tStatus('statusRejected') },
    };

    const config = approvalConfig[loan.approval_status];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const canReturn = (loan: Loan) => {
    // Cannot return if there's already a pending return
    const hasPending = hasPendingReturn(loan);
    return (
      loan.status === "borrowed" && 
      loan.approval_status === "approved" &&
      !hasPending
    );
  };

  const hasPendingReturn = (loan: Loan) => {
    // Check if there's a pending return request for this loan
    return loan.book_returns?.some(
      (bookReturn) => bookReturn.approval_status === "pending"
    ) || false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tLoans('myLoans')}</h1>
          <p className="text-sm text-muted-foreground">
            {tLoans('manageLoans')}
          </p>
        </div>
      </div>

      {loans.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-16 w-16" />}
          title={tLoans('noLoans')}
          description={tLoans('noLoansDesc')}
        />
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 bg-muted/30">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold">
                      {tLoans('loanNumber')}{loan.id}
                    </span>
                    {getStatusBadge(loan)}
                    {getApprovalBadge(loan)}
                    {hasPendingReturn(loan) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tLoans('returnWaitingApproval')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(loan.loan_date).toLocaleDateString("id-ID")}
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <Calendar className="h-3 w-3" />
                      {tLoans('due')}: {new Date(loan.due_date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
                {canReturn(loan) && (
                  <Button
                    variant="submit"
                    size="sm"
                    onClick={() => setReturnDialog({ open: true, loan })}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <PackageX className="h-4 w-4" />
                    {tLoans('requestReturn')}
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  {tLoans('borrowedBooks')} ({loan.loan_details.length}):
                </div>
                <div className="grid gap-2">
                  {loan.loan_details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-start gap-3 border rounded-lg p-3 bg-muted/20"
                    >
                      <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {detail.book_copy.book.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tLoans('code')}: {detail.book_copy.copy_code} • {tLoans('status')}: {detail.book_copy.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReturnDialog
        open={returnDialog.open}
        onOpenChange={(open) =>
          setReturnDialog({ open, loan: open ? returnDialog.loan : null })
        }
        loan={returnDialog.loan}
        onSuccess={fetchLoans}
      />
    </div>
  );
}
