"use client";

import { reservationTableOnlyAction } from "@/actions/reservation.action";
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
import { User } from "@/types/user.type";
import Image from "next/image";
import Link from "next/link";
import { useFormState } from "react-dom";

export default function ReservationTableOnlyPage({
  user,
}: {
  user: User | undefined;
}) {
  const bindReservationTableOnlyAction = reservationTableOnlyAction.bind(
    null,
    user?.email,
    user?.name
  );
  const [state, action] = useFormState(bindReservationTableOnlyAction, {});

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
                {!user?.role && (
                  <>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="email">Email</Label>
                        <Link
                          href="/register"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Create Member Pass?
                        </Link>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Max Verstappen"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      name="date"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      name="time"
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
                  <Label htmlFor="quota">Party Size</Label>
                  <Select name="quota" required>
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
                  <Label htmlFor="place">Place</Label>
                  <Select name="place" required>
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
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="message"
                    name="message"
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
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.9]"
          />
        </div>
      </div>
    </>
  );
}
