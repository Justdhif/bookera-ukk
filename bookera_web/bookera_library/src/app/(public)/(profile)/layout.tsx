import ProfileSidebar from "@/components/custom-ui/content/public/profile/ProfileSidebar";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full mx-auto w-full">
      <aside className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-4 h-fit">
          <ProfileSidebar slug="me" />
        </div>
      </aside>

      <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}
