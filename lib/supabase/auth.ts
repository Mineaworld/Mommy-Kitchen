import { getSupabaseServerClient } from "@/lib/supabase/server";

export const verifyBearerToken = async (authorization: string): Promise<boolean> => {
  if (!authorization.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.replace("Bearer ", "").trim();
  if (!token) {
    return false;
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return false;
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return false;
  }

  return true;
};
