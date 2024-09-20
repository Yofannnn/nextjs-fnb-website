"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reservation } from "@/types/reservation.type";
import { useRouter } from "next/navigation";

export default function ManageReservationPage({
  reservationDetails,
}: {
  reservationDetails: Reservation;
}) {
  if (!reservationDetails.customerEmail)
    return <InputWhenReservationDetailsIsInvalid />;

  return (
    <>
      <div>
        <h1>{reservationDetails.customerName}</h1>
        <h1>{reservationDetails.customerEmail}</h1>
        <h1>{reservationDetails.partySize}</h1>
        <h1>{reservationDetails.reservationDate}</h1>
        <h1>{reservationDetails.reservationTime}</h1>
        <h1>{reservationDetails.seatingPreference}</h1>
        <h1>{reservationDetails.tableOnly}</h1>
      </div>
    </>
  );
}

function InputWhenReservationDetailsIsInvalid() {
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    try {
      const res = await fetch(`/api/reservation/guest/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const response = await res.json();
      router.push(`/manage-reservation/${response.link}`);
    } catch (error: any) {
      return error.message;
    }
  }

  return (
    <>
      <div className="w-full min-h-svh flex justify-center items-center px-2 py-10">
        <Card className="max-w-[500px]">
          <CardHeader>
            <CardTitle>Manage Reservation</CardTitle>
            <CardDescription>
              Enter your valid email to manage your reservation
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email used for reservation"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Submit</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
