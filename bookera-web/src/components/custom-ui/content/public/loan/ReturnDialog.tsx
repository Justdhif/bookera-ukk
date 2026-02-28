"use client";

import { useState } from "react";
import { bookReturnService } from "@/services/book-return.service";
import { Loan } from "@/types/loan";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageX, Loader2 } from "lucide-react";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
  onSuccess: () => void;
}

export function ReturnDialog({
  open,
  onOpenChange,
  loan,
  onSuccess,
}: ReturnDialogProps) {
  const [loading, setLoading] = useState(false);
  const [bookConditions, setBookConditions] = useState<
    Record<number, "good" | "damaged">
  >({});

  const handleSubmit = async () => {
    if (!loan) return;
    const allBooksHaveCondition = loan.loan_details.every(
      (detail) => bookConditions[detail.book_copy_id]
    );

    if (!allBooksHaveCondition) {
      toast.error("selectConditionForAllBooks");
      return;
    }

    setLoading(true);
    try {
      const copies = loan.loan_details.map((detail) => ({
        book_copy_id: detail.book_copy_id,
        condition: bookConditions[detail.book_copy_id] || "good",
      }));

      const response = await bookReturnService.create(loan.id, { copies });
      toast.success(
        response.data.message || "returnRequestCreated"
      );
      onOpenChange(false);
      setBookConditions({});
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "failedToCreateReturnRequest"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (bookCopyId: number, condition: string) => {
    setBookConditions((prev) => ({
      ...prev,
      [bookCopyId]: condition as "good" | "damaged",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageX className="h-5 w-5" />
            {"Request Return"}
          </DialogTitle>
          <DialogDescription>
            {"Please select condition for all books"} {"If the book is lost, use the 'Report Loss' button on the loan list."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loan?.loan_details.map((detail) => (
            <div
              key={detail.id}
              className="flex flex-col gap-3 p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{detail.book_copy.book.title}</p>
                <p className="text-sm text-muted-foreground">
                  {"Copy Code"}: {detail.book_copy.copy_code}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`condition-${detail.id}`}>
                  {"Book Condition"}
                </Label>
                <Select
                  value={bookConditions[detail.book_copy_id] || ""}
                  onValueChange={(value) =>
                    handleConditionChange(detail.book_copy_id, value)
                  }
                >
                  <SelectTrigger id={`condition-${detail.id}`}>
                    <SelectValue placeholder={"Select book condition"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{"Good - No damage"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="damaged">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span>{"Damaged - Minor damage"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {"Cancel"}
          </Button>
          <Button
            variant="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {"Processing..."}
              </>
            ) : (
              "Submit Return Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
