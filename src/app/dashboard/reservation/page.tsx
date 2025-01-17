"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardReservationList from "@/components/pages/DashboardReservationList";

export default function MemberDashboardReservation() {
  const searchParams = useSearchParams();
  const reservationStatus = searchParams.get("reservationStatus");
  const reservationType = searchParams.get("reservationType");
  const reservationDate = searchParams.get("reservationDate");
  const queryKey = ["reservation-list", reservationStatus, reservationType, reservationDate].filter(Boolean);

  const queryParams = {
    ...(reservationStatus && { reservationStatus }),
    ...(reservationType && { reservationType }),
    ...(reservationDate && { reservationDate }),
  };
  const queryString = new URLSearchParams(queryParams).toString();

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/reservation/user?${queryString}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  return (
    <DashboardReservationList
      reservationDate={reservationDate}
      reservationType={reservationType}
      reservationStatus={reservationStatus}
      reservations={data}
      error={error}
      isLoading={isLoading}
    />
  );
}
