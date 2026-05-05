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
import { FolderOpen } from "lucide-react";
import EditButton from "@/components/custom-ui/button/EditButton";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Genre } from "@/types/genre";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

export default function GenreTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Genre[];
  onEdit: (genre: Genre) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("genre");

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noGenres")}
        description={t("noGenresDesc")}
        icon={<FolderOpen />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 text-center">{t("noCol")}</TableHead>
          <TableHead className="font-semibold">{t("genreCol")}</TableHead>
          <TableHead className="font-semibold">{t("slugCol")}</TableHead>
          <TableHead className="font-semibold">{t("descriptionCol")}</TableHead>
          <TableHead className="font-semibold text-right">
            {t("actionsCol")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <StaggerContainer
        as={motion.tbody}
        staggerDelay={0.05}
        data-slot="table-body"
        className="[&_tr:last-child]:border-0"
      >
        {data.map((item, index) => (
          <SlideIn
            key={item.id}
            as={motion.tr}
            direction="up"
            distance={20}
            delay={index * 0.05}
            data-slot="table-row"
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
                <EditButton
                  onClick={() => onEdit(item)}
                  label={t("edit")}
                />
                <DeleteButton
                  onClick={() => onDelete(item.id)}
                  label={t("delete")}
                />
              </div>
            </TableCell>
          </SlideIn>
        ))}
      </StaggerContainer>
    </Table>
  );
}