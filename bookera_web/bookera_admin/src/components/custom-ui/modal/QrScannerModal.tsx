"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface QrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QrScannerModal({
  open,
  onOpenChange,
  onScanSuccess,
}: QrScannerModalProps) {
  const t = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"camera" | "file">("camera");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, activeTab]);

  const isTransitioning = useRef(false);

  const startCamera = async () => {
    if (isTransitioning.current) return;
    
    // Wait a bit for the Dialog/DOM to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 400));

    const element = document.getElementById("qr-reader");
    if (!element) {
      console.warn("QR reader element not found, retrying...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!document.getElementById("qr-reader")) {
        console.error("QR reader element still not found after retry.");
        return;
      }
    }

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      isTransitioning.current = true;
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          onOpenChange(false);
        },
        undefined
      );
    } catch (err) {
      console.error("Failed to start camera:", err);
      setIsScanning(false);
    } finally {
      isTransitioning.current = false;
    }
  };

  const stopCamera = async () => {
    if (!scannerRef.current || isTransitioning.current) return;

    const state = scannerRef.current.getState();
    if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
      try {
        isTransitioning.current = true;
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop camera:", err);
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to scan file:", err);
      toast.error(t("invalidQrCode") || "QR Code not found in image");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <QrCode className="h-6 w-6 text-brand-primary" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Scan your borrow QR code to quickly view details
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="flex p-1 bg-muted/50 rounded-2xl gap-1">
            <Button
              variant={activeTab === "camera" ? "brand" : "ghost"}
              className="flex-1 rounded-xl font-bold h-10"
              onClick={() => setActiveTab("camera")}
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={activeTab === "file" ? "brand" : "ghost"}
              className="flex-1 rounded-xl font-bold h-10"
              onClick={() => setActiveTab("file")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          <div className="relative aspect-square w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-muted/20">
            {activeTab === "camera" ? (
              <div id="qr-reader" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center border-2 border-dashed border-white/20">
                  <Upload className="h-10 w-10 text-white/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold">Select QR Image</p>
                  <p className="text-white/40 text-xs">PNG, JPG or WebP supported</p>
                </div>
                <Button 
                  className="rounded-xl font-black uppercase tracking-wider"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
            
            {/* Scan Overlay for Camera */}
            {activeTab === "camera" && isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-brand-primary/50 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-primary rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-primary rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-primary rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-primary rounded-br-xl" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/50 shadow-[0_0_15px_rgba(var(--brand-primary),0.5)] animate-scan-line" />
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <div id="qr-reader-hidden" className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
