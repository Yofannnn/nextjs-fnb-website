import { Product } from "@/types/product.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function MenuPage({ menus }: { menus: Product[] }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 p-1 md:p-3">
        {menus.map((menu, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{menu.title}</CardTitle>
              <CardDescription>{menu.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={menu.image}
                width={500}
                height={500}
                className="w-full"
                alt="menu Image"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link className="text-end" href={`/menu/${menu._id}`}>
                See Details
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
