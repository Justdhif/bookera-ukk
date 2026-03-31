import { CreateBookData, UpdateBookData } from "@/types/book";

export const buildBookFormData = (
  data: CreateBookData | UpdateBookData,
): FormData => {
  const formData = new FormData();
  formData.append("title", (data.title ?? "").trim());
  formData.append("language", (data.language ?? "").trim());
  formData.append("description", (data.description ?? "").trim());
  formData.append("is_active", (data.is_active ?? true) ? "1" : "0");
  if (data.isbn) formData.append("isbn", data.isbn.trim());
  if (data.publication_year)
    formData.append("publication_year", data.publication_year);
  data.category_ids?.forEach((id) =>
    formData.append("category_ids[]", String(id)),
  );
  data.author_ids?.forEach((id) => formData.append("author_ids[]", String(id)));
  data.publisher_ids?.forEach((id) =>
    formData.append("publisher_ids[]", String(id)),
  );
  if (data.cover_image) formData.append("cover_image", data.cover_image);
  return formData;
};
