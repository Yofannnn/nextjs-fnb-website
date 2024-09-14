"use client";

import { useEffect, useState } from "react";
import store, { AppDispatch } from "@/redux/store";
import { Provider, useDispatch } from "react-redux";
import { loadCartFromLocal } from "@/redux/slice/cart.slice";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Navbar from "../fragments/Navbar";

export default function Global({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <LayoutContent>{children}</LayoutContent>
      </NextThemesProvider>
    </Provider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(loadCartFromLocal());
    setMounted(true);
  }, [dispatch]);

  if (!mounted) return;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
