import BookDetailClient from "@/components/custom-ui/content/public/book-detail/BookDetailClient";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseInt(id);

  return <BookDetailClient id={bookId} />;
}
