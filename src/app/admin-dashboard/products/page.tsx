"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListFilter, MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { rupiah } from "@/lib/format-currency";
import { deleteProduct } from "@/actions/product.action";

export default function DashboardProduct() {
  const [products, setProducts] = useState<{
    isLoading: Boolean;
    data?: Product[] | undefined;
    error?: string | undefined;
  }>({
    isLoading: true,
    data: undefined,
    error: undefined,
  });
  const route = useRouter();

  useEffect(() => {
    async function getProducts() {
      try {
        const res = await fetch("/api/products/read", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        setProducts({ isLoading: false, data: await res.json() });
      } catch (error: any) {
        setProducts({ isLoading: false, error: error.message });
      }
    }

    getProducts();
  }, []);

  const [filterProductBy, setFilterProductBy] = useState<
    "available" | "unavailable" | "food" | "drink" | "snack" | ""
  >("");

  const filteredProducts = products.data?.filter((product) => {
    if (filterProductBy === "available") {
      return product.isAvailable === true;
    }
    if (filterProductBy === "unavailable") {
      return product.isAvailable === false;
    }
    if (filterProductBy === "food") {
      return product.category === "food";
    }
    if (filterProductBy === "drink") {
      return product.category === "drink";
    }
    if (filterProductBy === "snack") {
      return product.category === "snack";
    }
    return product;
  });

  async function handleDeleteProduct(id: string, imageUrl: string) {
    const status = await deleteProduct(id, imageUrl);
    if (status.success) route.refresh();
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("")}
                  checked={filterProductBy === ""}
                >
                  All Products
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("available")}
                  checked={filterProductBy === "available"}
                >
                  Available
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("unavailable")}
                  checked={filterProductBy === "unavailable"}
                >
                  Unavailable
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("food")}
                  checked={filterProductBy === "food"}
                >
                  Food
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("drink")}
                  checked={filterProductBy === "drink"}
                >
                  Drink
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => setFilterProductBy("snack")}
                  checked={filterProductBy === "snack"}
                >
                  Snack
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/admin-dashboard/products/add-product">
              <Button size="sm" className="h-7 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </Link>
          </div>
        </div>
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your products and view their sales performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.isLoading ? (
              <div className="w-full flex justify-center items-center p-5">
                <h1 className="text-2xl">Loading...</h1>
              </div>
            ) : products.data ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Price
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Total Sales
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product, i) => (
                    <TableRow key={i}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt="Product image"
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {rupiah.format(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {product.category
                            .split("")
                            .map((text, i) =>
                              i === 0 ? text.toUpperCase() : text
                            )
                            .join("")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.totalSales}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  route.push(
                                    `/admin-dashboard/products/edit-product?id=${product._id}`
                                  )
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-danger hover:text-danger">
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete{" "}
                                <strong>{product.title}</strong> and remove from
                                Database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive"
                                onClick={() =>
                                  handleDeleteProduct(
                                    product._id,
                                    product.image
                                  )
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="w-full flex justify-center items-center p-5">
                <h1 className="text-2xl">Error : {products.error}</h1>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{filteredProducts?.length}</strong> of{" "}
              <strong>{products.data?.length}</strong> products
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
