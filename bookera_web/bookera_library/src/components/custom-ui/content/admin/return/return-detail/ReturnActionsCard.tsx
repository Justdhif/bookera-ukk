import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, DollarSign, Loader2 } from "lucide-react";
interface ReturnActionsCardProps {
  hasUnpaidFines: boolean;
  onFinishFines: () => void;
  finishingFines: boolean;
  onFinishBorrow: () => void;
  finishingBorrow: boolean;
}
export function ReturnActionsCard({
  hasUnpaidFines,
  onFinishFines,
  finishingFines,
  onFinishBorrow,
  finishingBorrow,
}: ReturnActionsCardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {hasUnpaidFines && (
            <Button
              variant="submit"
              onClick={onFinishFines}
              disabled={finishingFines || finishingBorrow}
              loading={finishingFines}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              {!finishingFines && <DollarSign className="h-4 w-4 mr-2" />}
              Finish Fines
            </Button>
          )}
          <Button
            onClick={onFinishBorrow}
            disabled={hasUnpaidFines || finishingBorrow || finishingFines}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            title={
              hasUnpaidFines
                ? "Settle all fines before closing the borrow"
                : undefined
            }
            variant="submit"
            loading={finishingBorrow}
          >
            {!finishingBorrow && <CheckCircle2 className="h-4 w-4 mr-2" />}
            Finish Borrow
          </Button>
        </div>
        {hasUnpaidFines && (
          <p className="text-xs text-muted-foreground text-right mt-2">
            * "Finish Borrow" is enabled only after all fines are settled
          </p>
        )}
      </CardContent>
    </Card>
  );
}
