"use client";

import { useTranslations } from "next-intl";
import { DiscountKey } from "@/types/membership-discount";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag, Key, Info } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

interface DiscountKeyTableProps {
  data: DiscountKey[];
  onDelete: (id: number) => void;
}

export default function DiscountKeyTable({
  data,
  onDelete,
}: DiscountKeyTableProps) {
  const t = useTranslations("discountKey");
  const tCommon = useTranslations("common");

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Key />}
        title={t("noData")}
        description={t("noDataDesc")}
      />
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">{t("noCol")}</TableHead>
            <TableHead className="font-semibold">{t("name")}</TableHead>
            <TableHead className="font-semibold">{t("key")}</TableHead>
            <TableHead className="font-semibold">{t("description")}</TableHead>
            <TableHead className="text-right font-semibold pr-6">{t("actionsCol")}</TableHead>
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Tag className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{item.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-[10px] uppercase bg-muted/30 text-primary border-primary/20">
                  <Key className="w-3 h-3 mr-1 opacity-50" />
                  {item.key}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 max-w-md">
                   <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                   <p className="text-sm text-muted-foreground line-clamp-1 italic">
                    {item.description || "-"}
                   </p>
                </div>
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <DeleteButton
                    onClick={() => onDelete(item.id)}
                  />
                </div>
              </TableCell>
            </SlideIn>
          ))}
        </StaggerContainer>
      </Table>
    </div>
  );
}
