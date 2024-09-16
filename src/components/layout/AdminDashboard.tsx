"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  LayoutDashboard,
  LineChart,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  User,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname();
  const sessionTitle = pathName.split("/").filter((x) => x);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/admin/home"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName.includes("/dashboard/admin/home") &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/admin/products"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName.includes("/dashboard/admin/products") &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <Package className="h-5 w-5" />
                    <span className="sr-only">Products</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Products</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/admin/customers"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName.includes("/dashboard/admin/customers") &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <Users2 className="h-5 w-5" />
                    <span className="sr-only">Customers</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Customers</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/admin/analytics"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName.includes("/dashboard/admin/analytics") &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <LineChart className="h-5 w-5" />
                    <span className="sr-only">Analytics</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Analytics</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/admin/settings"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathName.includes("/dashboard/admin/settings") &&
                        "bg-primary text-lg font-semibold text-primary-foreground rounded-full hover:text-background"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <nav className="grid gap-6 text-lg font-medium">
                  <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                    <LayoutDashboard className="h-5 w-5 transition-all group-hover:scale-110" />
                  </div>
                  <Link
                    href="/dashboard/admin/home"
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName.includes("/dashboard/admin/home") &&
                        "text-foreground"
                    )}
                  >
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/admin/orders"
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName.includes("/dashboard/admin/orders") &&
                        "text-foreground"
                    )}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Orders
                  </Link>
                  <Link
                    href="/dashboard/admin/products"
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName.includes("/dashboard/admin/products") &&
                        "text-foreground"
                    )}
                  >
                    <Package className="h-5 w-5" />
                    Products
                  </Link>
                  <Link
                    href="/dashboard/admin/customers"
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName.includes("/dashboard/admin/customers") &&
                        "text-foreground"
                    )}
                  >
                    <Users2 className="h-5 w-5" />
                    Customers
                  </Link>
                  <Link
                    href="/dashboard/admin/settings"
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathName.includes("/dashboard/admin/settings") &&
                        "text-foreground"
                    )}
                  >
                    <LineChart className="h-5 w-5" />
                    Settings
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="hidden md:block md:font-bold md:text-xl">
              {sessionTitle[sessionTitle.length - 1]}
            </h1>
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
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  {/* here is user image */}
                  {/* <Image
                    src="/placeholder-user.jpg"
                    width={36}
                    height={36}
                    alt="Avatar"
                    className="overflow-hidden rounded-full"
                  /> */}
                  <User className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
