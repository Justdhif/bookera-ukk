"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { bookService } from "@/services/book.service";
import { toast } from "sonner";
import { StaggerContainer, FadeUp } from "@/components/custom-ui/motion";

interface ImportBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ImportBookDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportBookDialogProps) {
  const t = useTranslations("book");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t("selectFile") || "Please select a file to import");
      return;
    }

    setImporting(true);
    try {
      await bookService.import(file);
      toast.success(t("importSuccess") || "Books imported successfully");
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error("Error importing books:", error);
      const errorMessage = error.response?.data?.message || t("importError") || "Failed to import books";
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            {t("importBooks") || "Import Books"}
          </DialogTitle>
          <DialogDescription>
            {t("importDesc") || "Upload an Excel file to bulk import books into the library system."}
          </DialogDescription>
        </DialogHeader>

        <StaggerContainer className="grid gap-6 py-4">
          <FadeUp delay={0.1} className="space-y-3">
            <Label className="text-sm font-medium">{t("step2") || "Upload File"}</Label>
            <div className="grid w-full items-center gap-1.5">
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
                  file ? "border-green-400 bg-green-50/30" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer w-full"
                >
                  <div className={`p-3 rounded-full mb-2 ${file ? "bg-green-100" : "bg-slate-100"}`}>
                    <Upload className={`w-5 h-5 ${file ? "text-green-600" : "text-slate-500"}`} />
                  </div>
                  <span className="text-sm font-medium">
                    {file ? file.name : t("clickToUpload") || "Click to upload Excel file"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {t("maxSize") || "Max size 10MB (.xlsx, .xls, .csv)"}
                  </span>
                </label>
              </div>
            </div>
          </FadeUp>
        </StaggerContainer>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={importing}
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            variant="submit"
            className="gap-2"
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {t("startImport") || "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
