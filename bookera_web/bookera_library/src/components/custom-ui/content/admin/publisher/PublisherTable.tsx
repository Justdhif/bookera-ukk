"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import EditButton from "@/components/custom-ui/button/EditButton";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { Publisher } from "@/types/publisher";
import EmptyState from "@/components/custom-ui/EmptyState";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

export default function PublisherTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Publisher[];
  onEdit: (publisher: Publisher) => void;
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
          <TableHead className="w-16 text-center font-semibold">
            {t("photo")}
          </TableHead>
          <TableHead className="font-semibold">{t("name")}</TableHead>
          <TableHead className="font-semibold">
            {t("descriptionLabel")}
          </TableHead>
          <TableHead className="font-semibold">{t("status")}</TableHead>
          <TableHead className="font-semibold text-right">
            {t("actions")}
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
            <TableCell className="text-center text-muted-foreground font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted ring-2 ring-muted">
                  <Image
                    src={item.photo}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
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
