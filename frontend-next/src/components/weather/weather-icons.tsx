"use client"

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Moon,
  CloudMoon,
  Wind,
  LucideIcon,
} from "lucide-react"

/**
 * Map a free-form condition string (from any provider) to a Lucide icon.
 * The backend normalises conditions to English words, so simple keyword
 * matching works across providers.
 */
export function iconForCondition(
  condition: string | null | undefined,
  isDay: boolean | null | undefined = true
): LucideIcon {
  const c = (condition || "").toLowerCase()

  if (c.includes("thunder") || c.includes("storm")) return CloudLightning
  if (c.includes("drizzle")) return CloudDrizzle
  if (c.includes("rain") || c.includes("shower")) return CloudRain
  if (c.includes("snow") || c.includes("sleet") || c.includes("ice")) return CloudSnow
  if (c.includes("fog") || c.includes("mist") || c.includes("haze") || c.includes("smoke"))
    return CloudFog
  if (c.includes("wind") || c.includes("breez")) return Wind

  if (c.includes("partly") || c.includes("overcast") || c.includes("cloud")) {
    if (isDay === false) return CloudMoon
    return CloudSun
  }
  if (c.includes("clear") || c.includes("sun") || c.includes("fair")) {
    return isDay === false ? Moon : Sun
  }

  return Cloud
}

export function ConditionIcon({
  condition,
  isDay,
  className = "h-6 w-6",
}: {
  condition: string | null | undefined
  isDay?: boolean | null
  className?: string
}) {
  const Icon = iconForCondition(condition, isDay)
  return <Icon className={className} aria-hidden />
}
