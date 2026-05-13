import { CreateUserData, UpdateUserData } from "@/types/user";

export const buildUserFormData = (
  data: CreateUserData | UpdateUserData,
): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "avatar") {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string") {
          formData.append(key, value);
        }
      } else if (key === "is_active") {
        formData.append(key, value ? "true" : "false");
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};
