import { CreatePostData, UpdatePostData } from "@/types/discussion";

export const buildDiscussionPostFormData = (
  data: CreatePostData | UpdatePostData,
): FormData => {
  const formData = new FormData();
  if (data.caption !== undefined) formData.append("caption", data.caption);
  data.images?.forEach((f) => formData.append("images[]", f));
  return formData;
};
