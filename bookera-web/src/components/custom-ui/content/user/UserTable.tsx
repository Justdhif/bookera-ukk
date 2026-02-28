"use client";
import { useRouter } from "next/navigation";

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
import { Users, Eye, Trash } from "lucide-react";
interface Props {
  data: User[];
  onDelete: (id: number) => void;
}

export default function UserTable({ data, onDelete }: Props) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="Get started by adding your first user"
        icon={<Users className="h-10 w-10" />}
      />
    );
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      "officer:catalog":
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      "officer:management":
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      officer: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      user: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };

    const roleLabels = {
      admin: "ADMIN",
      "officer:catalog": "CATALOG OFFICER",
      "officer:management": "MANAGEMENT OFFICER",
      officer: "OFFICER",
      user: "USER",
    };

    return (
      <Badge
        className={variants[role as keyof typeof variants] || variants.user}
      >
        {roleLabels[role as keyof typeof roleLabels] || role.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-16 text-center font-semibold">#</TableHead>
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Occupation</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
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

              <TableCell>{getRoleBadge(item.role)}</TableCell>

              <TableCell>
                <span className="text-muted-foreground">
                  {item.profile.occupation || "N/A"}
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  variant={item.is_active ? "default" : "secondary"}
                  className={`text-white ${
                    item.is_active
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="pr-6">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/admin/users/${item.profile.identification_number}`,
                      )
                    }
                    className="h-8 gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-8 gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
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
