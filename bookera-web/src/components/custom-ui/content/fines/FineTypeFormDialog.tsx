"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FineType } from "@/types/fine";
import { fineTypeService } from "@/services/fine.service";
import { toast } from "sonner";
export default function FineTypeFormDialog({
  open,
  setOpen,
  fineType,
  onSuccess,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  fineType: FineType | null;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"lost" | "damaged" | "late">("lost");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setType("lost");
      setAmount("");
      setDescription("");
    } else if (fineType) {
      setName(fineType.name);
      setType(fineType.type);
      setAmount(fineType.amount.toString());
      setDescription(fineType.description || "");
    }
  }, [fineType, open]);

  const handleSubmit = async () => {
    if (!name || !amount) {
      toast.error("Name and amount are required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        type,
        amount: parseFloat(amount),
        description: description || undefined,
      };

      if (fineType) {
        await fineTypeService.update(fineType.id, payload);
        toast.success("Fine type updated successfully");
      } else {
        await fineTypeService.create(payload);
        toast.success("Fine type added successfully");
      }

      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {fineType ? "Edit" : "Add"} {"Fine Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {"Fine Type Name"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder={"Fine name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              {"Fine Type"} <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">{"Lost"}</SelectItem>
                <SelectItem value="damaged">{"Damaged"}</SelectItem>
                <SelectItem value="late">{"Late"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {"Amount (Rp)"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder={"100000"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{"Book Description"}</Label>
            <Textarea
              id="description"
              placeholder={"Fine description (optional)"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            variant="submit"
            disabled={isLoading || !name || !amount}
            loading={isLoading}
            className="w-full"
          >
            {isLoading
              ? fineType
                ? "Saving..."
                : "Adding..."
              : fineType
                ? "Save"
                : "Add Fine Type"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
