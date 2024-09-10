import MenuPage from "@/components/pages/MenuPage";

async function getMenus() {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/product`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (error: any) {
    return error.message;
  }
}

export default async function Menu() {
  const menus = await getMenus();
  if (!menus.length) return;
  return <MenuPage menus={menus} />;
}
