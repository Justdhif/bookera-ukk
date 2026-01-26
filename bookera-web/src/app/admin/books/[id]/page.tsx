import BookDetailClient from "@/components/custom-ui/content/book/BookDetailClient";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseInt(id);

  // if (isNaN(bookId)) {
  //   return <div>ID buku tidak valid</div>;
  // }

  return <BookDetailClient id={bookId} />;
}
