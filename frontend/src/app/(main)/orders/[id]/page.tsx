import { OrderDetailPage } from "@/components/user/OrderDetailPage";
import SectionContainer from "@/components/layout/SectionContainer";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SectionContainer className="py-8">
      <OrderDetailPage orderId={id} />
    </SectionContainer>
  );
}
