import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; 

const avatarVariants = cva(
  "inline-flex items-center justify-center overflow-hidden rounded-full text-sm font-medium transition-all",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-12 w-12 text-sm",
        lg: "h-16 w-16 text-lg",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
        rounded: "rounded-lg",
      },
      variant: {
        default: "bg-gray-300 text-gray-700",
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        outline: "border border-gray-300",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      variant: "default",
    },
  }
);

interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  asChild?: boolean;
  src?: string;
  alt?: string;
  fallback?: string; // fallback initials or icon
}

const Avatar = ({
  className,
  size,
  shape,
  variant,
  src,
  alt,
  fallback,
  asChild = false,
  ...props
}: AvatarProps) => {
  const Comp = asChild ? Slot : "div";
  
  return (
    <Comp
      data-slot="avatar"
      className={cn(avatarVariants({ size, shape, variant, className }))}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || "avatar"} className="object-cover w-full h-full" />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-xl font-semibold text-white">
          {fallback || alt?.[0]?.toUpperCase()}
        </span>
      )}
    </Comp>
  );
};

export { Avatar, avatarVariants };
