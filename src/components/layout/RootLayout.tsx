"use client";

import { useEffect, useState } from "react";
import store, { AppDispatch } from "@/redux/store";
import { Provider, useDispatch } from "react-redux";
import { loadCartFromLocal } from "@/redux/slice/cart.slice";
import { loadCheckoutData } from "@/redux/slice/checkout.slice";
import { fetchClientReservationDetails } from "@/redux/slice/reservation.slice";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/fragments/Navbar";
import Script from "next/script";

export default function Root({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <RootLayoutContent>{children}</RootLayoutContent>
        </NextThemesProvider>
      </Provider>
    </QueryClientProvider>
  );
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(loadCartFromLocal());
    dispatch(loadCheckoutData());
    dispatch(fetchClientReservationDetails());
    setMounted(true);
  }, [dispatch]);

  if (!mounted) return;

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string}
        strategy="lazyOnload"
      />
      <Navbar />
      {children}
      <Toaster />
    </>
  );
}
