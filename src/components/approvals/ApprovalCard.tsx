import { Button } from "@/components/ui/button";
import { formatCurrency, getDepartmentLabel } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Loader2 } from "lucide-react";

export interface ApprovalRequest {
  id: string;
  title: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  amount: number;
  requesterName: string;
  daysWaiting: number;
  isOverBudget?: boolean;
  isNewVendor?: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface ApprovalCardProps {
  request: ApprovalRequest;
  onQuickApprove: (id: string) => void;
  onViewDetails: (request: ApprovalRequest) => void;
  isApproving?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function ApprovalCard({
  request,
  onQuickApprove,
  onViewDetails,
  isApproving = false,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: ApprovalCardProps) {
  const isUrgent = request.isOverBudget || request.daysWaiting > 3;
  const isStandard = !isUrgent && request.urgency !== 'low';

  return (
    <div
      className={cn(
        "group bg-card rounded-xl border shadow-sm p-4 transition-all duration-200",
        "hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect?.(request.id, e.target.checked)}
            className="mt-1.5 h-4 w-4 rounded border-muted-foreground/50 text-primary focus:ring-primary"
          />
        )}

        {/* Priority Indicator */}
        <div className="pt-1.5">
          {isUrgent && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-error" title="Urgent" />
          )}
          {isStandard && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-warning" title="Standard" />
          )}
          {!isUrgent && !isStandard && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-transparent" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight truncate">
            {request.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {getDepartmentLabel(request.department)} • {formatCurrency(request.amount)} • {request.daysWaiting} day{request.daysWaiting !== 1 ? 's' : ''} waiting
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => onQuickApprove(request.id)}
            disabled={isApproving}
            className="gap-1.5"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Quick Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(request)}
            className="gap-1"
          >
            Review Details
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
