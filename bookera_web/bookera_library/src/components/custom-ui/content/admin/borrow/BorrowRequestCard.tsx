import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BorrowRequest } from "@/types/borrow-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import {
  BookOpen,
  Calendar,
  User,
  Eye,
  ArrowRight,
  Hash,
  Tag,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface BorrowRequestCardProps {
  req: BorrowRequest;
}

export function BorrowRequestCard({ req }: BorrowRequestCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  
  return (
    <Card>
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-primary" />
                {t("requestHash")}{req.id}
              </CardTitle>
              <BorrowStatusBadge status={req.approval_status} />
            </div>
            <CardDescription className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                {req.user?.profile?.full_name || req.user?.email || "—"}
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {format(new Date(req.borrow_date), "dd MMM")} → {format(new Date(req.return_date), "dd MMM yyyy")}
              </span>
            </CardDescription>
          </div>

          <div className="flex gap-2 items-center self-end md:self-center">

            <Link href={`/admin/borrow-requests/${req.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tCommon("view")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t("requestedBooks")} <span className="text-primary">({req.borrow_request_details?.length || 0})</span>
            </h4>
          </div>
          
          <div className="grid gap-4">
            {req.borrow_request_details?.map((detail, i) => {
              const book = detail.book;
              const authors = book?.authors?.map(a => a.name).join(", ") || book?.author || tCommon("noData");
              
              return (
                <div
                  key={i}
                  className="group/item flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-premium transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  
                  <div className="relative w-24 h-32 sm:w-20 sm:h-28 shrink-0 shadow-lg group-hover/item:scale-105 transition-transform duration-300 z-10">
                    <Image
                      src={book?.cover_image || "/placeholder.png"}
                      alt={book?.title || "Book"}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2 z-10 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-base sm:text-lg tracking-tight truncate group-hover/item:text-primary transition-colors">
                          {book?.title || tCommon("noData")}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-30">{authors}</span>
                          </div>
                          {book?.publishers && book.publishers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate max-w-30">{book.publishers[0].name}</span>
                            </div>
                          )}
                          {book?.isbn && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span className="truncate max-w-25">{book.isbn}</span>
                            </div>
                          )}
                          {book?.publication_year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{book.publication_year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge 
                          variant={book?.available_copies && book.available_copies > 0 ? "default" : "secondary"}
                          className={`text-[10px] h-6 px-3 shadow-sm ${book?.available_copies && book.available_copies > 0 ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                        >
                          {book?.available_copies || 0} {tCommon("available")}
                        </Badge>
                      </div>
                    </div>
                    
                    {book?.categories && book.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {book.categories.slice(0, 3).map((cat) => (
                          <Badge 
                            key={cat.id} 
                            variant="outline" 
                            className="bg-primary/5 text-[10px] py-0 px-2.5 h-6 border-primary/20 text-primary/80 font-medium"
                          >
                            <Tag className="h-3 w-3 mr-1.5" />
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors" />
    </Card>
  );
}
