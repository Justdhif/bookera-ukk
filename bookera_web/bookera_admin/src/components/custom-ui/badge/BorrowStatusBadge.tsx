"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BorrowStatus = "open" | "close";
type BorrowRequestStatus = "processing" | "approved" | "rejected" | "canceled";
type BorrowBadgeStatus = BorrowStatus | BorrowRequestStatus;

interface BorrowStatusBadgeProps {
  status: BorrowBadgeStatus;
  className?: string;
}

const statusVariant: Record<BorrowBadgeStatus, "outline" | "secondary"> = {
  open: "outline",
  close: "outline",
  processing: "secondary",
  approved: "secondary",
  rejected: "secondary",
  canceled: "secondary",
};

export default function BorrowStatusBadge({
  status,
  className,
}: BorrowStatusBadgeProps) {
  const borrowStatusT = useTranslations("borrowStatus");
  const borrowRequestT = useTranslations("borrow-request");

  const config: Record<
    BorrowBadgeStatus,
    { label: string; style: string }
  > = {
    open: {
      label: borrowStatusT("open"),
      style:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-800",
    },
    close: {
      label: borrowStatusT("close"),
      style:
        "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700",
    },
    processing: {
      label: borrowRequestT("processing"),
      style:
        "bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/40",
    },
    approved: {
      label: borrowRequestT("approved"),
      style:
        "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/40",
    },
    rejected: {
      label: borrowRequestT("rejected"),
      style:
        "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/40",
    },
    canceled: {
      label: borrowRequestT("canceled"),
      style:
        "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800/60",
    },
  };
  const { label, style } = config[status] ?? config.close;
  return (
    <Badge
      variant={statusVariant[status] ?? "outline"}
      className={cn("font-medium", style, className)}
    >
      {label}
    </Badge>
  );
}
