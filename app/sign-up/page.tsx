import { getUser } from "@/shared/lib/supabase/utils";
import SignUpComponent from "@/widgets/sign-up/SignUp";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  return <SignUpComponent />;
}
