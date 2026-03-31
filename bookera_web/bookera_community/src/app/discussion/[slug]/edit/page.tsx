import { redirect } from "next/navigation";

export default function EditPostPage({ params }: { params: { slug: string } }) {
  redirect(`/discussion/${params.slug}`);
}
