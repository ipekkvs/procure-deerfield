import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { 
  PurchaseRequest, 
  formatCurrency, 
  getStatusColor, 
  getStatusLabel,
  getCategoryIcon 
} from "@/lib/mockData";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RequestCardProps {
  request: PurchaseRequest;
  className?: string;
  compact?: boolean;
}

export function RequestCard({ request, className, compact = false }: RequestCardProps) {
  if (compact) {
    return (
      <Link
        to={`/requests/${request.id}`}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">{getCategoryIcon(request.category)}</span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{request.title}</p>
            <p className="text-xs text-muted-foreground">{request.requesterName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{formatCurrency(request.amount)}</span>
          <StatusBadge variant={getStatusColor(request.status)} dot={false}>
            {getStatusLabel(request.status)}
          </StatusBadge>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/requests/${request.id}`}
      className={cn(
        "block p-4 rounded-lg border bg-card card-hover group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-2xl mt-0.5">{getCategoryIcon(request.category)}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {request.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {request.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{request.requesterName}</span>
              <span>•</span>
              <span>{request.department}</span>
              {request.daysInCurrentStage > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {request.daysInCurrentStage}d in stage
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-lg font-bold">{formatCurrency(request.amount)}</span>
          <StatusBadge variant={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </StatusBadge>
        </div>
      </div>
    </Link>
  );
}
