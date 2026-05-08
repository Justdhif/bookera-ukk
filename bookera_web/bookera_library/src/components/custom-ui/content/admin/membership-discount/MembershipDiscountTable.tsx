"use client";

import { useTranslations } from "next-intl";
import { MembershipDiscount } from "@/types/membership-discount";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag, Percent, Key } from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

interface MembershipDiscountTableProps {
  data: MembershipDiscount[];
  onDelete: (id: number) => void;
}

export default function MembershipDiscountTable({
  data,
  onDelete,
}: MembershipDiscountTableProps) {
  const t = useTranslations("membershipDiscount");
  const tCommon = useTranslations("common");

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Tag />}
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
            <TableHead className="font-semibold">{t("percentage")}</TableHead>
            <TableHead className="text-right font-semibold pr-6">{t("actionsCol")}</TableHead>
          </TableRow>
        </TableHeader>
        <StaggerContainer
          as={motion.tbody}
          staggerDelay={0.05}
          data-slot="table-body"
          className="[&_tr:last-child]:border-0"
        >
          {data.map((discount, index) => (
            <SlideIn
              key={discount.id}
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
                  <span className="font-semibold text-foreground">{discount.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-[10px] uppercase bg-muted/30">
                  <Key className="w-3 h-3 mr-1 opacity-50" />
                  {discount.discount_key}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    maximumFractionDigits: 2,
                  }).format(Number(discount.discount_percentage))}%
                </span>
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <DeleteButton
                    onClick={() => onDelete(discount.id)}
                    label={tCommon("delete")}
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
