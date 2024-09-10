import Link from "next/link";

export default function DashboardProduct() {
  return (
    <>
      <div>Dasboard Product</div>
      <Link href="/dashboard/admin/product/add-product">Add Product</Link>
    </>
  );
}
