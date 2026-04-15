import PublisherDetailClient from "@/components/custom-ui/content/public/PublisherDetailClient";

export default async function PublisherDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <PublisherDetailClient slug={slug} />;
}
