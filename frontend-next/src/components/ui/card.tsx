import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border/40 bg-card/65 text-card-foreground shadow-sm backdrop-blur-md transition-all duration-300 hover:border-border/60 hover:shadow-md",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-panel flex flex-col rounded-2xl transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/35 dark:hover:border-primary/30",
        className
      )}
      {...props}
    />
  )
)
GlassCard.displayName = "GlassCard"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display font-bold leading-tight tracking-tight text-lg md:text-xl", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, GlassCard, CardHeader, CardTitle, CardContent }
