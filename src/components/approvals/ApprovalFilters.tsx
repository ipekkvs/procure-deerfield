import { cn } from "@/lib/utils";

export type FilterType = 'all' | 'over-budget' | 'high-value' | 'new-vendors';

interface ApprovalFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    overBudget: number;
    highValue: number;
    newVendors: number;
  };
}

export function ApprovalFilters({ activeFilter, onFilterChange, counts }: ApprovalFiltersProps) {
  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'over-budget', label: 'Over Budget', count: counts.overBudget },
    { id: 'high-value', label: '>$50K', count: counts.highValue },
    { id: 'new-vendors', label: 'New Vendors', count: counts.newVendors },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
            activeFilter === filter.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {filter.label}
          {filter.count > 0 && (
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
              activeFilter === filter.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-background"
            )}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
