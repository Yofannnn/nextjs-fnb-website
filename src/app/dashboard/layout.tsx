import UserDashboardLayout from "@/components/layout/UserDashboard";

export default async function UserDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
