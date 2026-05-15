"use client";
import { Borrow } from "@/types/borrow";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScaleIn } from "@/components/custom-ui/motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Hash, User, BookOpen, Calendar } from "lucide-react";
import DetailButton from "@/components/custom-ui/button/DetailButton";

interface BorrowCardProps {
  borrow: Borrow;
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

export function BorrowCard({ borrow, index = 0 }: BorrowCardProps) {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");
  const tp = useTranslations("public");
  const router = useRouter();

  const borrowDetails = borrow.borrow_details || [];
  const requestDetails = borrow.borrow_request?.borrow_request_details || [];
  const groupedBooks = borrow.grouped_details || [];
  
  const totalItemsCount =
    borrowDetails.length > 0 
      ? borrowDetails.length 
      : (requestDetails.length > 0 ? requestDetails.length : (groupedBooks.reduce((acc, curr) => acc + (curr.quantity || 1), 0)));

  const profile = borrow.user?.profile;
  const borrowerName = profile?.full_name || borrow.user?.email || "-";
  const returnDate = new Date(borrow.return_date);
  const isOverdue = borrow.status === "open" && returnDate < new Date();

  return (
    <ScaleIn delay={index * 0.06}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`borrow-${borrow.id}-${index}`}
          className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md mb-4 px-0 border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-5 hover:no-underline [&>svg]:mr-0 [&>svg]:h-5 [&>svg]:w-5 cursor-pointer">
            <div className="flex items-start gap-4 text-left">
              <UserAvatar
                name={borrowerName}
                avatar={profile?.avatar}
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground truncate">
                    {borrowerName}
                  </p>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-full">
                      #{borrow.borrow_code}
                    </span>
                    <BorrowStatusBadge
                      status={borrow.status}
                      className="h-5 px-2 text-[9px] font-black uppercase tracking-wider"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {tp("borrowDateLabel") ?? "Dipinjam"}:{" "}
                      <span className="text-foreground font-medium">
                        {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {tp("returnDateLabel") ?? "Jatuh tempo"}:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          isOverdue ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {format(returnDate, "dd MMM yyyy")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="mx-5 h-px bg-border/60" />
            <div className="p-5 space-y-6">
              {/* Section 1: User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {borrow.user?.email && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</span>
                       <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="truncate">{borrow.user.email}</span>
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

              {/* Section 2: Books */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                  {t("booksBorrowed")}
                </h4>
                <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
                  {groupedBooks.map((item: any) => {
                    const { book, quantity } = item;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors"
                      >
                        {book?.cover_image ? (
                          <div className="relative shrink-0 shadow-sm">
                            <Image
                              src={book.cover_image}
                              alt={book.title}
                              width={40}
                              height={56}
                              className="h-14 w-10 rounded-md object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50">
                            <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-foreground line-clamp-1">
                            {book?.title || "-"}
                            {quantity > 1 && (
                              <span className="ml-2 text-[10px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                                x{quantity}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight truncate">
                            {book?.author || "-"}
                          </p>
                          {book?.isbn && (
                            <p className="text-[10px] text-muted-foreground/50 font-mono tracking-tighter">
                              ISBN: {book.isbn}
                            </p>
                          )}
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
                  {t("totalBooks")}
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-brand-primary">
                {t("bookUnit", { count: totalItemsCount })}
              </p>
            </div>

            <Link href={`/admin/borrows/${borrow.borrow_code}`}>
              <DetailButton />
            </Link>
          </div>
        </AccordionItem>
      </Accordion>
    </ScaleIn>
  );
}
