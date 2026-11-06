import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none focus:ring-2 focus:ring-studio-accent/50 focus:ring-offset-2 focus:ring-offset-studio-black",
        variant === "primary" && "border-studio-accent bg-studio-accent text-white shadow-red hover:border-red-500 hover:bg-red-700",
        variant === "secondary" && "border-studio-line bg-white/[0.06] text-studio-white hover:border-studio-accent/50 hover:bg-studio-accent/10",
        variant === "ghost" && "border-transparent bg-transparent text-studio-muted hover:bg-studio-accent/10 hover:text-white",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
}
