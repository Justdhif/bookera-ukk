import { CreatePublisherData, UpdatePublisherData } from "@/types/publisher";

export const buildPublisherFormData = (
  data: CreatePublisherData | UpdatePublisherData,
): FormData => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.photo instanceof File) formData.append("photo", data.photo);
  if (data.is_active !== undefined)
    formData.append("is_active", data.is_active ? "1" : "0");
  return formData;
};
