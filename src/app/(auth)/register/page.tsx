import RegisterPage from "@/components/pages/RegisterPage";
import { verifySession } from "@/lib/dal";

export default async function Register() {
  const { isAuth } = await verifySession();
  return <RegisterPage isAuth={isAuth} />;
}
