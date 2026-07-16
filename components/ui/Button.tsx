import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-foreground text-background shadow-lg shadow-foreground/10 hover:bg-foreground/90': variant === 'default',
            'border border-border bg-transparent hover:bg-muted text-foreground': variant === 'outline',
            'hover:bg-muted text-muted-foreground hover:text-foreground': variant === 'ghost',
            'h-10 px-5 py-2.5 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 w-10 p-2': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
