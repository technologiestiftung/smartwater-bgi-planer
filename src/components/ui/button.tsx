import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "w-max flex gap-4 items-center py-2 px-4 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors",
  {
    variants: {
      variant: {
        primary:
          "cursor-pointer bg-primary hover:bg-secondary text-white fill-white",
        secondary:
          "cursor-pointer bg-white hover:bg-light border-2 border-primary text-primary",
      },
      disabled: {
        true: "cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        disabled: true,
        class: "bg-mid-darker hover:bg-mid-darker",
      },
      {
        variant: "secondary",
        disabled: true,
        class:
          "bg-lighter border-2 border-mid-darker text-mid-darker hover:bg-lighter",
      },
    ],
    defaultVariants: {
      variant: "primary",
    },
  }
);

function ShadButton({
  className,
  variant,
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
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { ShadButton, buttonVariants };
