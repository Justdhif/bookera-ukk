import type { Metadata } from "next";
import AccountLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Bookera | Account",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
