"use client";

import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Upload, X, CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface BookCoverCardProps {
  book: Book;
  coverPreview: string;
  isEditMode: boolean;
  formData: any;
  setFormData: (data: any) => void;
  setCoverPreview: (preview: string) => void;
}

export default function BookCoverCard({
  book,
  coverPreview,
  isEditMode,
  formData,
  setFormData,
  setCoverPreview,
}: BookCoverCardProps) {
  const t = useTranslations('common');

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('bookCover')}</CardTitle>
        <CardDescription>
          {isEditMode ? t('uploadCover') : t('currentCover')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex flex-col gap-4 flex-1">
          {coverPreview ? (
            <div className="relative w-full flex-1">
              <img
                src={coverPreview}
                alt={t('bookCover')}
                className="w-full h-full object-cover rounded-lg border"
              />
              {isEditMode && formData.cover_image && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFormData({ ...formData, cover_image: null });
                    setCoverPreview(book.cover_image_url || "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/30">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('noCover')}</p>
            </div>
          )}

          {isEditMode && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("cover_image")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('uploadNewCover')}
              </Button>
              <Input
                id="cover_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />
            </>
          )}
        </div>

        <div className="rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">
                {isEditMode
                  ? formData.is_active
                    ? "Active"
                    : "Inactive"
                  : book.is_active
                    ? "Active"
                    : "Inactive"}
              </p>
            </div>
            {isEditMode ? (
              <Switch
                checked={formData.is_active}
                onCheckedChange={(value) =>
                  setFormData({ ...formData, is_active: value })
                }
              />
            ) : (
              <Badge variant={book.is_active ? "default" : "secondary"}>
                {book.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
