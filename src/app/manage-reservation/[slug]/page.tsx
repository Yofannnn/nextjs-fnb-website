import ManageReservationPage from "@/components/pages/ManageReservation";

async function getReservationInfo(token: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URl}/api/reservation/guest?token=${token}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    const { data } = await res.json();
    return data;
  } catch (error: any) {
    return error.message;
  }
}

export default async function ManageReservation({
  params,
}: {
  params: { slug: string };
}) {
  // check isAuth or not, if isAuth redirect to /dashboard/user/reservation/maybe token(ugyvgehbnjmkdwehur)
  // fetch data with token to server for req info reserv if req success it will send the info and then passing the user reservation info
  const { slug } = params;
  const reservationInfo = await getReservationInfo(slug);
  if (!reservationInfo) return <></>;
  return <ManageReservationPage reservationDetails={reservationInfo} />;
}
