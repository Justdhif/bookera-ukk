"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FineType } from "@/types/fine";
import EmptyState from "@/components/custom-ui/EmptyState";
import { DollarSign, Trash } from "lucide-react";
const typeColors = {
  lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  damaged:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};
export default function FineTypeTable({
  data,
  onDelete,
}: {
  data: FineType[];
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("fines");
  const typeLabels = {
    lost: t("lost"),
    damaged: t("damaged"),
    late: t("late"),
  };

  const formatFineTypeValue = (fineType: FineType) => {
    if (fineType.type === "damaged") {
      return `${new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
      }).format(Number(fineType.percentage ?? 0))}%`;
    }

    return `Rp ${Number(fineType.amount ?? 0).toLocaleString("id-ID")}`;
  };

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noFineTypes")}
        description={t("noFineTypesDesc")}
        icon={<DollarSign />}
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 text-center">#</TableHead>
          <TableHead className="font-semibold">{t("name")}</TableHead>
          <TableHead className="font-semibold">{t("type")}</TableHead>
          <TableHead className="font-semibold">{t("fineValueLabel")}</TableHead>
          <TableHead className="font-semibold">{t("description")}</TableHead>
          <TableHead className="font-semibold text-right">
            {t("actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <StaggerContainer
        as={motion.tbody}
        staggerDelay={0.05}
        className="[&_tr:last-child]:border-0"
      >
        {data.map((item, index) => (
          <SlideIn
            key={item.id}
            as={motion.tr}
            direction="up"
            distance={20}
            delay={index * 0.05}
            className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
          >
            <TableCell className="font-medium text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell>
              <span className="font-medium text-foreground">{item.name}</span>
            </TableCell>
            <TableCell>
              <Badge className={typeColors[item.type]}>
                {typeLabels[item.type]}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="font-semibold text-foreground">
                {formatFineTypeValue(item)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {item.description || "-"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                  className="h-8 gap-1"
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("delete")}</span>
                </Button>
              </div>
            </TableCell>
          </SlideIn>
        ))}
      </StaggerContainer>
    </Table>
  );
}
