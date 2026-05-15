"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
  className?: string;
  showCloseButton?: boolean;
}

export default function ImagePreviewDialog({
  isOpen,
  onOpenChange,
  imageUrl,
  alt = "Image Preview",
  className,
  showCloseButton = false,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent shadow-none overflow-hidden flex items-center justify-center z-50",
          className
        )}
        showCloseButton={showCloseButton}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {imageUrl && (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={alt}
              width={1920}
              height={1080}
              unoptimized={true}
              className="max-w-full max-h-[90vh] h-auto w-auto object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
