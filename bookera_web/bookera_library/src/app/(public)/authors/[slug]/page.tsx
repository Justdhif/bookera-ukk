import AuthorDetailClient from "@/components/custom-ui/content/public/AuthorDetailClient";

export default async function AuthorDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <AuthorDetailClient slug={slug} />;
}
