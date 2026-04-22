"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";
import EmptyState from "@/components/custom-ui/EmptyState";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import { BookOpen, Eye, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: Book[];
  onDelete: (id: number) => void;
}

export function BookTable({ data, onDelete }: Props) {
  const t = useTranslations("book");

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noBooksFound")}
        description={t("noBooksFoundDesc")}
        icon={<BookOpen />}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">
              {t("noCol")}
            </TableHead>
            <TableHead className="w-24 font-semibold">{t("cover")}</TableHead>
            <TableHead className="font-semibold">{t("title_col")}</TableHead>
            <TableHead className="font-semibold">{t("author")}</TableHead>
            <TableHead className="font-semibold">{t("publisher")}</TableHead>
            <TableHead className="font-semibold">{t("status")}</TableHead>
            <TableHead className="font-semibold text-right pr-6">
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((book, index) => (
            <TableRow
              key={book.id}
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                {book.cover_image ? (
                  <Image
                    src={book.cover_image}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm"
                    width={300}
                    height={400}
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-foreground leading-none">
                    {book.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all duration-300",
                        book.available_copies && book.available_copies > 0
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          book.available_copies && book.available_copies > 0
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        )}
                      />
                      {book.available_copies || 0}/{book.total_copies || 0}{" "}
                      {t("available")}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {book.authors && book.authors.length > 0
                    ? book.authors.map((a) => a.name).join(", ")
                    : book.author || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {book.publishers && book.publishers.length > 0
                    ? book.publishers.map((p) => p.name).join(", ")
                    : book.publisher || "-"}
                </span>
              </TableCell>
              <TableCell>
                <ActiveStatusBadge isActive={book.is_active} />
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <Link href={`/admin/books/${book.slug}`}>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t("view")}</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(book.id)}
                    className="h-8 gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("delete")}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
