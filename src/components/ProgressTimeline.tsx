import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TimelineStep {
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function ProgressTimeline({ steps, className }: ProgressTimelineProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                step.completed
                  ? "bg-primary text-primary-foreground"
                  : step.current
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-[80px]",
                step.completed || step.current
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 transition-all duration-200",
                step.completed ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
