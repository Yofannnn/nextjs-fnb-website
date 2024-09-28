"use client";

import { createReservationTableOnlyAction } from "@/actions/reservation.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";

export default function ReservationTableOnlyPage({
  memberName,
  memberEmail,
}: {
  memberName: string | undefined;
  memberEmail: string | undefined;
}) {
  const bindReservationTableOnlyAction = createReservationTableOnlyAction.bind(
    null,
    memberEmail,
    memberName
  );
  const [state, action] = useFormState(bindReservationTableOnlyAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push(state.data.link);
    }
  }, [router, state]);

  return (
    <>
      <div className="w-full min-h-svh lg:grid lg:grid-cols-2">
        <div className="w-full h-full flex items-center justify-center py-12">
          <div className="mx-auto grid p-2 md:p-0 gap-6 w-[350px]">
            <form action={action}>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-center md:text-start">
                  Reservation
                </h1>
                <p className="text-muted-foreground text-sm text-center md:text-start">
                  Please fill out this form to reserve a table
                </p>
              </div>
              <div className="grid gap-4">
                {!memberEmail && (
                  <>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Link
                          href="/register"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Create Member Pass?
                        </Link>
                      </div>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        type="text"
                        placeholder="Max Verstappen"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="reservationDate">Reservation Date</Label>
                    <Input
                      id="reservationDate"
                      name="reservationDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="reservationTime">Reservation Time</Label>
                    <Input
                      id="reservationTime"
                      name="reservationTime"
                      type="time"
                      min="08:00"
                      max="20:00"
                      required
                      onChange={(e) => {
                        const inputTime = e.target.value;
                        if (inputTime < "08:00") {
                          e.target.value = "08:00";
                        } else if (inputTime > "20:00") {
                          e.target.value = "20:00";
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partySize">Party Size</Label>
                  <Select name="partySize" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select for how many people" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="6">6 People</SelectItem>
                        <SelectItem value="10">10 People</SelectItem>
                        <SelectItem value="20">20 People</SelectItem>
                        <SelectItem value="30">30 People</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seatingPreference">Seating Preference</Label>
                  <Select name="seatingPreference" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Place at Outdoor or Indoor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="indoor">Indoor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialRequest">Special Request</Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="specialRequest"
                    name="specialRequest"
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button type="submit" className="w-full">
                  Process Your Reservation Now
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden bg-muted lg:block">
          <Image
            src="/reservation-table-only.jpg"
            alt="Image"
            width="480"
            height="640"
            className="h-full w-full object-cover dark:brightness-[0.9]"
            priority
          />
        </div>
      </div>
    </>
  );
}
