import type { Metadata } from "next";
import PaymentClient from "@/components/custom-ui/content/public/payment/PaymentClient";

export const metadata: Metadata = {
  title: "Admin Payment | Bookera",
  description: "Selesaikan pembayaran administrasi dengan aman",
};

export default function AdminPaymentPage() {
  return <PaymentClient />;
}
