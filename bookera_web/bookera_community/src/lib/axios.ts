import axios from "axios";
import { getCookie } from "cookies-next";
import { defaultLocale, Locale } from "@/i18n/config";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");
  const locale = (getCookie("NEXT_LOCALE") as Locale | undefined) ?? defaultLocale;

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Locale"] = locale;
  config.headers["Accept-Language"] =
    locale === "id" ? "id-ID,id;q=0.9,en;q=0.8" : "en-US,en;q=0.9";

  return config;
});

export default api;
