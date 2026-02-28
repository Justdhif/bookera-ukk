import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";

export type UserRole = User["role"];

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  is_active?: boolean;
  full_name: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  birth_date?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  identification_number?: string;
  occupation?: string;
  institution?: string;
  avatar?: File | string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  email: string;
  role: UserRole;
  full_name: string;
}

export const userService = {
  
  getAll: (search?: string, role?: string, status?: string) =>
    api.get<ApiResponse<User[]>>("/admin/users", { params: { search, role, status } }),

  
  show: (id: number) => api.get<ApiResponse<User>>(`/admin/users/${id}`),

  
  showByIdentification: (identificationNumber: string) =>
    api.get<ApiResponse<User>>(`/admin/users/identification/${identificationNumber}`),

  
  create: (data: CreateUserData) => {
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
    return api.post<ApiResponse<User>>("/admin/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  
  update: (id: number, data: UpdateUserData) => {
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
    return api.post<ApiResponse<User>>(`/users/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  
  delete: (id: number) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),
};
