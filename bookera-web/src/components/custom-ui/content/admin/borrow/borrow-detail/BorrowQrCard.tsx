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
  open: { label: "Open", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  close: { label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

export function BorrowQrCard({ borrow }: BorrowQrCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Borrow QR Code
        </CardTitle>
        <CardDescription>Scan to identify this borrow</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center">
        <QrCodeImage
          url={borrow.qr_code_url}
          code={borrow.borrow_code}
          label="Borrow Code"
          size="lg"
        />
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="flex items-center justify-between w-full rounded-lg border p-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium">Borrow Status</p>
              <p className="text-xs text-muted-foreground">Current processing state</p>
            </div>
            <Badge className={statusConfig[borrow.status]?.className}>
              <PackageCheck className="h-3 w-3 mr-1" />
              {statusConfig[borrow.status]?.label || borrow.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
