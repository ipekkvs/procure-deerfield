import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mockData";

interface BudgetWidgetProps {
  label: string;
  spent: number;
  total: number;
  className?: string;
}

export function BudgetWidget({ label, spent, total, className }: BudgetWidgetProps) {
  const percentage = Math.min((spent / total) * 100, 100);
  
  const getBarColor = (pct: number) => {
    if (pct < 70) return "bg-budget-safe";
    if (pct < 90) return "bg-budget-warning";
    return "bg-budget-critical";
  };

  const getTextColor = (pct: number) => {
    if (pct < 70) return "text-budget-safe";
    if (pct < 90) return "text-budget-warning";
    return "text-budget-critical";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn("font-semibold", getTextColor(percentage))}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getBarColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(spent)} spent</span>
        <span>{formatCurrency(total - spent)} remaining</span>
      </div>
    </div>
  );
}
