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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Users, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  data: User[];
  onDelete: (id: number) => void;
}

export default function UserTable({ data, onDelete }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('admin.common');

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('noUsers')}
        description={t('noUsersDesc')}
        icon={<Users className="h-10 w-10" />}
      />
    );
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      officer: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      user: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {role === "officer" ? t('officer').toUpperCase() : role.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">#</TableHead>
            <TableHead className="font-semibold">{t('user')}</TableHead>
            <TableHead className="font-semibold">{t('email')}</TableHead>
            <TableHead className="font-semibold">{t('role')}</TableHead>
            <TableHead className="font-semibold">{t('occupation')}</TableHead>
            <TableHead className="font-semibold">{t('status')}</TableHead>
            <TableHead className="font-semibold text-right pr-6">{tCommon('actions')}</TableHead>
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
                    />
                    <AvatarFallback>
                      {item.profile.full_name[0]}
                    </AvatarFallback>
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
                <span className="font-medium text-foreground">{item.email}</span>
              </TableCell>

              <TableCell>{getRoleBadge(item.role)}</TableCell>

              <TableCell>
                <span className="text-muted-foreground">
                  {item.profile.occupation || "N/A"}
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  variant={item.is_active ? "default" : "secondary"}
                  className={
                    item.is_active
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }
                >
                  {item.is_active ? tCommon('active') : tCommon('inactive')}
                </Badge>
              </TableCell>

              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/admin/users/${item.profile.identification_number}`
                      )
                    }
                    className="h-8 gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tCommon('view')}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-8 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tCommon('delete')}</span>
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
