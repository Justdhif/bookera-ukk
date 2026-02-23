"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import EmptyState from "@/components/custom-ui/EmptyState";
import {
  FolderOpen,
  Edit,
  Trash,
  Tag,
} from "lucide-react";
import { getIconByName } from "@/lib/icons";
import { useTranslations } from "next-intl";

export default function CategoryTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations('common');
  
  if (data.length === 0) {
    return (
      <EmptyState
        title={t('noCategories')}
        description={t('noCategoriesDesc')}
        icon={<FolderOpen className="h-10 w-10" />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 text-center">#</TableHead>
          <TableHead className="w-16 text-center font-semibold">Icon</TableHead>
          <TableHead className="font-semibold">Kategori</TableHead>
          <TableHead className="font-semibold">Slug</TableHead>
          <TableHead className="font-semibold">Deskripsi</TableHead>
          <TableHead className="font-semibold text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item, index) => {
          const IconComponent = item.icon ? getIconByName(item.icon) : null;
          
          return (
            <TableRow
              key={item.id}
              className="group hover:bg-primary/5 transition-colors border-b last:border-b-0"
            >
              <TableCell className="font-medium text-center text-muted-foreground">
                {index + 1}
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {IconComponent ? (
                      <IconComponent className="h-4 w-4 text-primary" />
                    ) : (
                      <Tag className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
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
                <Button
                  size="sm"
                  variant="brand"
                  onClick={() => onEdit(item)}
                  className="h-8 gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                  className="h-8 gap-1"
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
      </TableBody>
    </Table>
  );
}
