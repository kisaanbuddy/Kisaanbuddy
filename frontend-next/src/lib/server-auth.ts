import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type ServerUser = { id: number; role: string }

function backendUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
}

export async function requireServerAdmin(): Promise<ServerUser> {
  const cookieHeader = cookies().getAll().map(({ name, value }) => `${name}=${value}`).join("; ")
  const response = await fetch(`${backendUrl()}/api/auth/me`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  })

  if (response.status === 401) redirect("/login?next=/admin")
  if (!response.ok) redirect("/dashboard")
  const user = (await response.json()) as ServerUser
  return user
}
