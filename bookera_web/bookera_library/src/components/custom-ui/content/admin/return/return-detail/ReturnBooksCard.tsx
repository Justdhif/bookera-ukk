import { BookReturn, BookReturnDetail } from "@/types/book-return";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";

interface ReturnBooksCardProps {
  bookReturn: BookReturn;
  conditions: Record<number, "good" | "damaged" | "lost">;
  onConditionChange: (
    detailId: number,
    condition: "good" | "damaged" | "lost",
  ) => void;
  onSaveConditions: () => void;
  savingConditions: boolean;
  isLocked: boolean;
}

function ConditionBadge({
  condition,
}: {
  condition: "good" | "damaged" | "lost";
}) {
  const config = {
    good: {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      label: "Good",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    damaged: {
      icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      label: "Damaged",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    lost: {
      icon: <XCircle className="h-3 w-3 mr-1" />,
      label: "Lost",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };
  const c = config[condition];
  return (
    <Badge className={c.className}>
      <span className="flex items-center">
        {c.icon}
        {c.label}
      </span>
    </Badge>
  );
}

export function ReturnBooksCard({
  bookReturn,
  conditions,
  onConditionChange,
  onSaveConditions,
  savingConditions,
  isLocked,
}: ReturnBooksCardProps) {
  const bookCount = bookReturn.details?.length ?? 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Returned Books ({bookCount})
        </CardTitle>
        <CardDescription>
          {isLocked
            ? "Book conditions recorded at the time of return"
            : "Assign the condition for each returned book"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookReturn.details?.map((detail: BookReturnDetail) => (
          <div
            key={detail.id}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {detail.book_copy?.book?.title || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                Copy Code:
                <span className="font-mono">{detail.book_copy?.copy_code}</span>
              </p>
            </div>
            {isLocked ? (
              <ConditionBadge condition={detail.condition} />
            ) : (
              <Select
                value={conditions[detail.id] ?? detail.condition}
                onValueChange={(val) =>
                  onConditionChange(
                    detail.id,
                    val as "good" | "damaged" | "lost",
                  )
                }
              >
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        {!isLocked && (
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="submit"
              onClick={onSaveConditions}
              disabled={savingConditions}
            >
              {savingConditions && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Save Conditions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
