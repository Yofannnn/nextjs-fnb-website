import Link from "next/link";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { FloatingNav } from "../ui/floating-navbar";

export default function Navbar() {
  const totalItemInCart = useSelector((state: RootState) => state.cart)
    .map((item) => item.quantity)
    .reduce((acc, cur) => acc + cur, 0);

  const paths = [
    "/login",
    "/register",
    "/admin-dashboard",
    "/dashboard",
    "guest",
  ];

  const pathName = usePathname();
  const shouldNotRenderNavbar = paths.some((path) => pathName.startsWith(path));

  if (shouldNotRenderNavbar) return null;

  const textClassName =
    "px-8 py-2.5 rounded-full border border-foreground hover:bg-foreground hover:text-background font-semibold";

  return (
    <header className="relative w-full z-50">
      <FloatingNav className="w-full flex justify-center items-center">
        <nav className="flex justify-between w-[85%] border border-foreground rounded-full mt-3">
          <div className="flex items-center justify-center">
            <Link href="/" className={textClassName}>
              Whiff
            </Link>
            <Link href="/menu" className={textClassName}>
              Menu
            </Link>
            <Link href="/reservation" className={textClassName}>
              Reservation
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Link
              href="/dashboard"
              className="p-2.5 border border-foreground rounded-full hover:bg-foreground hover:text-background"
            >
              <User />
            </Link>
            <Link
              href="/cart"
              className="p-2.5 border border-foreground rounded-full hover:bg-foreground hover:text-background relative"
            >
              <ShoppingCart />
              {totalItemInCart > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-3 text-xs rounded-full hover:text-foreground"
                >
                  {totalItemInCart}
                </Badge>
              )}
            </Link>
          </div>
        </nav>
      </FloatingNav>
    </header>
  );
}
