import {
  CheckCircle2,
  XCircle,
  BookOpen,
  AlertTriangle,
  Clock,
  RotateCcw,
  BookMarked,
  Bell,
  UserPlus,
  DollarSign,
  BookX,
} from "lucide-react";
import { cn } from "@/lib/utils";
export interface NotificationIconConfig {
  icon: React.ReactNode;
  bg: string;
  ring: string;
}
export const getNotificationIconConfig = (
  type: string | null,
  module: string | null,
): NotificationIconConfig => {
  if (module === "borrow" || module === "loan") {
    switch (type) {
      case "borrow_request_approved":
      case "approved":
        return {
          icon: (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ),
          bg: "bg-emerald-100 dark:bg-emerald-950/60",
          ring: "ring-emerald-200 dark:ring-emerald-800",
        };
      case "borrow_request_rejected":
      case "rejected":
        return {
          icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
          bg: "bg-red-100 dark:bg-red-950/60",
          ring: "ring-red-200 dark:ring-red-800",
        };
      case "borrow_request_cancelled":
        return {
          icon: (
            <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          ),
          bg: "bg-orange-100 dark:bg-orange-950/60",
          ring: "ring-orange-200 dark:ring-orange-800",
        };
      default:
        return {
          icon: (
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ),
          bg: "bg-blue-100 dark:bg-blue-950/60",
          ring: "ring-blue-200 dark:ring-blue-800",
        };
    }
  }
  if (module === "return") {
    switch (type) {
      case "return_approved":
        return {
          icon: (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ),
          bg: "bg-emerald-100 dark:bg-emerald-950/60",
          ring: "ring-emerald-200 dark:ring-emerald-800",
        };
      default:
        return {
          icon: (
            <RotateCcw className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          ),
          bg: "bg-teal-100 dark:bg-teal-950/60",
          ring: "ring-teal-200 dark:ring-teal-800",
        };
    }
  }
  if (module === "fine") {
    return {
      icon: (
        <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      ),
      bg: "bg-amber-100 dark:bg-amber-950/60",
      ring: "ring-amber-200 dark:ring-amber-800",
    };
  }
  if (module === "lost_book") {
    return {
      icon: <BookX className="h-4 w-4 text-red-600 dark:text-red-400" />,
      bg: "bg-red-100 dark:bg-red-950/60",
      ring: "ring-red-200 dark:ring-red-800",
    };
  }
  switch (type) {
    case "borrow_request_approved":
    case "return_approved":
    case "approved":
      return {
        icon: (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ),
        bg: "bg-emerald-100 dark:bg-emerald-950/60",
        ring: "ring-emerald-200 dark:ring-emerald-800",
      };
    case "borrow_request_rejected":
    case "rejected":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
        bg: "bg-red-100 dark:bg-red-950/60",
        ring: "ring-red-200 dark:ring-red-800",
      };
    case "borrow_request_cancelled":
      return {
        icon: (
          <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        ),
        bg: "bg-orange-100 dark:bg-orange-950/60",
        ring: "ring-orange-200 dark:ring-orange-800",
      };
    case "borrow_request":
    case "borrow_request_created":
      return {
        icon: (
          <BookMarked className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        ),
        bg: "bg-blue-100 dark:bg-blue-950/60",
        ring: "ring-blue-200 dark:ring-blue-800",
      };
    case "return_request":
      return {
        icon: (
          <RotateCcw className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        ),
        bg: "bg-teal-100 dark:bg-teal-950/60",
        ring: "ring-teal-200 dark:ring-teal-800",
      };
    case "fine_created":
      return {
        icon: (
          <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        ),
        bg: "bg-amber-100 dark:bg-amber-950/60",
        ring: "ring-amber-200 dark:ring-amber-800",
      };
    case "overdue":
      return {
        icon: (
          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        ),
        bg: "bg-orange-100 dark:bg-orange-950/60",
        ring: "ring-orange-200 dark:ring-orange-800",
      };
    default:
      return {
        icon: <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />,
        bg: "bg-slate-100 dark:bg-slate-800/60",
        ring: "ring-slate-200 dark:ring-slate-700",
      };
  }
};
export const NotificationIconBadge = ({
  type,
  module,
  size = "default",
}: {
  type: string | null;
  module: string | null;
  size?: "sm" | "default" | "lg";
}) => {
  const config = getNotificationIconConfig(type, module);
  const sizeClass = {
    sm: "h-7 w-7",
    default: "h-9 w-9",
    lg: "h-11 w-11",
  }[size];
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full ring-1 shrink-0",
        sizeClass,
        config.bg,
        config.ring,
      )}
    >
      {config.icon}
    </div>
  );
};
export const getModuleBadgeStyle = (module: string | null): string => {
  switch (module) {
    case "borrow":
    case "loan":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
    case "return":
      return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800";
    case "fine":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    case "lost_book":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700";
  }
};
