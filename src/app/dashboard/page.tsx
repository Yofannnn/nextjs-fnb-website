import { getUser } from "@/lib/dal";
import { User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";

export default async function UserDashboardHome() {
  const { status, user, error } = await getUser();

  if (status === "failed")
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <h1>{error}</h1>
      </div>
    );

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-5 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="border-2 p-2 size-fit rounded-full">
                    <User2 className="size-8" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined at{" "}
                    {user && formatDate(user?.createdAt, "formatDateLong")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div>
                    <Badge variant="default">Member</Badge>
                  </div>
                  <div>
                    <p>{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p>{user?.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
