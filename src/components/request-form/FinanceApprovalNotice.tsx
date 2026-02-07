import { formatCurrency } from "@/lib/mockData";
import { CheckCircle2, Clock, DollarSign, CalendarDays, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskAssessment } from "@/lib/riskScoring";

interface FinanceApprovalNoticeProps {
  assessment: RiskAssessment;
  amount: number;
  contractTerm: string;
  isOverBudget: boolean;
}

export function FinanceApprovalNotice({ 
  assessment, 
  amount, 
  contractTerm,
  isOverBudget 
}: FinanceApprovalNoticeProps) {
  const isMultiYear = contractTerm !== '1_year' && contractTerm !== 'month_to_month';
  const isUnder10K = amount < 10000;
  
  // Determine reason for manual approval
  const getManualApprovalReason = () => {
    if (amount >= 10000) return "Amount ≥$10K";
    if (isOverBudget) return "Over budget - exception approval needed";
    if (isMultiYear) return "Multi-year commitment";
    return null;
  };
  
  const manualReason = getManualApprovalReason();
  
  if (assessment.financeAutoApproved) {
    return (
      <div className="rounded-xl border border-status-success/30 bg-status-success-bg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-status-success/20">
            <CheckCircle2 className="w-5 h-5 text-status-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-status-success">Finance Auto-Approved</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Your request meets criteria for automatic Finance approval:
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-status-success" />
                <span>Amount: {formatCurrency(amount)} (&lt;$10K threshold)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-status-success" />
                <span>Budget: Within department budget</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-status-success" />
                <span>Term: Single-year contract</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success ml-auto" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-status-success/20">
              Finance has been notified but doesn't need to manually approve. 
              Your request continues to next step.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-status-warning/20">
          <Clock className="w-5 h-5 text-status-warning" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-status-warning">Finance Approval Required</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Your request requires Finance manual approval because:
          </p>
          
          <div className="mt-3 px-3 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
            <p className="text-sm font-medium text-status-warning">
              {manualReason}
            </p>
          </div>
          
          <div className="mt-4 space-y-1.5">
            <p className="text-sm font-medium">Finance will review for:</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Budget impact</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Strategic fit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Cost justification</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-status-warning/20">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Estimated review time: 2-3 days
          </p>
        </div>
      </div>
    </div>
  );
}
