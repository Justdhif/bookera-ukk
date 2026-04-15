import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, DollarSign, Loader2 } from "lucide-react";
interface ReturnActionsCardProps {
  hasUnpaidFines: boolean;
  onFinishFines: () => void;
  finishingFines: boolean;
}
export function ReturnActionsCard({
  hasUnpaidFines,
  onFinishFines,
  finishingFines,
}: ReturnActionsCardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {hasUnpaidFines && (
            <Button
              variant="submit"
              onClick={onFinishFines}
              disabled={finishingFines}
              loading={finishingFines}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              {!finishingFines && <DollarSign className="h-4 w-4 mr-2" />}
              Finish Fines
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
