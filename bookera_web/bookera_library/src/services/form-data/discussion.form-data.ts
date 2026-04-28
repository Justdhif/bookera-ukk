import { CreateDiscussionData, UpdateDiscussionData } from "@/types/discussion";

export const buildDiscussionFormData = (
  data: CreateDiscussionData | UpdateDiscussionData,
): FormData => {
  const formData = new FormData();
  formData.append("caption", (data.caption ?? "").trim());
  
  if (data.images) {
    data.images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images[]", image);
      }
    });
  }

  return formData;
};
