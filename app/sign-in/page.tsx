import { getUser } from "@/shared/lib/supabase/utils";
import SignInComponent from "@/widgets/sign-in/SignIn";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  return <SignInComponent />;
}
