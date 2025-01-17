"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardOnlineOrderList from "@/components/pages/DashboardOnlineOrderList";

export default function DashboardOnlineOrderListPage() {
  const searchParams = useSearchParams();
  const deliveryDate = searchParams.get("deliveryDate");
  const orderStatus = searchParams.get("orderStatus");
  const queryKey = ["online-order-list", deliveryDate, orderStatus].filter(Boolean);
  const queryParams = { ...(deliveryDate && { deliveryDate }), ...(orderStatus && { orderStatus }) };
  const queryString = new URLSearchParams(queryParams).toString();

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/online-order/user?${queryString}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  return (
    <DashboardOnlineOrderList
      deliveryDate={deliveryDate}
      orderStatus={orderStatus}
      onlineOrderList={data || []}
      error={error}
      isLoading={isLoading}
    />
  );
}
