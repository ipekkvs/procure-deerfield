import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Renewal, formatCurrency, formatDate, getDaysUntilRenewal } from "@/lib/mockData";
import { Calendar, TrendingUp, Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RenewalCardProps {
  renewal: Renewal;
  onClick?: () => void;
  onStartRenewal?: () => void;
  className?: string;
}

export function RenewalCard({ renewal, onClick, onStartRenewal, className }: RenewalCardProps) {
  const daysUntil = renewal.daysUntilExpiration;
  
  const getStatusVariant = () => {
    if (renewal.reviewStatus === 'overdue') return 'error';
    if (renewal.reviewStatus === 'completed') return 'success';
    if (daysUntil <= 30) return 'error';
    if (daysUntil <= 90) return 'warning';
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

  const showAlertBadge = daysUntil <= 90 && renewal.reviewStatus !== 'completed';

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card transition-all",
        onClick && "card-hover cursor-pointer",
        daysUntil <= 30 && renewal.reviewStatus !== 'completed' && "border-status-error/50",
        daysUntil > 30 && daysUntil <= 90 && renewal.reviewStatus !== 'completed' && "border-status-warning/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div onClick={onClick}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{renewal.vendorName}</h3>
            {showAlertBadge && renewal.alertSent && (
              <Bell className="w-4 h-4 text-status-warning animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{formatCurrency(renewal.amount)}/year</p>
        </div>
        <StatusBadge variant={getStatusVariant()}>
          {getStatusLabel()}
        </StatusBadge>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground" onClick={onClick}>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(renewal.renewalDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          {renewal.usageRate}% usage
        </span>
      </div>

      {renewal.currentLicenses && (
        <div className="mt-2 text-xs text-muted-foreground" onClick={onClick}>
          {renewal.currentLicenses} licenses
        </div>
      )}
      
      {/* Days until renewal / Alert */}
      <div className={cn(
        "mt-3 text-xs font-medium",
        daysUntil <= 0 ? "text-status-error" : 
        daysUntil <= 30 ? "text-status-error" : 
        daysUntil <= 90 ? "text-status-warning" : 
        "text-muted-foreground"
      )}>
        {daysUntil <= 0 
          ? "Renewal overdue!" 
          : daysUntil <= 90 
            ? `⚠️ ${daysUntil} days until expiration - Start renewal process now for better negotiation leverage`
            : `${daysUntil} days until renewal`
        }
      </div>

      {/* Start Renewal Process Button */}
      {daysUntil <= 90 && daysUntil > 0 && renewal.reviewStatus === 'pending' && onStartRenewal && (
        <Button 
          size="sm" 
          className="mt-3 gap-2 w-full"
          onClick={(e) => {
            e.stopPropagation();
            onStartRenewal();
          }}
        >
          <Play className="w-3 h-3" />
          Start Renewal Process
        </Button>
      )}
    </div>
  );
}
