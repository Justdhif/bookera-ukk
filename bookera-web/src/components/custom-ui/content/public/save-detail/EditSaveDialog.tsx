"use client";

import { useState } from "react";
import { Save } from "@/types/save";
import { saveService } from "@/services/save.service";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  save: Save;
  onSuccess: () => void;
}

export default function EditSaveDialog({
  open,
  onOpenChange,
  save,
  onSuccess,
}: EditSaveDialogProps) {
  const [formData, setFormData] = useState({
    name: save.name,
    description: save.description || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsUpdating(true);
    try {
      await saveService.update(save.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      toast.success("Collection updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update collection");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Edit Collection"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" variant="required">{"Name"}</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={"Enter collection name"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{"Description"}</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={"Enter collection description"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            {"Cancel"}
          </Button>
          <Button
            variant="submit"
            onClick={handleUpdate}
            disabled={isUpdating || !formData.name.trim()}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
