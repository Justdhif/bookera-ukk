import { Borrow } from "@/types/borrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, QrCode } from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";
import { useTranslations } from "next-intl";
import BorrowStatusBadge from "@/components/custom-ui/badge/BorrowStatusBadge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

import { downloadQrCode } from "@/lib/download";

interface BorrowQrCardProps {
  borrow: Borrow;
}

export function BorrowQrCard({ borrow }: BorrowQrCardProps) {
  const t = useTranslations("borrow");

  const handleDownload = async () => {
    if (!borrow.qr_code_url) return;
    try {
      await downloadQrCode(borrow.qr_code_url, borrow.borrow_code);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {t("borrowQrCode")}
        </CardTitle>
        <CardDescription>{t("borrowQrDesc")}</CardDescription>
      </CardHeader>
      <StaggerContainer as={CardContent} className="flex flex-col items-center gap-4 flex-1 justify-center">
        <FadeUp delay={0.1}>
          <QrCodeImage
            url={borrow.qr_code_url}
            code={borrow.borrow_code}
            label={t("borrowCode")}
            size="lg"
          />
        </FadeUp>
        <FadeUp delay={0.12} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl font-bold gap-2 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 transition-all"
            onClick={handleDownload}
            disabled={!borrow.qr_code_url}
          >
            <Download className="h-4 w-4" />
            {t("downloadQrCode")}
          </Button>
        </FadeUp>
        <FadeUp delay={0.15} className="flex flex-col gap-2 items-center w-full">
          <div className="flex items-center justify-between w-full rounded-lg border p-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium">{t("borrowStatus")}</p>
              <p className="text-xs text-muted-foreground">
                {t("currentProcessingState")}
              </p>
            </div>
            <BorrowStatusBadge status={borrow.status} />
          </div>
        </FadeUp>
      </StaggerContainer>
    </Card>
  );
}
