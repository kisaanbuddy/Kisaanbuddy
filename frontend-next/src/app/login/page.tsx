"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, Mail, Lock, Loader2 } from "lucide-react"

import { loginUser, useAuth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard")
    }
  }, [ready, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.")
      return
    }
    setSubmitting(true)
    // Demo flow: any credential works. Replace with real backend call later.
    await new Promise((r) => setTimeout(r, 600))
    loginUser(email)
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your KrishiAI account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg"
        >
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="farmer@example.com"
                className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-green-600 hover:underline">
              Sign up free
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
