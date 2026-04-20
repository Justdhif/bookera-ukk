import type { Metadata } from "next";
import LoginClient from "@/components/custom-ui/content/login/LoginClient";

export const metadata: Metadata = {
  title: "Bookera | Login",
};

export default function LoginPage() {
  return <LoginClient />;
}
