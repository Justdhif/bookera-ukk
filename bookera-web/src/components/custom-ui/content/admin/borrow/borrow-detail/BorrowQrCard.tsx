import { Borrow } from "@/types/borrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";
import { useTranslations } from "next-intl";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowQrCardProps {
  borrow: Borrow;
}

export function BorrowQrCard({ borrow }: BorrowQrCardProps) {
  const t = useTranslations("borrow");
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {t("borrowQrCode")}
        </CardTitle>
        <CardDescription>{t("borrowQrDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center">
        <QrCodeImage
          url={borrow.qr_code_url}
          code={borrow.borrow_code}
          label={t("borrowCode")}
          size="lg"
        />
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="flex items-center justify-between w-full rounded-lg border p-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium">{t("borrowStatus")}</p>
              <p className="text-xs text-muted-foreground">{t("currentProcessingState")}</p>
            </div>
            <BorrowStatusBadge status={borrow.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
