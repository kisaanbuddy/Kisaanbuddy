"use client"
import { useLanguage } from '@/lib/language'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user, ready } = useAuth()

  useEffect(() => {
    if (ready) {
      if (user) {
        router.replace("/dashboard")
      } else {
        // Direct auto-login bypass
        const defaultEmail = "farmer@krishiai.com"
        const defaultName = "Aditya Farmer"
        try {
          const defaultSession = {
            email: defaultEmail,
            name: defaultName,
            loginAt: Date.now()
          }
          localStorage.setItem("krishi_user", JSON.stringify(defaultSession))
          window.dispatchEvent(new Event("krishi-auth-change"))
          router.replace("/dashboard")
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [ready, user, router])

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 -mt-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-white flex items-center gap-2 justify-center">
            Securing Connection...
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Logging in to KrishiAI Workspace
          </p>
        </div>
      </div>
    </div>
  )
}
