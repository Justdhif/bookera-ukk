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
import { Author } from "@/types/author";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Eye, Trash, UserSquare } from "lucide-react";
import Image from "next/image";

export default function AuthorTable({
  data,
  onView,
  onDelete,
}: {
  data: Author[];
  onView: (author: Author) => void;
  onDelete: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No authors found"
        description="Get started by adding your first author"
        icon={<UserSquare className="h-10 w-10" />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead className="w-16 text-center font-semibold">Photo</TableHead>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead className="font-semibold">Bio</TableHead>
          <TableHead className="font-semibold">Status</TableHead>
          <TableHead className="font-semibold text-right">Actions</TableHead>
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
                      <UserSquare className="h-5 w-5 text-primary" />
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
                {item.bio || "-"}
              </span>
            </TableCell>

            <TableCell>
              <Badge
                className={
                  item.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }
              >
                {item.is_active ? "Active" : "Inactive"}
              </Badge>
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
  );
}
