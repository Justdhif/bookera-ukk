import { useTranslations } from "next-intl";
import { Borrow } from "@/types/borrow";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PackageCheck, QrCode } from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";

interface BorrowQrCardProps {
  borrow: Borrow;
}

const statusConfig: Record<Borrow["status"], { label: string; className: string }> = {
  open: { label: "Active", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  close: { label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

export function BorrowQrCard({ borrow }: BorrowQrCardProps) {
    const t = useTranslations("public");
  const config = statusConfig[borrow.status];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Borrow
        </CardTitle>
        <CardDescription>Borrow code &amp; status</CardDescription>
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
            <Badge className={config?.className}>
              <PackageCheck className="h-3 w-3 mr-1" />
              {config?.label || borrow.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
