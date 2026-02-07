import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency, getDepartmentLabel } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Check, X, MessageSquare, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ApprovalRequest } from "./ApprovalCard";

interface ApprovalDetailPanelProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestInfo: (id: string) => void;
  isApproving?: boolean;
}

// Mock previous approvals for demonstration
const previousApprovals = [
  { role: "Intake", approver: "System", date: "Mar 1, 2025", status: "completed" },
  { role: "Manager", approver: "Sarah Chen", date: "Mar 2, 2025", status: "completed" },
  { role: "IT Review", approver: "Mike Wilson", date: "Mar 3, 2025", status: "completed" },
];

export function ApprovalDetailPanel({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  isApproving = false,
}: ApprovalDetailPanelProps) {
  if (!request) return null;

  const budgetStatus = request.isOverBudget ? "Over Budget" : "Within Budget";
  const justification = "This tool is essential for improving team productivity and will integrate with our existing systems. Expected ROI within 6 months based on time savings in report generation.";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[400px] flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl">{request.title}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Requested by {request.requesterName}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Amount & Budget */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-semibold text-lg">{formatCurrency(request.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="font-medium">{getDepartmentLabel(request.department)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Budget Status</span>
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                request.isOverBudget 
                  ? "bg-status-error-bg text-status-error" 
                  : "bg-status-success-bg text-status-success"
              )}>
                {budgetStatus}
              </span>
            </div>
            {request.isNewVendor && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vendor Status</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-status-warning-bg text-status-warning">
                  New Vendor
                </span>
              </div>
            )}
          </div>

          {/* Business Justification */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Business Justification</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {justification}
            </p>
          </div>

          {/* Previous Approvals */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Approval History</h4>
            <div className="space-y-2">
              {previousApprovals.map((approval, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{approval.role}</span>
                    <span className="text-muted-foreground"> • {approval.approver}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{approval.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Warning */}
          {(request.isOverBudget || request.daysWaiting > 3) && (
            <div className="p-3 rounded-lg bg-status-warning-bg border border-status-warning/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-status-warning">Requires Attention</p>
                <p className="text-muted-foreground">
                  {request.isOverBudget && "This request exceeds department budget. "}
                  {request.daysWaiting > 3 && `Waiting ${request.daysWaiting} days.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t space-y-3">
          <Button 
            className="w-full gap-2" 
            onClick={() => onApprove(request.id)}
            disabled={isApproving}
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Approve
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => onRequestInfo(request.id)}
            >
              <MessageSquare className="w-4 h-4" />
              Request Info
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2 text-status-error hover:text-status-error"
              onClick={() => onReject(request.id)}
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
