"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Redirecting...
          </h1>
        </div>
      </div>
    </div>
  )
}
