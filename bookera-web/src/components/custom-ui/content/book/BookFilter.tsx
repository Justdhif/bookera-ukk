"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

interface Props {
  categories: Category[];
  onChange: (params: Record<string, string>) => void;
}

export function BookFilter({ categories, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Cari judul / penulis / ISBN"
        onChange={(e) => onChange({ search: e.target.value })}
        className="w-64"
      />

      <Select onValueChange={(v) => onChange({ category_id: v })}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => onChange({ status: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Aktif</SelectItem>
          <SelectItem value="inactive">Nonaktif</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={() => onChange({ has_stock: "1" })}>
        Ada Stok
      </Button>
    </div>
  );
}
