export interface BookCopy {
  id: number;
  copy_code: string;
  status: "available" | "borrowed" | "lost";
  created_at: string;
}
