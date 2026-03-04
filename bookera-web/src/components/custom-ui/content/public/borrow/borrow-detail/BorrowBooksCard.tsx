import { Borrow } from "@/types/borrow";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface BorrowBooksCardProps {
  borrow: Borrow;
}

export function BorrowBooksCard({ borrow }: BorrowBooksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Borrowed Books ({borrow.borrow_details?.length || 0})
        </CardTitle>
        <CardDescription>Books included in this borrow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {borrow.borrow_details?.map((detail) => (
            <div
              key={detail.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {detail.book_copy?.book?.title || "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted-foreground">
                        Code:{" "}
                        <span className="font-mono">{detail.book_copy?.copy_code}</span>
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {detail.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {detail.note && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    <span className="font-medium">Note: </span>
                    {detail.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
