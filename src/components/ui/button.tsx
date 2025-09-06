import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground clay-button hover:clay-glow-primary active:transform-none",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground clay-button hover:shadow-[var(--clay-shadow-outer),0px_0px_8px_rgba(239,68,68,0.5)] hover:-translate-y-0.5",
        outline:
          "border border-border bg-card text-card-foreground clay-input hover:bg-muted hover:text-primary dark:hover:clay-glow-accent",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary-hover text-secondary-foreground clay-button hover:shadow-[var(--clay-shadow-outer),0px_0px_6px_rgba(100,116,139,0.4)] hover:-translate-y-0.5",
        ghost:
          "hover:bg-muted hover:text-primary text-muted-foreground dark:hover:shadow-[0px_0px_4px_rgba(255,255,255,0.1)]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 rounded-xl",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-2xl px-6 has-[>svg]:px-4",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
