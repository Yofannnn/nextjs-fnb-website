import MemberOnlineOrderDetailsPage from "@/components/pages/MemberOnlineOrderDetailsPage";
import { verifySession } from "@/lib/dal";
import { ProductSelection } from "@/types/online-order.type";
import { Product } from "@/types/product.type";

async function fetchOnlineOrderDetails(userId: string, orderId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/online-order?accessId=${userId}&orderId=${orderId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.statusText);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function fetchOrderItems(uniqueProductIds: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/products?productsId=${uniqueProductIds}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.statusText);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default async function DashboardOnlineOrderDetails({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  const { isAuth, userId } = await verifySession();
  if (!isAuth) throw new Error("User not authenticated, please login.");

  const onlineOrderDetails = await fetchOnlineOrderDetails(
    userId as string,
    orderId
  );
  if (!onlineOrderDetails.success) throw new Error(onlineOrderDetails.message);

  const uniqueProductIds = [
    ...new Set(
      onlineOrderDetails.data.items.map(
        (item: ProductSelection) => item.productId
      )
    ),
  ].join("-");

  const orderItems = await fetchOrderItems(uniqueProductIds);
  if (!orderItems.success) throw new Error(orderItems.message);

  const orderItemsMap = new Map(
    orderItems.data.map((product: Product) => [product._id, product])
  );

  const enrichedOrderItems = onlineOrderDetails.data.items
    .map((item: ProductSelection) => {
      const product = orderItemsMap.get(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);

  return (
    <MemberOnlineOrderDetailsPage
      onlineOrderDetails={onlineOrderDetails.data}
      orderItems={enrichedOrderItems}
    />
  );
}
