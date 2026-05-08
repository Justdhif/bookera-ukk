import type { Metadata } from "next";
import PaymentClient from "@/components/custom-ui/content/public/payment/PaymentClient";

export const metadata: Metadata = {
  title: "Payment | Bookera",
  description: "Selesaikan pembayaran Anda dengan aman melalui Bookera Secure Payment",
};

export default function PaymentPage() {
  return <PaymentClient />;
}
