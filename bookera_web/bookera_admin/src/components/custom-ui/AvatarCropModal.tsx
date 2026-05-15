"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  CropIcon,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AvatarCropModalProps {
  /** Data URL of the raw image to crop */
  imageSrc: string;
  /** Called with the cropped File when confirmed */
  onConfirm: (croppedFile: File) => void;
  /** Called when the user cancels */
  onCancel: () => void;
  /** Output image size in pixels (square). Default: 512 */
  outputSize?: number;
}

interface CropState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const OUTPUT_DEFAULT = 512;
const PREVIEW_SIZE = 280; // px, the visible circular preview

export default function AvatarCropModal({
  imageSrc,
  onConfirm,
  onCancel,
  outputSize = OUTPUT_DEFAULT,
}: AvatarCropModalProps) {
  const t = useTranslations("avatarCrop");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropState, setCropState] = useState<CropState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Drag state
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // Load image and fit to preview initially
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Compute initial scale so the image covers the square preview
      const coverScale = Math.max(
        PREVIEW_SIZE / img.naturalWidth,
        PREVIEW_SIZE / img.naturalHeight
      );
      setCropState({ scale: coverScale, offsetX: 0, offsetY: 0 });
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw canvas whenever state changes
  useEffect(() => {
    if (!imageLoaded) return;
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropState, imageLoaded]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = PREVIEW_SIZE;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    const { scale, offsetX, offsetY } = cropState;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    // Center the image in the preview square, then apply offset
    const x = size / 2 - drawW / 2 + offsetX;
    const y = size / 2 - drawH / 2 + offsetY;

    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();
  }, [cropState]);

  // ── Pointer / Mouse drag ──────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: cropState.offsetX,
      oy: cropState.offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const ds = dragStart.current;
    if (!ds) return;
    const dx = e.clientX - ds.x;
    const dy = e.clientY - ds.y;
    setCropState((prev) =>
      clamp({ ...prev, offsetX: ds.ox + dx, offsetY: ds.oy + dy })
    );
  };

  const handlePointerUp = () => {
    dragStart.current = null;
  };

  // ── Wheel zoom ────────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setCropState((prev) =>
      clamp({ ...prev, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta)) })
    );
  };

  // ── Clamp offset so image always covers the square ──────────────────────
  const clamp = (state: CropState): CropState => {
    const img = imageRef.current;
    if (!img) return state;
    const { scale, offsetX, offsetY } = state;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const centerX = PREVIEW_SIZE / 2 - drawW / 2;
    const centerY = PREVIEW_SIZE / 2 - drawH / 2;
    // The image must cover the full preview square; offset bounds ensure this
    const maxOffX = -centerX;          // how far right we can push
    const minOffX = -(drawW - PREVIEW_SIZE) + maxOffX; // how far left
    const maxOffY = -centerY;
    const minOffY = -(drawH - PREVIEW_SIZE) + maxOffY;

    // Only clamp if image is larger than preview (scale > cover scale)
    const clampedX = drawW >= PREVIEW_SIZE ? Math.min(maxOffX, Math.max(minOffX, offsetX)) : offsetX;
    const clampedY = drawH >= PREVIEW_SIZE ? Math.min(maxOffY, Math.max(minOffY, offsetY)) : offsetY;

    return { scale, offsetX: clampedX, offsetY: clampedY };
  };

  // ── Zoom buttons ──────────────────────────────────────────────────────────
  const zoom = (delta: number) => {
    setCropState((prev) =>
      clamp({ ...prev, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta)) })
    );
  };

  const resetCrop = () => {
    const img = imageRef.current;
    if (!img) return;
    const coverScale = Math.max(
      PREVIEW_SIZE / img.naturalWidth,
      PREVIEW_SIZE / img.naturalHeight
    );
    setCropState({ scale: coverScale, offsetX: 0, offsetY: 0 });
  };

  // ── Confirm: render to off-screen canvas at outputSize ───────────────────
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    const offscreen = document.createElement("canvas");
    offscreen.width = outputSize;
    offscreen.height = outputSize;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const ratio = outputSize / PREVIEW_SIZE;
    const { scale, offsetX, offsetY } = cropState;
    const drawW = img.naturalWidth * scale * ratio;
    const drawH = img.naturalHeight * scale * ratio;
    const x = outputSize / 2 - drawW / 2 + offsetX * ratio;
    const y = outputSize / 2 - drawH / 2 + offsetY * ratio;

    ctx.drawImage(img, x, y, drawW, drawH);

    offscreen.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        onConfirm(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const scalePercent = Math.round(
    ((cropState.scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100
  );

  return (
    <AnimatePresence>
      <motion.div
        key="crop-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <motion.div
          key="crop-panel"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center">
                <CropIcon className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("hint")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Canvas preview */}
          <div className="flex flex-col items-center gap-4 p-6">
            <div
              ref={containerRef}
              className="relative rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none ring-4 ring-brand-primary/20 dark:ring-brand-primary/30 shadow-xl"
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            >
              <canvas
                ref={canvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, display: "block" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
              />
              {/* Move indicator overlay */}
              <div className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1 pointer-events-none">
                <Move className="w-3 h-3 text-white/80" />
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => zoom(-0.15)}
                className="h-9 w-9 rounded-xl shrink-0 border-gray-200 dark:border-gray-800 bg-white/5"
              >
                <ZoomOut className="w-4 h-4 text-gray-500" />
              </Button>

              <div className="flex-1 px-2">
                <Slider
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step={0.01}
                  value={[cropState.scale]}
                  onValueChange={(vals) =>
                    setCropState((prev) =>
                      clamp({ ...prev, scale: vals[0] })
                    )
                  }
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => zoom(0.15)}
                className="h-9 w-9 rounded-xl shrink-0 border-gray-200 dark:border-gray-800 bg-white/5"
              >
                <ZoomIn className="w-4 h-4 text-gray-500" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={resetCrop}
                title={t("reset")}
                className="h-9 w-9 rounded-xl shrink-0 border-gray-200 dark:border-gray-800 bg-white/5"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
              </Button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {t("dragHint")}
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 px-5 pb-5">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-700 font-medium"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="submit"
              onClick={handleConfirm}
              disabled={!imageLoaded}
              className={cn(
                "flex-1 h-11 rounded-xl font-semibold gap-2",
                "bg-linear-to-r from-brand-primary to-brand-primary-dark",
                "hover:from-brand-primary-dark hover:to-brand-primary-darker",
                "shadow-lg shadow-brand-primary/25 transition-all duration-300"
              )}
            >
              <Check className="w-4 h-4" />
              {t("confirm")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
