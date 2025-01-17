"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardTransactionList from "@/components/pages/DashboardTransactionList";

export default function DashboardTransactionListPage() {
  const searchParams = useSearchParams();
  const orderType = searchParams.get("orderType");
  const paymentPurpose = searchParams.get("paymentPurpose");
  const transactionStatus = searchParams.get("transactionStatus");
  const queryKey = ["transaction-list", orderType, paymentPurpose, transactionStatus].filter(Boolean);
  const queryParams = {
    ...(orderType && { orderType }),
    ...(paymentPurpose && { paymentPurpose }),
    ...(transactionStatus && { transactionStatus }),
  };
  const queryString = new URLSearchParams(queryParams).toString();

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/transaction/user?${queryString}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  return (
    <DashboardTransactionList
      orderType={orderType}
      paymentPurpose={paymentPurpose}
      transactionStatus={transactionStatus}
      isLoading={isLoading}
      error={error}
      transactionList={data || []}
    />
  );
}
