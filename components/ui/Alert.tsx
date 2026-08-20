import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-amber-50 text-amber-800 border-amber-200",
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
