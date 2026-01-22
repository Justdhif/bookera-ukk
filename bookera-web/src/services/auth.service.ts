import api from "@/lib/axios";

export const authService = {
  login: (email: string, password: string) =>
    api.post("/login", { email, password }),

  me: () => api.get("/me"),

  logout: () => api.post("/logout"),
};
