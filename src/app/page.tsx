"use client";

import BlurFade from "@/components/ui/blur-fade";
import FadeText from "@/components/ui/fade-text";
import GradualSpacing from "@/components/ui/gradual-spacing";
import { Separator } from "@/components/ui/separator";
import WordPullUp from "@/components/ui/word-pull-up";
import { rupiah } from "@/lib/format-currency";
import { Product } from "@/types/product.type";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Instagram, MessageCircle, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const queryKey = ["products"];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/products`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const products: Product[] = data;

  return (
    <>
      <div className="w-vw h-svh p-4">
        <div className="w-full h-full relative rounded-[30px] overflow-hidden flex justify-center items-center">
          <Image
            src="/landing-page/hero.jpg"
            width={500}
            height={500}
            alt="hero-image"
            className="w-full h-full object-cover object-center absolute top-0 left-0"
          />
          <div className="z-10 min-w-8/12 max-w-full p-1">
            <h1 className="text-center text-6xl md:text-7xl lg:text-8xl font-bold my-5">Title Restaurant</h1>
            <p className="text-center font-semibold text-sm lg:text-base">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magni architecto veniam ullam accusamus, quia ipsam
              accusantium
            </p>
          </div>
          <div className="z-10 absolute -bottom-2 -right-2">
            <span />
            <div className="bg-background p-3 rounded-tl-[30px]">
              <Link
                href="/menu"
                className="inline-block font-semibold text-base lg:text-xl px-6 py-3 rounded-full border border-foreground"
              >
                Explore Menu&apos;s
              </Link>
            </div>
            <span />
          </div>
        </div>
      </div>
      {/* second section */}
      <div className="grid grid-col-1 md:grid-cols-2 gap-16 px-4 md:px-12 py-14">
        <div className="col-span-1 flex items-center justify-between">
          <div className="flex flex-col justify-between gap-4">
            <h2 className="text-3xl lg:text-4xl font-bold">From passion to taste.</h2>
            <p className="text-muted-foreground">All in the name of satisfaction.</p>
          </div>
          <Image
            src="/landing-page/2-1-1.jpg"
            alt="image"
            width={100}
            height={100}
            className="h-fit w-[38%] md:w-[40%] lg:w-[38%] rounded-2xl"
          />
        </div>
        <div className="col-span-1 flex justify-center items-center">
          <WordPullUp
            words="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit amet quisquam aperiam minima."
            className="text-2xl lg:text-3xl"
          />
        </div>
      </div>
      {/* third section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 md:px-12 py-14">
        <BlurFade className="col-span-1 relative rounded-[30px] overflow-hidden p-6 md:p-4 lg:p-6" delay={0.3 + 0 * 0.1}>
          <Image
            src="/landing-page/3-1.jpg"
            width={200}
            height={200}
            alt="image"
            className="w-full h-full object-cover object-center absolute top-0 left-0"
          />
          <div className="relative flex flex-col gap-14">
            <div>
              <h3 className="text-4xl md:text-3xl lg:text-4xl font-bold mb-4">Lorem</h3>
              <p className="font-medium text-base md:text-sm lg:text-base">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit amet quisquam aperiam minima blanditiis
              </p>
            </div>
            <div>
              <Separator className="bg-foreground" />
              <p className="mt-4 text-base md:text-sm lg:text-base">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit
              </p>
            </div>
          </div>
          <Link
            href="/menu?category=food"
            className="absolute top-4 right-4 size-12 md:size-10 lg:size-12 rounded-full bg-foreground flex justify-center items-center"
          >
            <ArrowRight className="text-background" />
          </Link>
        </BlurFade>
        <BlurFade className="col-span-1 relative rounded-[30px] overflow-hidden p-6 md:p-4 lg:p-6" delay={0.3 + 1 * 0.1}>
          <Image
            src="/landing-page/3-2.jpg"
            width={200}
            height={200}
            alt="image"
            className="w-full h-full object-cover object-center absolute top-0 left-0"
          />
          <div className="relative flex flex-col gap-14">
            <div>
              <h3 className="text-4xl md:text-3xl lg:text-4xl font-bold mb-4">Lorem</h3>
              <p className="font-medium text-base md:text-sm lg:text-base">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit amet quisquam aperiam minima blanditiis
              </p>
            </div>
            <div>
              <Separator className="bg-foreground" />
              <p className="mt-4 text-base md:text-sm lg:text-base">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit
              </p>
            </div>
          </div>
          <Link
            href="/menu?category=drink"
            className="absolute top-4 right-4 size-12 md:size-10 lg:size-12 rounded-full bg-foreground flex justify-center items-center"
          >
            <ArrowRight className="text-background" />
          </Link>
        </BlurFade>
        <BlurFade className="col-span-1 relative rounded-[30px] overflow-hidden p-6 md:p-4 lg:p-6" delay={0.3 + 2 * 0.1}>
          <Image
            src="/landing-page/3-3.jpg"
            width={200}
            height={200}
            alt="image"
            className="w-full h-full object-cover object-center absolute top-0 left-0"
          />
          <div className="relative flex flex-col gap-14">
            <div>
              <h3 className="text-4xl md:text-3xl lg:text-4xl font-bold mb-4">Lorem</h3>
              <p className="font-medium text-base md:text-sm lg:text-base">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit amet quisquam aperiam minima blanditiis
              </p>
            </div>
            <div>
              <Separator className="bg-foreground" />
              <p className="mt-4 text-base md:text-sm lg:text-base">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit
              </p>
            </div>
          </div>
          <Link
            href="/menu?category=snack"
            className="absolute top-4 right-4 size-12 md:size-10 lg:size-12 rounded-full bg-foreground flex justify-center items-center"
          >
            <ArrowRight className="text-background" />
          </Link>
        </BlurFade>
      </div>
      {/* fourth section */}
      <div className="px-4 md:px-12 py-14">
        <div className="flex gap-7 flex-col md:flex-row items-center md:items-end mb-12">
          <div>
            <GradualSpacing
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter w-full"
              text="Best Product"
            />
          </div>
          <BlurFade delay={0.2} blur="0px">
            <Link
              href="/menu"
              className="inline-block px-8 py-1 md:px-9 md:py-1.5 lg:px-10 lg:py-2 rounded-full font-semibold border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all duration-500"
            >
              Shop
            </Link>
          </BlurFade>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto p-2 md:p-3">
          {products ? (
            products.map((product, i) => (
              <div key={i} className="w-[250px] lg:w-[320px] h-fit p-3 rounded-[30px] relative border-2 shrink-0 grow-0">
                <div className="rounded-[21px] overflow-hidden size-full">
                  <Image
                    src={product.image}
                    width={100}
                    height={100}
                    alt="product-image"
                    className="w-full h-[230px] lg:h-[300px] object-cover object-center"
                  />
                </div>
                <h6 className="text-xl md:text-3xl font-medium mt-7">{product.title}</h6>
                <p className="text-muted-foreground mt-2 text-sm">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit
                </p>
                <p className="text-base md:text-xl mt-7 mb-4">{rupiah.format(product.price)}</p>
                <Link
                  href={`/menu/${product.productId}`}
                  className="absolute bottom-4 right-4 size-12 rounded-full bg-foreground flex justify-center items-center"
                >
                  <ArrowRight className="text-background" />
                </Link>
              </div>
            ))
          ) : (
            <span>{error?.message}</span>
          )}
        </div>
      </div>
      {/* fifth section */}
      <div className="px-4 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-12 gap-4 md:gap-0">
          <p className="col-span-1 text-muted-foreground md:w-[80%] text-center md:text-start text-base md:text-sm lg:text-base">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit amet quisquam aperiam minima blanditiis
          </p>
          <GradualSpacing
            className="col-span-1 text-5xl lg:text-7xl font-bold md:text-end tracking-tighter"
            text="Another Menu"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
          <BlurFade
            className="col-span-1 md:col-span-3 lg:col-span-2 h-[350px] flex relative overflow-hidden p-3 rounded-[30px] group"
            delay={0.3 + 0 * 0.08}
            blur="0px"
          >
            <Image
              src="/landing-page/bento-location.jpg"
              width={400}
              height={400}
              alt="image"
              className="w-full h-full object-cover object-center absolute top-0 left-0 group-hover:scale-105 transition-all duration-500"
            />
            <div className="relative rounded-[20px] h-fit backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-500 self-end p-6 overflow-hidden">
              <h4 className="text-4xl font-bold">Location</h4>
              <p className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mt-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae mollitia, sit odio laudantium sunt
                corporis nobis.
              </p>
            </div>
            <Link
              href="/"
              className="absolute top-3 right-3 w-12 h-12 rounded-full border-2 border-foreground group-hover:bg-foreground flex justify-center items-center transition-all duration-500"
            >
              <ArrowRight className="group-hover:text-background transition-all duration-500" />
            </Link>
          </BlurFade>
          <BlurFade
            className="col-span-1 md:col-span-2 lg:col-span-1 h-[350px] flex relative overflow-hidden p-3 rounded-[30px] group"
            delay={0.3 + 1 * 0.08}
            blur="0px"
          >
            <Image
              src="/landing-page/bento-menu.jpg"
              width={400}
              height={400}
              alt="image"
              className="w-full h-full object-cover object-center absolute top-0 left-0 group-hover:scale-105 transition-all duration-500"
            />
            <div className="relative rounded-[20px] h-fit backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-500 self-end p-6 overflow-hidden">
              <h4 className="text-4xl font-bold">Menu&apos;s</h4>
              <p className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mt-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae mollitia, sit odio laudantium sunt
                corporis nobis.
              </p>
            </div>
            <Link
              href="/"
              className="absolute top-3 right-3 w-12 h-12 rounded-full border-2 border-foreground group-hover:bg-foreground flex justify-center items-center transition-all duration-500"
            >
              <ArrowRight className="group-hover:text-background transition-all duration-500" />
            </Link>
          </BlurFade>
          <BlurFade
            className="col-span-1 md:col-span-2 lg:col-span-1 h-[350px] flex relative overflow-hidden p-3 rounded-[30px] group"
            delay={0.3 + 2 * 0.08}
            blur="0px"
          >
            <Image
              src="/landing-page/bento-food.jpg"
              width={400}
              height={400}
              alt="image"
              className="w-full h-full object-cover object-center absolute top-0 left-0 group-hover:scale-105 transition-all duration-500"
            />
            <div className="relative rounded-[20px] h-fit backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-500 self-end p-6 overflow-hidden">
              <h4 className="text-4xl font-bold">Shop</h4>
              <p className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mt-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae mollitia, sit odio laudantium sunt
                corporis nobis.
              </p>
            </div>
            <Link
              href="/"
              className="absolute top-3 right-3 w-12 h-12 rounded-full border-2 border-foreground group-hover:bg-foreground flex justify-center items-center transition-all duration-500"
            >
              <ArrowRight className="group-hover:text-background transition-all duration-500" />
            </Link>
          </BlurFade>
          <BlurFade
            className="col-span-1 md:col-span-3 lg:col-span-2 h-[350px] flex relative overflow-hidden p-3 rounded-[30px] group"
            delay={0.3 + 3 * 0.08}
            blur="0px"
          >
            <Image
              src="/landing-page/bento-reservation.jpg"
              width={400}
              height={400}
              alt="image"
              className="w-full h-full object-cover object-center absolute top-0 left-0 group-hover:scale-105 transition-all duration-500"
            />
            <div className="relative rounded-[20px] h-fit backdrop-blur-none group-hover:backdrop-blur-md transition-all duration-500 self-end p-6 overflow-hidden">
              <h4 className="text-4xl font-bold">Reservation</h4>
              <p className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mt-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae mollitia, sit odio laudantium sunt
                corporis nobis.
              </p>
            </div>
            <Link
              href="/"
              className="absolute top-3 right-3 w-12 h-12 rounded-full border-2 border-foreground group-hover:bg-foreground flex justify-center items-center transition-all duration-500"
            >
              <ArrowRight className="group-hover:text-background transition-all duration-500" />
            </Link>
          </BlurFade>
        </div>
      </div>
      {/* footer */}
      <footer className="w-vw mi-h-svh p-4 mt-14">
        <div className="w-full h-full relative overflow-hidden rounded-[30px]">
          <Image
            src="/landing-page/footer.jpg"
            width={500}
            height={500}
            alt="footer-image"
            className="w-full h-full object-cover object-center absolute top-0 left-0"
          />
          <div className="z-10 relative h-full w-full p-2 md:p-8 flex flex-col justify-around items-center gap-8">
            <div className="flex flex-col justify-center items-center gap-6 p-8">
              <FadeText
                className="text-6xl md:text-7xl lg:text-8xl font-bold"
                direction="up"
                framerProps={{
                  show: { transition: { delay: 0.45 } },
                }}
                text="Join Member Now"
              />
              <BlurFade delay={0.4} blur="0px">
                <Link
                  href="/register"
                  className="inline-block px-9 lg:px-10 py-2 rounded-full font-bold border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground transition-all duration-500"
                >
                  Sign Up
                </Link>
              </BlurFade>
            </div>
            <div className="w-full h-full backdrop-blur rounded-[20px] p-2 md:p-8 flex flex-col justify-around items-center gap-5">
              <div className="flex justify-center items-center gap-3">
                <div>
                  <Link href="/" className="inline-block p-4 rounded-full border border-foreground">
                    <Instagram className="size-5 md:size-7" />
                  </Link>
                </div>
                <div>
                  <Link href="/" className="inline-block p-4 rounded-full border border-foreground">
                    <Twitter className="size-5 md:size-7" />
                  </Link>
                </div>
                <div>
                  <Link href="/" className="inline-block p-4 rounded-full border border-foreground">
                    <MessageCircle className="size-5 md:size-7" />
                  </Link>
                </div>
              </div>
              <Separator className="bg-foreground" />
              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3 text-base md:text-xl font-semibold">
                  <Link href="/">Location</Link>
                  <Link href="/faq">FAQ</Link>
                  <Link href="/manae-reservation">Manage Reservation</Link>
                </div>
                <Separator className="bg-foreground h-20 md:h-10" orientation="vertical" />
                <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3 text-base md:text-xl font-semibold">
                  <Link href="/menu">Menu</Link>
                  <Link href="/reservation">Reservation</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
