"use client";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import EmptyState from "@/components/custom-ui/EmptyState";
import { FolderOpen, Edit, Trash } from "lucide-react";
export default function CategoryTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("category");
  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noCategories")}
        description={t("noCategoriesDesc")}
        icon={<FolderOpen />}
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 text-center">{t("noCol")}</TableHead>
          <TableHead className="font-semibold">{t("categoryCol")}</TableHead>
          <TableHead className="font-semibold">{t("slugCol")}</TableHead>
          <TableHead className="font-semibold">{t("descriptionCol")}</TableHead>
          <TableHead className="font-semibold text-right">
            {t("actionsCol")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => {
          return (
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
                <Badge variant="outline" className="font-mono text-xs">
                  /{item.slug}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium text-foreground">
                  {item.description ? item.description : "-"}
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
                    <Trash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("delete")}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
