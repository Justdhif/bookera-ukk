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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import EmptyState from "@/components/custom-ui/EmptyState";
import RoleBadge from "@/components/custom-ui/badge/RoleBadge";
import ActiveStatusBadge from "@/components/custom-ui/badge/ActiveStatusBadge";
import { Users, Eye, Trash } from "lucide-react";
interface Props {
  data: User[];
  onDelete: (id: number) => void;
}
export default function UserTable({ data, onDelete }: Props) {
  const t = useTranslations("user");
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
            <TableHead className="w-16 text-center font-semibold">#</TableHead>
            <TableHead className="font-semibold">{t("user")}</TableHead>
            <TableHead className="font-semibold">{t("email")}</TableHead>
            <TableHead className="font-semibold">{t("role")}</TableHead>
            <TableHead className="font-semibold">{t("occupation")}</TableHead>
            <TableHead className="font-semibold">{t("status")}</TableHead>
            <TableHead className="font-semibold text-right pr-6">
              Actions
            </TableHead>
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={item.profile.avatar}
                      alt={item.profile.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback>{item.profile.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">
                      {item.profile.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.profile.identification_number || "N/A"}
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
                <RoleBadge role={item.role} />
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {item.profile.occupation || "N/A"}
                </span>
              </TableCell>
              <TableCell>
                <ActiveStatusBadge isActive={item.is_active} />
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <Link
                    href={`/admin/users/${item.profile.identification_number}`}
                  >
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t("viewUser")}</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-8 gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("deleteUser")}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
