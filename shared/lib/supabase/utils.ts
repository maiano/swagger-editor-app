import { createClient } from "./server";

export const getUser = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  return user;
};
