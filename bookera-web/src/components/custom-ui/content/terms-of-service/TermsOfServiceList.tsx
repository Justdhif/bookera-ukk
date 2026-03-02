"use client";

import { Button } from "@/components/ui/button";
import { TermsOfService } from "@/types/terms-of-service";
import EmptyState from "@/components/custom-ui/EmptyState";
import { FileText, Edit2, Trash, Calendar, Clock } from "lucide-react";
export default function TermsOfServiceList({
  data,
  onEdit,
  onDelete,
}: {
  data: TermsOfService[];
  onEdit: (item: TermsOfService) => void;
  onDelete: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={"No Terms of Service yet"}
        description={"Terms of Service will appear after you add it."}
        icon={<FileText className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={item.id}
          className="border-l-4 border-brand-primary/30 pl-4 py-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold text-brand-primary-dark dark:text-brand-primary-light">
                {item.title}
              </h2>
              
              <div
                className="text-gray-700 dark:text-gray-300 space-y-2 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Dibuat:{" "}
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Diperbarui:{" "}
                    {new Date(item.updated_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pr-2">
              <Button
                variant="brand"
                size="sm"
                onClick={() => onEdit(item)}
                className="h-8 gap-1"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="h-8 gap-1"
              >
                <Trash className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
