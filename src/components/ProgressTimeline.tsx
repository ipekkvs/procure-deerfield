import { cn } from "@/lib/utils";
import { Check, X, AlertCircle, DollarSign } from "lucide-react";

export interface TimelineStep {
  label: string;
  completed: boolean;
  current: boolean;
  skipped?: boolean;
  conditional?: boolean;
  conditionLabel?: string;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  className?: string;
  showSavings?: {
    originalAmount: number;
    negotiatedAmount: number;
  };
}

export function ProgressTimeline({ steps, className, showSavings }: ProgressTimelineProps) {
  const savings = showSavings 
    ? showSavings.originalAmount - showSavings.negotiatedAmount 
    : 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Savings indicator if price was negotiated */}
      {showSavings && savings > 0 && (
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-status-success-bg text-status-success text-sm mb-4">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">
            Price negotiated: ${showSavings.originalAmount.toLocaleString()} → ${showSavings.negotiatedAmount.toLocaleString()} 
            <span className="ml-1">(Saved ${savings.toLocaleString()})</span>
          </span>
        </div>
      )}
      
      <div className="flex items-center w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  step.skipped
                    ? "bg-muted/50 text-muted-foreground"
                    : step.completed
                    ? "bg-primary text-primary-foreground"
                    : step.current
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.skipped ? (
                  <X className="w-4 h-4" />
                ) : step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  step.skipped
                    ? "text-muted-foreground line-through"
                    : step.completed || step.current
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.conditional && step.conditionLabel && (
                <span className="text-[10px] text-muted-foreground text-center max-w-[80px] mt-0.5">
                  {step.conditionLabel}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-all duration-200",
                  step.skipped 
                    ? "bg-muted/50 border-dashed border-t border-muted"
                    : step.completed 
                    ? "bg-primary" 
                    : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
