import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Clear the authentication cookie
  const cookie = `auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;

  return new Response(
    JSON.stringify({ message: "Logout successful" }),
    { 
      status: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      } 
    }
  );
};

export const config: Config = {
  path: "/api/logout"
};