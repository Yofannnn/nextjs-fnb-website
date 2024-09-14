import MenuPage from "@/components/pages/MenuPage";

async function getMenus() {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/product`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(res.statusText);
    const jsonData = await res.json();
    return { success: true, message: "success", data: jsonData };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default async function Menu() {
  const menus = await getMenus();

  if (!menus.success) return <h1>Error: {menus.message}</h1>;
  return <MenuPage menus={menus.data} />;
}
