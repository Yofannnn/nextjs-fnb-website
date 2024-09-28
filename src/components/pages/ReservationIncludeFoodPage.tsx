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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/product.type";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { User } from "@/types/user.type";
import { createReservationIncludesDishAction } from "@/actions/reservation.action";
import { useFormState } from "react-dom";
import { rupiah } from "@/lib/format-currency";
import { useRouter } from "next/navigation";

interface MenuForReservation {
  id: string;
  title: string;
  price: number;
  category: string;
  quantity: number;
}

export default function ReservationIncludeFoodPage({
  user,
}: {
  user: User | undefined;
}) {
  const [menusForReservation, setMenusForReservation] = useState<
    MenuForReservation[]
  >([]);

  const bookedMenus = menusForReservation.map((menu) => {
    return { productId: menu.id, quantity: menu.quantity };
  });

  const total = menusForReservation
    .map((reservation) => reservation.price * reservation.quantity)
    .reduce((acc, cur) => acc + cur, 0);

  const downPayment = (total * 50) / 100;

  const useReservationIncludesDish = createReservationIncludesDishAction.bind(
    null,
    user?.email,
    user?.name,
    bookedMenus,
    downPayment,
    total
  );

  const [state, action] = useFormState(useReservationIncludesDish, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push(state.data.link);
    }
  }, [router, state]);

  function handleAddItem(product: MenuForReservation) {
    setMenusForReservation((prev) => {
      const findIndex = prev.findIndex((item) => item.id === product.id);
      if (findIndex !== -1) {
        return prev.map((item) => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        return [...prev, product];
      }
    });
  }

  function handleIncrement(id: string) {
    setMenusForReservation((prev) => {
      return prev.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }
        return product;
      });
    });
  }

  function handleDecrement(id: string) {
    setMenusForReservation((prev) => {
      return prev.map((product) => {
        if (product.quantity === 1) return product;
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity - 1,
          };
        }
        return product;
      });
    });
  }

  function handleRemove(id: string) {
    setMenusForReservation((prev) => {
      return prev.filter((product) => product.id !== id);
    });
  }

  return (
    <>
      <div className="mx-auto grid gap-3 md:grid-cols-[1fr_250px] lg:grid-cols-5 lg:gap-5 px-2 md:px-4 py-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Reservation</CardTitle>
              <CardDescription>
                Please fill out this form to reserve a table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={action}>
                <div className="grid gap-4">
                  {!user?.role && (
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
                    <Label htmlFor="seatingPreference">
                      Seating Preference
                    </Label>
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
                  <div className="grid gap-2">
                    <Label>Bill</Label>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Downpayment</span>
                      <span>{rupiah.format(downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span>{rupiah.format(total)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button type="submit" className="w-full">
                    Process Your Reservation Now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Include Food</CardTitle>
              <CardDescription>
                Select menu that you want to include
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div>
                  {menusForReservation.filter(
                    (item) => item.category === "food"
                  ).length > 0 && (
                    <>
                      <h4>Food</h4>
                      <div>
                        {menusForReservation
                          .filter((item) => item.category === "food")
                          .map((menu, i) => (
                            <CardMenuForReservation
                              key={i}
                              product={menu}
                              handleDecrement={handleDecrement}
                              handleIncrement={handleIncrement}
                              handleRemove={handleRemove}
                            />
                          ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {menusForReservation.filter(
                    (item) => item.category === "drink"
                  ).length > 0 && (
                    <>
                      <h4>Drink</h4>
                      <div>
                        {menusForReservation
                          .filter((item) => item.category === "drink")
                          .map((menu, i) => (
                            <CardMenuForReservation
                              key={i}
                              product={menu}
                              handleDecrement={handleDecrement}
                              handleIncrement={handleIncrement}
                              handleRemove={handleRemove}
                            />
                          ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {menusForReservation.filter(
                    (item) => item.category === "snack"
                  ).length > 0 && (
                    <>
                      <h4>Snack</h4>
                      <div>
                        {menusForReservation
                          .filter((item) => item.category === "snack")
                          .map((menu, i) => (
                            <CardMenuForReservation
                              key={i}
                              product={menu}
                              handleDecrement={handleDecrement}
                              handleIncrement={handleIncrement}
                              handleRemove={handleRemove}
                            />
                          ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <DialogMenu handleAdd={handleAddItem} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

const DialogMenu = ({
  handleAdd,
}: {
  handleAdd: (arg0: MenuForReservation) => void;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [menus, setMenus] = useState<Product[]>([]);
  const [isFailedToGetMenus, setIsFailedToGetMenus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getAllMenus() {
      try {
        const res = await fetch("/api/products/read", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        const allMenus = await res.json();
        setMenus(allMenus);
        setIsLoading(false);
      } catch (error: any) {
        setIsFailedToGetMenus(error.message);
        setIsLoading(false);
      }
    }
    if (menus.length) return;
    if (isOpen) {
      getAllMenus();
    }
  }, [isOpen, menus.length]);

  return (
    <>
      <Button variant="outline" onClick={onOpen}>
        Open Menu&apos;s
      </Button>
      <Modal
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Menu&apos;s
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <h1 className="my-auto text-2xl text-center">Loading...</h1>
                ) : menus.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {menus.length &&
                      menus.map((menu, i) => (
                        <ProductCard
                          key={i}
                          product={menu}
                          handleClick={handleAdd}
                        />
                      ))}
                  </div>
                ) : (
                  <h1 className="text-center text-xl my-auto">
                    Error: {isFailedToGetMenus}
                  </h1>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

function ProductCard({
  product,
  handleClick,
}: {
  product: Product;
  handleClick: (arg0: MenuForReservation) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
        <CardDescription>{product.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <Image
          src={product.image}
          width={500}
          height={500}
          className="w-fit"
          alt="Product Image"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() =>
            handleClick({
              id: product._id,
              title: product.title,
              price: product.price,
              category: product.category,
              quantity: 1,
            })
          }
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}

function CardMenuForReservation({
  product,
  handleDecrement,
  handleIncrement,
  handleRemove,
}: {
  product: MenuForReservation;
  handleDecrement: (arg0: string) => void;
  handleIncrement: (arg0: string) => void;
  handleRemove: (arg0: string) => void;
}) {
  return (
    <div className="w-full p-3 rounded-lg bg-background my-1">
      <div className="flex justify-between items-start">
        <div>
          <h1>{product.title}</h1>
          <h6>{product.price}</h6>
        </div>
        <div>{product.price * product.quantity}</div>
      </div>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={product.quantity <= 1}
            onClick={() => handleDecrement(product.id)}
          >
            <MinusIcon />
          </Button>
          <div>{product.quantity}</div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleIncrement(product.id)}
          >
            <PlusIcon />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleRemove(product.id)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
