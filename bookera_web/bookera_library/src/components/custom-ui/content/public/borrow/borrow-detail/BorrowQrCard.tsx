import { useTranslations } from "next-intl";
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
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";

interface BorrowQrCardProps {
  borrow: Borrow;
}

export function BorrowQrCard({ borrow }: BorrowQrCardProps) {
  const t = useTranslations("public");
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Borrow
        </CardTitle>
        <CardDescription>Borrow code & status</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center">
        <QrCodeImage
          url={borrow.qr_code_url}
          code={borrow.borrow_code}
          label="Borrow Code"
          size="md"
        />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <p className="text-sm font-medium">{t("status")}</p>
            <BorrowStatusBadge status={borrow.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
