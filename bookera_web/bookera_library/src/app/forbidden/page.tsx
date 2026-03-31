"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldX, BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function ForbiddenPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const getRoleMessage = () => {
    if (user?.role === "officer:catalog") {
      return "As an Officer Catalog, you only have access to Dashboard, Categories, and Books.";
    }
    if (user?.role === "officer:management") {
      return "As an Officer Management, you only have access to Dashboard, Users, Loans, Returns, Fines, Lost Books, and Activity Logs.";
    }
    return "You do not have permission to access this page.";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(239,68,68,0.06),transparent)]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ef4444 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating decorative blobs */}
      <div className="absolute top-1/4 left-[8%] w-72 h-72 bg-red-500/5 dark:bg-red-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-[8%] w-80 h-80 bg-rose-500/5 dark:bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Ghost watermark number */}
      <span
        aria-hidden="true"
        className="absolute select-none font-black text-[22rem] leading-none text-red-500/4 dark:text-red-400/5 pointer-events-none"
        style={{ letterSpacing: "-0.05em" }}
      >
        403
      </span>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-red-500/15 dark:bg-red-400/10 blur-xl scale-[1.8] animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 dark:bg-red-400/10 border border-red-500/20 dark:border-red-400/20">
            <ShieldX className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error badge */}
        <p className="text-xs font-semibold tracking-widest uppercase text-red-600 dark:text-red-400 mb-3">
          Error 403
        </p>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-base leading-relaxed mb-2">
          {getRoleMessage()}
        </p>
        <p className="text-muted-foreground/60 text-sm mb-10">
          If you believe this is a mistake, please contact an administrator to
          get appropriate access permissions.
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
            <Button variant="brand" size="lg" className="w-full">
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
