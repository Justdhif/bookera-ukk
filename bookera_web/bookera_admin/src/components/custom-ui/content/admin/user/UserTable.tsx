"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import DetailButton from "@/components/custom-ui/button/DetailButton";
import DeleteButton from "@/components/custom-ui/button/DeleteButton";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleBadge from "@/components/custom-ui/badge/RoleBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import EmptyState from "@/components/custom-ui/EmptyState";
import { formatOccupationLabel } from "@/constants/user-occupation";
import { motion } from "framer-motion";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
interface Props {
  data: User[];
  onDelete: (id: number) => void;
}
export default function UserTable({ data, onDelete }: Props) {
  const t = useTranslations("user");
  const common = useTranslations("common");
  if (data.length === 0) {
    return (
      <EmptyState
        title={t("noUsersFound")}
        description={t("noUsersDesc")}
        icon={<Users />}
      />
    );
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">
              {t("noCol")}
            </TableHead>
            <TableHead className="font-semibold">{t("user")}</TableHead>
            <TableHead className="font-semibold">{t("email")}</TableHead>
            <TableHead className="font-semibold">{t("identificationNumber")}</TableHead>
            <TableHead className="font-semibold">{t("role")}</TableHead>
            <TableHead className="font-semibold">{t("status")}</TableHead>
            <TableHead className="font-semibold text-right pr-6">
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
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={item.profile?.avatar || undefined}
                      alt={item.profile?.full_name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {item.profile?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">
                      {item.profile?.full_name || "Unknown User"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.slug || "N/A"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium text-foreground">
                  {item.email}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {item.profile?.identification_number || "-"}
                </span>
              </TableCell>
              <TableCell>
                <RoleBadge role={item.role} />
              </TableCell>
              <TableCell>
                <ActiveStatusBadge isActive={item.is_active} />
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  {item.slug ? (
                    <Link href={`/admin/users/${item.slug}`}>
                      <DetailButton />
                    </Link>
                  ) : (
                    <DetailButton disabled />
                  )}
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
