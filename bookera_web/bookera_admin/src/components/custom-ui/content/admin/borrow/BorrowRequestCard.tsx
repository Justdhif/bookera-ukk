"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScaleIn } from "@/components/custom-ui/motion";
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
  Hash,
  Tag,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BorrowRequestCardProps {
  req: BorrowRequest;
  index?: number;
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <Avatar className="h-12 w-12 shrink-0 rounded-xl bg-brand-primary/10 text-brand-primary border-none">
      {avatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback className="font-semibold">
        {initials || <User className="h-6 w-6" />}
      </AvatarFallback>
    </Avatar>
  );
}

export function BorrowRequestCard({ req, index = 0 }: BorrowRequestCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const profile = req.user?.profile;
  const requesterName = profile?.full_name || req.user?.email || "—";

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`request-${req.id}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <UserAvatar
                name={requesterName}
                avatar={profile?.avatar}
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground truncate">
                    {requesterName}
                  </p>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">
                      #{req.id}
                    </span>
                    <BorrowStatusBadge status={req.approval_status} className="h-5 px-2 text-[9px] font-black uppercase tracking-wider" />
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {format(new Date(req.borrow_date), "dd MMM")} → {format(new Date(req.return_date), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5 space-y-6">
              {/* Section 1: User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {req.user?.email && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="truncate">{req.user.email}</span>
                       </div>
                    </div>
                 )}
                 {profile?.phone_number && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{profile.phone_number}</span>
                       </div>
                    </div>
                 )}
                 {profile?.identification_number && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID Number</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{profile.identification_number}</span>
                       </div>
                    </div>
                 )}
              </div>

              {/* Section 2: Requested Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("requestedBooks")} ({req.borrow_request_details?.length || 0})
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {req.borrow_request_details?.map((detail, i) => {
                    const book = detail.book;
                    const authors = book?.authors?.map(a => a.name).join(", ") || book?.author || tCommon("noData");
                    
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="relative w-10 h-14 shrink-0 shadow-sm">
                          <Image
                            src={book?.cover_image || "/placeholder.png"}
                            alt={book?.title || "Book"}
                            fill
                            className="object-cover rounded-md"
                            unoptimized
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {book?.title || tCommon("noData")}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                            <span className="truncate max-w-40">{authors}</span>
                            {book?.available_copies !== undefined && (
                               <>
                                 <span className="opacity-40">•</span>
                                 <span className={book.available_copies > 0 ? "text-emerald-600" : "text-destructive"}>
                                   {book.available_copies} {tCommon("available")}
                                 </span>
                               </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </AccordionContent>

          <div className="mx-5 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Buku
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-brand-primary">
                {req.borrow_request_details?.length || 0}
              </p>
            </div>

            <Link href={`/admin/borrows/requests/${req.id}`}>
              <Button
                variant="outline"
                className="rounded-xl font-bold h-9 gap-1.5"
              >
                <Eye className="h-4 w-4" />
                {tCommon("view")}
              </Button>
            </Link>
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
