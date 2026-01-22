import PublicHeader from "@/components/custom-ui/navbar/PublicHeader";
import "@/app/globals.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </>
  );
}
