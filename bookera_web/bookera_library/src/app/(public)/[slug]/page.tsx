import { redirect } from "next/navigation";

export default function AccountSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/profile`);
}