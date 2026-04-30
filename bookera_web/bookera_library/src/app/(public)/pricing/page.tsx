import type { Metadata } from "next";
import PricingClient from "@/components/custom-ui/content/public/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing | Bookera",
  description: "Upgrade ke Bookera Member dan nikmati fitur premium eksklusif",
};

export default function PricingPage() {
  return <PricingClient />;
}
