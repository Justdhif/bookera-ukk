export interface NewsFormValues {
  title: string;
  content: string;
  image?: File | null;
}

export const buildNewsFormData = (values: NewsFormValues): FormData => {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("content", values.content);
  if (values.image) {
    formData.append("image", values.image);
  }
  return formData;
};

export interface NewsCommentFormValues {
  content?: string;
  image?: File | null;
  parent_id?: number | null;
}

export const buildNewsCommentFormData = (values: NewsCommentFormValues): FormData => {
  const formData = new FormData();
  if (values.content) formData.append("content", values.content);
  if (values.image) formData.append("image", values.image);
  if (values.parent_id) formData.append("parent_id", values.parent_id.toString());
  return formData;
};
