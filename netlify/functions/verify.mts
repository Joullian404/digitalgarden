import type { Context, Config } from "@netlify/functions";
import jwt from "jsonwebtoken";

const JWT_SECRET = Netlify.env.get("JWT_SECRET") || "your-secret-key-change-this";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get token from cookie
    const cookies = req.headers.get("cookie") || "";
    const tokenMatch = cookies.match(/auth_token=([^;]+)/);
    
    if (!tokenMatch) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "No token found" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = tokenMatch[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return new Response(
      JSON.stringify({ 
        authenticated: true, 
        user: { username: decoded.username, email: decoded.email }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ authenticated: false, error: "Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/verify"
};