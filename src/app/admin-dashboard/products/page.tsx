"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, editProductAvailabilityAction } from "@/actions/product.action";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoaderComponent } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ListFilter, MoreHorizontal, PlusCircle, RefreshCw } from "lucide-react";
import { Product } from "@/types/product.type";
import { rupiah } from "@/lib/format-currency";

export default function DashboardProduct() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const category = searchParams.get("category");
  const availability = searchParams.get("availability");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const queryKey = ["products", category].filter(Boolean);

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const query = category ? `?category=${category}` : "";
      const response = await fetch(`/api/products${query}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const products: Product[] = data;

  /**
   * Filter products by availability.
   *
   * @param {string} availability - "available" or "unavailable".
   */
  useEffect(() => {
    if (availability === "available") {
      setFilteredProducts(products.filter((product) => product.isAvailable === true) || []);
    } else if (availability === "unavailable") {
      setFilteredProducts(products.filter((product) => product.isAvailable === false) || []);
    } else {
      setFilteredProducts(products || []);
    }
  }, [availability, products]);

  const handleEditProductAvailability = useMutation({
    /**
     * Mutation function to toggle product availability.
     *
     * @param {object} params - The parameters for the mutation.
     * @param {string} params.productId - The ID of the product to update.
     * @param {boolean} params.isAvailable - The current availability status of the product.
     * @param {string} params.productTitle - The title of the product.
     * @returns {Promise<void>}
     */
    mutationFn: async ({ productId, isAvailable }: { productId: string; isAvailable: boolean; productTitle: string }) => {
      // Calls the action to edit product availability, toggling its current state
      await editProductAvailabilityAction(productId, !isAvailable);
    },
    /**
     * Function to be called when the mutation is successful.
     *
     * @param {unknown} data - The data returned from the mutation.
     * @param {object} variables - The variables passed to the mutation function.
     * @param {string} variables.productId - The ID of the product to update.
     * @param {boolean} variables.isAvailable - The current availability status of the product.
     * @param {string} variables.productTitle - The title of the product.
     */
    onSuccess: (data, variables) => {
      // Invalidate the cache to fetch the latest data
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success to update product availability.",
        description: `${variables.productTitle} is now ${!variables.isAvailable ? "available" : "unavailable"}`,
      });
    },
    /**
     * Function to be called when the mutation encounters an error.
     *
     * @param {object} error - The error object containing the error message.
     */
    onError: (error) => {
      // Display a toast notification with error details
      toast({
        title: "Upsss! Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = useMutation({
    /**
     * Deletes a product by its ID and removes the associated image from the cloud storage.
     * @param {string} productId - The ID of the product to delete.
     * @param {string} imageUrl - The URL of the product image to remove from the cloud storage.
     * @param {string} productTitle - The title of the product to be used in the toast notification.
     * @returns {Promise<void>}
     */
    mutationFn: async ({ productId, imageUrl }: { productId: string; imageUrl: string; productTitle: string }) => {
      await deleteProduct(productId, imageUrl);
    },
    /**
     * Function to be called when the mutation is successful.
     *
     * @param {unknown} data - The data returned from the mutation.
     * @param {object} variables - The variables passed to the mutation function.
     * @param {string} variables.productId - The ID of the product to delete.
     * @param {string} variables.imageUrl - The URL of the product image to remove from the cloud storage.
     * @param {string} variables.productTitle - The title of the product to be used in the toast notification.
     */
    onSuccess: (data, variables) => {
      // Invalidate the cache to fetch the latest data
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success to delete product.",
        description: `${variables.productTitle} was deleted.`,
      });
    },
    /**
     * Function to be called when the mutation encounters an error.
     *
     * @param {Error} error - The error object containing the error message.
     * @param {object} variables - The variables passed to the mutation function.
     * @param {object} context - The context object containing information about the mutation.
     */
    onError(error, variables, context) {
      toast({
        variant: "destructive",
        title: "Upsss! Something went wrong.",
        description: error.message,
      });
    },
  });

  /**
   * Updates the query parameter with the given key and value.
   * Uses the useSearchParams hook to get the current query parameters.
   * Replaces the current URL with the new query parameter.
   * @param {string} param - The key of the query parameter to update.
   * @param {string} value - The new value of the query parameter.
   */
  function handleUpdateQueryParam(param: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(param, value);
    route.replace(`?${params.toString()}`);
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
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["available", "unavailable"].map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    onClick={() => handleUpdateQueryParam("availability", option)}
                    checked={availability === option}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                {["food", "drink", "snack"].map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    onClick={() => handleUpdateQueryParam("category", option)}
                    checked={category === option}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem onClick={() => route.replace("/admin-dashboard/products")}>
                  Clear Filter
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/admin-dashboard/products/add-product">
              <Button size="sm" className="h-7 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Product</span>
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products and view their sales performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoaderComponent />
            ) : products ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Total Sales</TableHead>
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
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{rupiah.format(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.isAvailable ? "Available" : "Unavailable"}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {product.category
                            .split("")
                            .map((text, i) => (i === 0 ? text.toUpperCase() : text))
                            .join("")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.totalSales}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => route.push(`/admin-dashboard/products/edit-product/${product.productId}`)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditProductAvailability.mutate({
                                    productId: product.productId,
                                    isAvailable: product.isAvailable,
                                    productTitle: product.title,
                                  })
                                }
                              >
                                {product.isAvailable ? "Unavailable" : "Available"}
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-danger hover:text-danger">Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete <strong>{product.title}</strong>{" "}
                                and remove from Database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive"
                                onClick={() =>
                                  handleDeleteProduct.mutate({
                                    productId: product.productId,
                                    imageUrl: product.image,
                                    productTitle: product.title,
                                  })
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
                <h1 className="text-lg md:text-xl lg:text-2xl">Error : {error?.message}</h1>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
