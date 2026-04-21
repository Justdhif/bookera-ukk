import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardTotals } from "@/types/dashboard";
import {
  Users,
  BookOpen,
  ArrowUpFromLine,
  ArrowDownToLine,
  ChevronRight,
  Sparkles,
  Library,
  CalendarClock,
  Clock,
} from "lucide-react";

type CardItem = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  barClass: string;
  statIcon: React.ElementType;
  statText: string;
  detailsHref: string;
  detailsText: string;
};

export default function DashboardCards({ data }: { data: DashboardTotals }) {
  const t = useTranslations("dashboard");
  const router = useRouter();

  const cardItems: CardItem[] = [
    {
      label: t("totalUsers"),
      value: data.total_users,
      icon: Users,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      barClass: "bg-emerald-500",
      statIcon: Sparkles,
      statText: t("activeUsers"),
      detailsHref: "/admin/users",
      detailsText: t("manageUsers"),
    },
    {
      label: t("totalBooks"),
      value: data.total_books,
      icon: BookOpen,
      iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      barClass: "bg-orange-500",
      statIcon: Library,
      statText: t("inCollection"),
      detailsHref: "/admin/books",
      detailsText: t("browseCatalog"),
    },
    {
      label: t("totalBorrows"),
      value: data.total_borrows,
      icon: ArrowUpFromLine,
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      barClass: "bg-sky-500",
      statIcon: CalendarClock,
      statText: t("borrowRecords"),
      detailsHref: "/admin/borrows",
      detailsText: t("viewBorrows"),
    },
    {
      label: t("totalReturns"),
      value: data.total_returns,
      icon: ArrowDownToLine,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      barClass: "bg-amber-500",
      statIcon: Clock,
      statText: t("returnRecords"),
      detailsHref: "/admin/returns",
      detailsText: t("viewReturns"),
    },
  ];

  const handleDetailsClick = (href: string) => {
    router.push(href);
  };

  const renderCard = (item: CardItem) => (
    <Card
      key={item.label}
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/10 hover:shadow-md cursor-pointer"
      onClick={() => handleDetailsClick(item.detailsHref)}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${item.barClass} opacity-70`} />
      <CardContent className="flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
          >
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground/90">
              {item.label}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <item.statIcon className="h-3.5 w-3.5" />
              <span className="truncate">
                {item.statText}
              </span>
            </div>
          </div>
          <p className="shrink-0 text-2xl font-semibold tracking-tight text-foreground">
            {Number(item.value ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4">
          <div className={`h-1.5 w-16 rounded-full ${item.barClass} opacity-80`} />
          <Link href={item.detailsHref} onClick={(e) => e.stopPropagation()}>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              <span>
                {item.detailsText}
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid h-full min-h-0 grid-rows-4 gap-3">
      {cardItems.map(renderCard)}
    </div>
  );
}
