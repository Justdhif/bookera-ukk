export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full mx-auto max-w-7xl">
      {children}
    </div>
  );
}
