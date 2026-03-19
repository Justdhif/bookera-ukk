"use client";

import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;

  left: ReactNode;
  header: ReactNode;
  body: ReactNode;
  footer: ReactNode;
}

export default function PostEditorModalClient({
  open,
  onOpenChange,
  title,
  left,
  header,
  body,
  footer,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col md:flex-row md:h-[80vh]">
          {/* Left: images */}
          <div className="md:w-1/2 bg-black flex flex-col">
            <div className="flex-1 min-h-72">{left}</div>
          </div>

          {/* Right: content */}
          <div className="md:w-1/2 flex flex-col bg-card">
            <div className="shrink-0 px-6 py-5 border-b border-border/60">{header}</div>
            <div className="flex-1 min-h-0 px-6 py-5">{body}</div>
            <div className="shrink-0 px-6 py-5 border-t border-border/60 flex items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
