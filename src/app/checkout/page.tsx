import CheckoutPage from "@/components/pages/CheckoutPage";
import { getUser } from "@/lib/dal";

export default async function Checkout() {
  const { user } = await getUser();
  const userDetails = user ? { ...user, _id: user._id.toString() } : undefined;
  return <CheckoutPage isAuth={!!user} user={userDetails} />;
}
