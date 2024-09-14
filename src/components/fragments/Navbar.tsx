import Link from "next/link";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { CircleUserRound, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const totalItemInCart = useSelector((state: RootState) => state.cart)
    .map((item) => item.quantity)
    .reduce((acc, cur) => acc + cur, 0);

  return (
    <>
      <nav className="w-full h-[60px] flex justify-between items-center bg-muted">
        <h1 className="ml-8">Brand Name</h1>
        <div className="w-[60%] flex justify-around mr-8">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/reservation">Reservation</Link>
          <Link href="/dashboard">
            <CircleUserRound />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart />
            {totalItemInCart > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2/4 -right-3/4 rounded-full"
              >
                {totalItemInCart}
              </Badge>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}
