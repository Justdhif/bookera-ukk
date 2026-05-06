import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FadeUp } from "@/components/custom-ui/motion";

interface BorrowRequestDateCardProps {
  borrowDate: Date | undefined;
  setBorrowDate: (date: Date | undefined) => void;
  returnDate: Date | undefined;
}

export function BorrowRequestDateCard({
  borrowDate,
  setBorrowDate,
  returnDate,
}: BorrowRequestDateCardProps) {
  const t = useTranslations("public");

  return (
    <FadeUp>
      <Card className="border-2 border-border bg-linear-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t("borrowDateLabel")}
          </CardTitle>
          <CardDescription>{t("autoReturnDateInfo")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label variant="required">{t("borrowDateLabel")}</Label>
              <DatePicker
                value={borrowDate}
                onChange={setBorrowDate}
                placeholder={t("selectBorrowDate")}
                dateMode="future"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("returnDateLabel")}</Label>
              <div className="flex h-10 w-full items-center gap-2 rounded-xl border-2 border-input bg-muted/30 px-3 py-2 text-sm font-normal text-muted-foreground cursor-not-allowed">
                <Calendar className="h-4 w-4 shrink-0 opacity-50" />
                {returnDate
                  ? format(returnDate, "PPP")
                  : t("selectBorrowDateFirst")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeUp>
  );
}
