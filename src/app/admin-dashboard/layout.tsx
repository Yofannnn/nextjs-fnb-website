import AdminDashboardLayout from "@/components/layout/AdminDashboard";

export default async function AdminDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
