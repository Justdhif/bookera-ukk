import { CreateAuthorData, UpdateAuthorData } from "@/types/author";

export const buildAuthorFormData = (
  data: CreateAuthorData | UpdateAuthorData,
): FormData => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.photo instanceof File) formData.append("photo", data.photo);
  if (data.is_active !== undefined)
    formData.append("is_active", data.is_active ? "1" : "0");
  return formData;
};
