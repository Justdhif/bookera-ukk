"use client";
import { useRouter } from "next/navigation";

import { ArrowLeft, Edit2, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import BookListSkeleton from "@/components/custom-ui/content/public/BookListSkeleton";

export default function SaveDetailSkeleton() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {"Back"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          <div className="w-full lg:w-64 shrink-0">
            <Skeleton className="aspect-3/4 w-full rounded-lg shadow-lg" />
          </div>

          
          <div className="flex flex-col justify-end flex-1 space-y-3">
            <p className="text-muted-foreground text-sm">{"Collection"}</p>

            <Skeleton className="h-10 w-3/4 max-w-xl" />

            <Skeleton className="h-4 w-full max-w-2xl" />

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Skeleton className="h-4 w-24" />
              <span className="text-muted-foreground">•</span>
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="mt-2 flex gap-2">
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled
              >
                <Edit2 className="h-3.5 w-3.5" />
                {"Edit"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 gap-1.5"
                disabled
              >
                <Trash className="h-3.5 w-3.5" />
                {"Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          
          <Button size="sm" disabled>
            {"Borrow Selected"}
          </Button>

          <ToggleGroup type="single" value="grid">
            <ToggleGroupItem value="grid" aria-label="Grid view">
              
              <Skeleton className="h-4 w-4 rounded" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <Skeleton className="h-4 w-4 rounded" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <BookListSkeleton />
      </div>
    </div>
  );
}
