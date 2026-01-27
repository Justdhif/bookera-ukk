export interface BookCopy {
  book_id: number;
  id: number;
  copy_code: string;
  status: "available" | "borrowed" | "lost";
  created_at: string;
}
