import ReservationIncludeFoodPage from "@/components/pages/ReservationIncludeFoodPage";
import { getUser } from "@/lib/dal";

export default async function ReservationIncludeFood() {
  const { user } = await getUser();
  return (
    <ReservationIncludeFoodPage
      isAuth={!!user}
      memberId={user?._id.toString()}
      memberName={user?.name}
      memberEmail={user?.email}
    />
  );
}
