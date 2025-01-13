"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductCategory } from "@/types/product.type";
import { LoaderComponent } from "@/components/ui/loader";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { rupiah } from "@/lib/format-currency";

export default function MenuPage() {
  const pathname = usePathname();
  const route = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
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

  const menus: Product[] = data;

  const rating = (reviews: Product["reviews"]) => reviews?.reduce((acc, cur) => acc + cur.rating, 0);

  function handleUpdateQueryParam(param: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(param, value);
    route.replace(`?${params.toString()}`);
  }

  return (
    <div className="w-full px-2 md:px-4 pt-16">
      <h1 className="text-3xl font-bold mt-4">Our Menu</h1>
      <p className="max-w-[500px] mt-2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti incidunt, deserunt quibusdam veritatis dolor
        provident. Nemo magnam nam dicta dolor consequuntur.
      </p>
      <ul className="flex items-center gap-4 mt-6 py-2 overflow-x-auto">
        {["all", ProductCategory.FOOD, ProductCategory.DRINK, ProductCategory.SNACK].map((option) => (
          <li
            key={option}
            className={cn("cursor-pointer border-2 px-5 py-0.5", category === "bg-foreground text-background")}
            onClick={() => (option === "all" ? route.replace(pathname) : handleUpdateQueryParam("category", option))}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 py-6">
        {isLoading ? (
          <div className="col-span-full">
            <LoaderComponent />
          </div>
        ) : error ? (
          <div className="col-span-full">
            <h1 className="text-center text-lg py-10">Error: {error.message}</h1>
          </div>
        ) : (
          menus.map((menu) => (
            <Link
              key={menu.productId}
              href={`/menu/${menu.productId}`}
              prefetch
              className="h-fit p-2 md:p-3 rounded-[20px] md:rounded-[30px] border-2"
            >
              <div className="rounded-[13px] md:rounded-[21px] overflow-hidden size-full">
                <Image
                  src={menu.image}
                  width={100}
                  height={100}
                  alt="product-image"
                  className="w-full h-[200px] lg:h-[300px] object-cover object-center"
                />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-nowrap truncate mt-3 md:mt-5">
                {menu.title}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs md:text-sm ellipsis-on-third-line">{menu.description}</p>
              <div className="flex justify-between items-center gap-4 mt-2">
                <h6 className="text-sm md:text-base text-nowrap truncate text-semibold">{rupiah.format(menu.price)}</h6>
                {menu.reviews?.length ? (
                  <span className="flex items-center gap-1">
                    <Star className="size-3 md:size-4" />
                    <p className="text-xs md:text-sm">{rating(menu.reviews)}</p>
                  </span>
                ) : null}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
