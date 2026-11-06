import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm text-studio-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 rounded-lg border border-studio-line bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-studio-accent/70 focus:ring-2 focus:ring-studio-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 rounded-lg border border-studio-line bg-black/35 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-studio-accent/70 focus:ring-2 focus:ring-studio-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 rounded-lg border border-studio-line bg-black/35 px-3 text-sm text-white outline-none transition focus:border-studio-accent/70 focus:ring-2 focus:ring-studio-accent/20",
        className,
      )}
      {...props}
    />
  );
}
