import { cn } from "@/lib/utils";

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  error: 'bg-status-error-bg text-status-error',
  info: 'bg-status-info-bg text-status-info',
  neutral: 'bg-status-neutral-bg text-status-neutral',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  info: 'bg-status-info',
  neutral: 'bg-status-neutral',
};

export function StatusBadge({ variant, children, className, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
