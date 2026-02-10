"use client";

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
import { DollarSign, Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

const typeColors = {
  lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  damaged: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function FineTypeTable({
  data,
  onEdit,
  onDelete,
}: {
  data: FineType[];
  onEdit: (fineType: FineType) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("admin.fines");

  const typeLabels = {
    lost: t("lost"),
    damaged: t("damaged"),
    late: t("late"),
  };

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noFineTypes")}
        description={t("noFineTypesDesc")}
        icon={<DollarSign className="h-10 w-10" />}
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
          <TableHead className="font-semibold">{t("amount")}</TableHead>
          <TableHead className="font-semibold">{t("description")}</TableHead>
          <TableHead className="font-semibold text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.id}
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
                Rp {item.amount.toLocaleString("id-ID")}
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
                  variant="brand"
                  onClick={() => onEdit(item)}
                  className="h-8 gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("edit")}</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                  className="h-8 gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("delete")}</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
