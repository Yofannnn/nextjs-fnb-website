import LoginPage from "@/components/pages/LoginPage";
import { verifySession } from "@/lib/dal";

export default async function Login() {
  const { isAuth } = await verifySession();
  return <LoginPage isAuth={isAuth} />;
}
