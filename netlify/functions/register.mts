import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import bcrypt from "bcryptjs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { username, password, email } = await req.json();

    if (!username || !password || !email) {
      return new Response(
        JSON.stringify({ error: "Username, password, and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("users");

    // Check if user already exists
    const existingUser = await store.get(`user:${username}`);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const emailCheck = await store.get(`email:${email}`);
    if (emailCheck) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Store user data
    await store.setJSON(`user:${username}`, user);
    await store.set(`email:${email}`, username);

    return new Response(
      JSON.stringify({ message: "User registered successfully", username }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/register"
};