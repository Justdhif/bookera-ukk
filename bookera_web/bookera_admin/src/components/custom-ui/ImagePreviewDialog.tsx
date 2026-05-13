"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
  className?: string;
  showCloseButton?: boolean;
}

/**
 * A reusable image preview dialog component.
 * Used to display a full-screen or large-scale preview of an image.
 */
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
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
