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
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import { Publisher } from "@/types/publisher";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Building2, Eye, Trash } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function PublisherTable({
  data,
  onView,
  onDelete,
}: {
  data: Publisher[];
  onView: (publisher: Publisher) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("publisher");
  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noPublishers")}
        description={t("noPublishersDesc")}
        icon={<Building2 />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead className="w-16 text-center font-semibold">{t("photo")}</TableHead>
          <TableHead className="font-semibold">{t("name")}</TableHead>
          <TableHead className="font-semibold">{t("descriptionLabel")}</TableHead>
          <TableHead className="font-semibold">{t("status")}</TableHead>
          <TableHead className="font-semibold text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.id}
            className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
          >
            <TableCell className="text-center text-muted-foreground font-medium">
              {index + 1}
            </TableCell>

            <TableCell className="text-center">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted ring-2 ring-muted">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="font-medium text-foreground">{item.name}</span>
            </TableCell>

            <TableCell>
              <span className="text-muted-foreground text-sm line-clamp-2 max-w-xs">
                {item.description || "-"}
              </span>
            </TableCell>

            <TableCell>
              <ActiveStatusBadge isActive={item.is_active} />
            </TableCell>

            <TableCell>
              <div className="flex justify-end items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(item)}
                  className="h-8 gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("view")}</span>
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
        ))}
      </TableBody>
    </Table>
  );
}
