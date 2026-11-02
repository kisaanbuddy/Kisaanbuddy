import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px"
    
    const variants = {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/92",
      destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
      outline: "border border-border bg-card text-foreground shadow-xs hover:border-primary/30 hover:bg-muted hover:text-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/85",
      ghost: "hover:bg-muted hover:text-foreground text-foreground/85",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
      glass: "bg-card/80 border border-border backdrop-blur-sm hover:bg-card text-foreground",
      glow: "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/50",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9 rounded-lg",
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
