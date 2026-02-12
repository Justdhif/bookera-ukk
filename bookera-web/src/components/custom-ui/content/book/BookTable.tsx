"use client";

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
import { BookOpen, Eye, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  data: Book[];
  onDelete: (id: number) => void;
}

export function BookTable({ data, onDelete }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.books');
  const tCommon = useTranslations('admin.common');

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('noBooks')}
        description={t('noBooksDesc')}
        icon={<BookOpen className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">#</TableHead>
            <TableHead className="w-24 font-semibold">{t('cover')}</TableHead>
            <TableHead className="font-semibold">{t('title_col')}</TableHead>
            <TableHead className="font-semibold">{t('author')}</TableHead>
            <TableHead className="font-semibold">{t('isbn')}</TableHead>
            <TableHead className="font-semibold">{t('publisher')}</TableHead>
            <TableHead className="font-semibold">{t('year')}</TableHead>
            <TableHead className="font-semibold text-center">{tCommon('copies')}</TableHead>
            <TableHead className="font-semibold">{t('status')}</TableHead>
            <TableHead className="font-semibold text-right pr-6">{tCommon('actions')}</TableHead>
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
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">{book.title}</span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">{book.author}</span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground font-mono text-sm">
                {book.isbn || "-"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {book.publisher || "-"}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {book.publication_year || "-"}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex flex-col gap-1 items-center">
                <Badge 
                  variant={book.available_copies && book.available_copies > 0 ? "default" : "secondary"}
                  className={book.available_copies && book.available_copies > 0 ? "bg-brand-primary hover:bg-brand-primary-dark text-white text-xs" : "text-xs"}
                >
                  {book.available_copies || 0}/{book.total_copies || 0}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {tCommon('available')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant={book.is_active ? "default" : "secondary"}
                className={book.is_active ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}
              >
                {book.is_active ? tCommon('active') : tCommon('inactive')}
              </Badge>
            </TableCell>
            <TableCell className="pr-6">
              <div className="flex justify-end items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/books/${book.slug}`)}
                  className="h-8 gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tCommon('view')}</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(book.id)}
                  className="h-8 gap-1"
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tCommon('delete')}</span>
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
