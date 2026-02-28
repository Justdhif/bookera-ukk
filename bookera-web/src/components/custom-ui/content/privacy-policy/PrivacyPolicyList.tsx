"use client";

import { Button } from "@/components/ui/button";
import { PrivacyPolicy } from "@/types/privacy-policy";
import EmptyState from "@/components/custom-ui/EmptyState";
import { Shield, Edit, Trash2, Calendar, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export default function PrivacyPolicyList({
  data,
  onEdit,
  onDelete,
}: {
  data: PrivacyPolicy[];
  onEdit: (item: PrivacyPolicy) => void;
  onDelete: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={"No Privacy Policy yet"}
        description={"Privacy Policy will appear after you add it."}
        icon={<Shield className="h-10 w-10" />}
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
                variant="outline"
                size="icon"
                onClick={() => onEdit(item)}
                className="h-9 w-9"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{"Delete Privacy Policy"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {"Are you sure you want to delete this Privacy Policy? Deleted data cannot be recovered."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {"Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
