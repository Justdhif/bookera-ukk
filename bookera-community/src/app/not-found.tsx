"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookX, BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.07),transparent)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #10b981 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating decorative blobs */}
      <div className="absolute top-1/4 left-[8%] w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-[8%] w-80 h-80 bg-teal-500/5 dark:bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Ghost watermark number */}
      <span
        aria-hidden="true"
        className="absolute select-none font-black text-[22rem] leading-none text-emerald-500/4 dark:text-emerald-400/5 pointer-events-none"
        style={{ letterSpacing: "-0.05em" }}
      >
        404
      </span>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/15 dark:bg-emerald-400/10 blur-xl scale-[1.8] animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20">
            <BookX className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Error badge */}
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-3">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-base leading-relaxed mb-2">
          It looks like you're searching for a book that isn't on our library
          shelves.
        </p>
        <p className="text-muted-foreground/60 text-sm mb-10">
          The page may have been moved, deleted, or never existed.
        </p>

        {/* Subtle divider */}
        <div className="w-12 h-px bg-border mb-10" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.back()}
            variant="brand"
            size="lg"
            className="w-full sm:w-auto group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>

          <Link href="/admin" className="w-full sm:w-auto">
            <Button
              variant="brand"
              size="lg"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer branding */}
        <div className="mt-16 flex items-center gap-2 text-muted-foreground/40">
          <BookOpen className="h-3.5 w-3.5" />
          <span className="text-xs font-medium tracking-wide">
            Bookera Library System
          </span>
        </div>
      </div>
    </div>
  );
}
