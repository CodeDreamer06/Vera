import { PlantDetailView } from "@/components/PlantDetailView";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;
  return <PlantDetailView plantId={plantId} />;
}
