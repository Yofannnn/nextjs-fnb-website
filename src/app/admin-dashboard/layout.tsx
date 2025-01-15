"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpenCheck,
  Home,
  LayoutDashboard,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShoppingBasket,
  User,
  Wallet,
} from "lucide-react";

const dashboardPath = "/admin-dashboard";
const dashboardProductsPath = "/admin-dashboard/products";
const dashboardReservationPath = "/admin-dashboard/reservation";
const dashboardOnlineOrderPath = "/admin-dashboard/online-order";
const dashboardTransactionPath = "/admin-dashboard/transaction";
const dashboardSettingsPath = "/admin-dashboard/settings";

const navigation = [
  { title: "Home", href: "/", icon: Home },
  { title: "Dashboard", href: dashboardPath, icon: User },
  { title: "Products", href: dashboardProductsPath, icon: Package },
  { title: "Reservation", href: dashboardReservationPath, icon: BookOpenCheck },
  { title: "Online Order", href: dashboardOnlineOrderPath, icon: ShoppingBasket },
  { title: "Transaction", href: dashboardTransactionPath, icon: Wallet },
  { title: "Settings", href: dashboardSettingsPath, icon: Settings },
];

export default function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathName = usePathname();
  const sessionTitle = pathName.split("/").filter((x) => x);
  const capitalizedTitle = sessionTitle[sessionTitle.length - 1]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleClickLogOut = async () => {
    await logoutAction();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          {navigation.map((item) => (
            <TooltipProvider key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName === item.href &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader>
                <SheetTitle />
                <SheetDescription />
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                  <LayoutDashboard className="h-5 w-5 transition-all group-hover:scale-110" />
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName === item.href && "text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="hidden md:block md:font-bold md:text-xl">{capitalizedTitle}</h1>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <User className="size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClickLogOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
