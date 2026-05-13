import type { Metadata } from "next";
import ForgotPasswordClient from "@/components/custom-ui/content/forgot-password/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Bookera | Forgot Password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
