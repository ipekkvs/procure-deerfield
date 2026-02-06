import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Renewal, formatCurrency, formatDate, getDaysUntilRenewal } from "@/lib/mockData";
import { Calendar, TrendingUp } from "lucide-react";

interface RenewalCardProps {
  renewal: Renewal;
  onClick?: () => void;
  className?: string;
}

export function RenewalCard({ renewal, onClick, className }: RenewalCardProps) {
  const daysUntil = getDaysUntilRenewal(renewal.renewalDate);
  
  const getStatusVariant = () => {
    if (renewal.reviewStatus === 'overdue') return 'error';
    if (renewal.reviewStatus === 'completed') return 'success';
    if (daysUntil <= 14) return 'warning';
    return 'info';
  };

  const getStatusLabel = () => {
    switch (renewal.reviewStatus) {
      case 'overdue': return 'Overdue';
      case 'completed': return 'Reviewed';
      case 'in_review': return 'In Review';
      case 'pending': return 'Pending Review';
      default: return renewal.reviewStatus;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border bg-card card-hover cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{renewal.vendorName}</h3>
          <p className="text-sm text-muted-foreground">{formatCurrency(renewal.amount)}/year</p>
        </div>
        <StatusBadge variant={getStatusVariant()}>
          {getStatusLabel()}
        </StatusBadge>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(renewal.renewalDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          {renewal.usageRate}% usage
        </span>
      </div>
      
      {daysUntil <= 30 && renewal.reviewStatus !== 'completed' && (
        <div className={cn(
          "mt-3 text-xs font-medium",
          daysUntil <= 0 ? "text-status-error" : daysUntil <= 14 ? "text-status-warning" : "text-muted-foreground"
        )}>
          {daysUntil <= 0 ? "Renewal overdue!" : `${daysUntil} days until renewal`}
        </div>
      )}
    </div>
  );
}
