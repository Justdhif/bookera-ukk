import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 text-center font-semibold">
            <Skeleton className="h-4 w-4 mx-auto" />
          </TableHead>
          <TableHead className="w-16 text-center font-semibold">
            <Skeleton className="h-4 w-8 mx-auto" />
          </TableHead>
          <TableHead className="font-semibold">
            <Skeleton className="h-4 w-20" />
          </TableHead>
          <TableHead className="font-semibold">
            <Skeleton className="h-4 w-16" />
          </TableHead>
          <TableHead className="font-semibold">
            <Skeleton className="h-4 w-24" />
          </TableHead>
          <TableHead className="font-semibold text-right">
            <Skeleton className="h-4 w-12 ml-auto" />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow
            key={index}
            className="hover:bg-primary/5 transition-colors border-b last:border-b-0"
          >
            <TableCell className="text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </TableCell>

            <TableCell className="text-center">
              <div className="flex justify-center">
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-5 w-24 rounded-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-48" />
            </TableCell>

            <TableCell>
              <div className="flex justify-end items-center gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
