import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrCodeImageProps {
  /** Base64 data URI or URL of the QR code image */
  url?: string | null;
  /** Code string displayed below the image */
  code: string;
  /** Optional label shown above the code (default: "Code") */
  label?: string;
  /** Image + placeholder size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "w-36 h-36", icon: "h-8 w-8" },
  md: { img: "w-44 h-44", icon: "h-10 w-10" },
  lg: { img: "w-52 h-52", icon: "h-12 w-12" },
};

export function QrCodeImage({
  url,
  code,
  label = "Code",
  size = "md",
  className,
}: QrCodeImageProps) {
  const sz = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {url ? (
        <div className="rounded-lg border p-3 bg-white shadow-sm">
          <img
            src={url}
            alt={`QR ${code}`}
            className={cn(sz.img, "object-contain")}
          />
        </div>
      ) : (
        <div
          className={cn(
            sz.img,
            "border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/30"
          )}
        >
          <QrCode className={cn(sz.icon, "text-muted-foreground opacity-50")} />
          <p className="text-xs text-muted-foreground text-center px-2">
            QR code tidak tersedia
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="font-mono font-semibold text-sm">{code}</p>
      </div>
    </div>
  );
}
