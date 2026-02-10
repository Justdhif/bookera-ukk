"use client";

import { useState, useEffect } from "react";
import { bookReturnService } from "@/services/book-return.service";
import { loanService } from "@/services/loan.service";
import { lostBookService } from "@/services/lost-book.service";
import { Loan } from "@/types/loan";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageCheck, Search } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Input } from "@/components/ui/input";
import { ReturnCard } from "./ReturnCard";
import { ReturnSkeletonCard } from "./ReturnSkeletonCard";
import { useTranslations } from "next-intl";

export default function ReturnClient() {
  const t = useTranslations('admin.returns');
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Get all loans with status "checking" or "returned"
      const loansRes = await loanService.getAll(searchQuery);
      const filteredLoans = loansRes.data.data.filter(
        (loan) => loan.status === "checking" || loan.status === "returned"
      );
      setAllLoans(filteredLoans);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAllData();
  };

  const handleFinished = async (returnId: number) => {
    setActionLoading(returnId);
    try {
      // Find the loan for this return
      const loan = allLoans.find((l) => 
        l.book_returns?.some((r) => r.id === returnId)
      );
      
      // Check if this loan has any lost books
      const hasLostBooks = loan?.lost_books && loan.lost_books.length > 0;
      
      if (hasLostBooks && loan?.lost_books) {
        // Use lost book finish endpoint to update loan status to "lost"
        const lostBookId = loan.lost_books[0].id;
        const response = await lostBookService.finish(lostBookId);
        toast.success(
          response.data.message || t('lostBookProcessComplete'),
        );
      } else {
        // Normal return approval - updates loan status to "returned"
        const response = await bookReturnService.approveReturn(returnId);
        toast.success(
          response.data.message || t('completeSuccess'),
        );
      }
      
      fetchAllData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t('completeError'),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const renderLoanCards = (loans: Loan[], showActions = true) => {
    if (loans.length === 0) {
      return (
        <EmptyState
          icon={<PackageCheck className="h-16 w-16" />}
          title={t('noReturnsYet')}
          description={t('noReturnsDesc')}
        />
      );
    }

    return (
      <div className="grid gap-4">
        {loans.map((loan) => {
          // Get the latest return for this loan
          const latestReturn = loan.book_returns?.[0];
          
          // Skip loan if no return record (shouldn't happen for checking/returned status)
          if (!latestReturn) {
            console.warn(`Loan #${loan.id} has status ${loan.status} but no book_returns`);
            return null;
          }

          return (
            <ReturnCard
              key={latestReturn.id}
              bookReturn={latestReturn}
              loan={loan}
              showActions={showActions}
              actionLoading={actionLoading}
              onFinished={handleFinished}
            />
          );
        })}
      </div>
    );
  };

  // Filter loans by status
  const checkingLoans = allLoans.filter((loan) => loan.status === "checking");
  const returnedLoans = allLoans.filter((loan) => loan.status === "returned");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('returnManagement')}</h1>
          <p className="text-muted-foreground">
            {t('manageReturnApproval')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchReturnUserTitle')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          {t('search')}
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('allReturns')} ({allLoans.length})</TabsTrigger>
          <TabsTrigger value="checking">
            {t('checking')} ({checkingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            {t('returned')} ({returnedLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{t('allReturns')}</h2>
              <p className="text-muted-foreground">
                {t('noReturnsDesc')}
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(allLoans)
            )}
          </div>
        </TabsContent>

        <TabsContent value="checking" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{t('checking')}</h2>
              <p className="text-muted-foreground">
                {t('checkingReturnsDesc')}
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(checkingLoans)
            )}
          </div>
        </TabsContent>

        <TabsContent value="returned" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{t('returned')}</h2>
              <p className="text-muted-foreground">
                {t('returnedDesc')}
              </p>
            </div>
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReturnSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              renderLoanCards(returnedLoans, false)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
