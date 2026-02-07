import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import { departments, Department } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface RenewalFiltersProps {
  showDepartmentFilter?: boolean;
  showAmountFilter?: boolean;
  showExport?: boolean;
  departmentFilter: string;
  amountFilter: string;
  onDepartmentChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onExport?: () => void;
}

const amountRanges = [
  { value: 'all', label: 'All Amounts' },
  { value: 'under10k', label: 'Under $10K' },
  { value: '10k-50k', label: '$10K - $50K' },
  { value: '50k-100k', label: '$50K - $100K' },
  { value: 'over100k', label: 'Over $100K' },
];

export function RenewalFilters({
  showDepartmentFilter = false,
  showAmountFilter = false,
  showExport = false,
  departmentFilter,
  amountFilter,
  onDepartmentChange,
  onAmountChange,
  onExport,
}: RenewalFiltersProps) {
  const hasFilters = showDepartmentFilter || showAmountFilter;
  
  if (!hasFilters && !showExport) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
      )}
      
      {showDepartmentFilter && (
        <Select value={departmentFilter} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {showAmountFilter && (
        <Select value={amountFilter} onValueChange={onAmountChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Amounts" />
          </SelectTrigger>
          <SelectContent>
            {amountRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {showExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Renewal Forecast
        </Button>
      )}
    </div>
  );
}

export function filterRenewalsByAmount(renewals: any[], amountFilter: string) {
  if (amountFilter === 'all') return renewals;
  
  return renewals.filter(r => {
    switch (amountFilter) {
      case 'under10k': return r.amount < 10000;
      case '10k-50k': return r.amount >= 10000 && r.amount < 50000;
      case '50k-100k': return r.amount >= 50000 && r.amount < 100000;
      case 'over100k': return r.amount >= 100000;
      default: return true;
    }
  });
}
