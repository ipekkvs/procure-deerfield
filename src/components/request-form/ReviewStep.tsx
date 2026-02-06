import { StepProps } from "./types";
import { 
  formatCurrency, 
  getDepartmentLabel, 
  getSubDepartmentLabel,
  getWorkflowSteps,
  getStepLabel,
  isStepSkipped,
  PurchaseRequest,
  ApprovalStep
} from "@/lib/mockData";
import { ArrowRight, CheckCircle2, X, AlertCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewStep({ formData }: StepProps) {
  // Create a mock request to calculate workflow steps
  const mockRequest: Partial<PurchaseRequest> = {
    requestType: formData.requestType,
    budgetedAmount: formData.budgetedAmount || 0,
    priceChanged: false,
  };

  const workflowSteps = getWorkflowSteps(mockRequest as PurchaseRequest);
  
  // All possible steps for display
  const allSteps: ApprovalStep[] = [
    'intake',
    'requirements', 
    'department_pre_approval',
    'compliance_it_review',
    'negotiation',
    'finance_final_approval',
    'contracting'
  ];

  const requiresNegotiation = (formData.budgetedAmount || 0) > 25000;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Request Summary */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Review Your Request</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{formData.title || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Request Type</span>
              <p className="font-medium capitalize">
                {formData.requestType === 'new_purchase' ? 'New Purchase' : 'Contract Renewal'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p className="font-medium capitalize">{formData.category || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Budgeted Amount</span>
              <p className="font-medium">
                {formData.budgetedAmount ? formatCurrency(formData.budgetedAmount) : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Department</span>
              <p className="font-medium">
                {formData.department ? getDepartmentLabel(formData.department) : "—"}
              </p>
            </div>
            {formData.subDepartment && (
              <div>
                <span className="text-muted-foreground">Sub-Department</span>
                <p className="font-medium">{getSubDepartmentLabel(formData.subDepartment)}</p>
              </div>
            )}
            {formData.category === 'saas' && formData.licensesSeatsCount && (
              <div>
                <span className="text-muted-foreground">Licenses/Seats</span>
                <p className="font-medium">{formData.licensesSeatsCount}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Target Sign Date</span>
              <p className="font-medium">{formData.targetSignDate || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Urgency</span>
              <p className="font-medium capitalize">{formData.urgency}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <span className="text-sm text-muted-foreground">Description</span>
            <p className="text-sm mt-1">{formData.description || "—"}</p>
          </div>
          
          <div className="pt-4 border-t">
            <span className="text-sm text-muted-foreground">Business Justification</span>
            <p className="text-sm mt-1">{formData.businessJustification || "—"}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>Redundancy check confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Workflow Preview */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-2">Approval Workflow</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your request type and amount, this request will follow this workflow:
        </p>
        
        <div className="space-y-3">
          {allSteps.map((step, index) => {
            const isIncluded = workflowSteps.includes(step);
            const isSkipped = isStepSkipped(step, mockRequest as PurchaseRequest);
            const isConditional = step === 'negotiation' || step === 'compliance_it_review';
            
            return (
              <div 
                key={step}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isIncluded ? "bg-card" : "bg-muted/30 opacity-60"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  isIncluded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isSkipped ? (
                    <X className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium text-sm",
                    !isIncluded && "line-through"
                  )}>
                    {getStepLabel(step)}
                  </p>
                  {isSkipped && step === 'compliance_it_review' && (
                    <p className="text-xs text-muted-foreground">
                      Skipped for contract renewals
                    </p>
                  )}
                  {isConditional && step === 'negotiation' && (
                    <p className="text-xs text-muted-foreground">
                      {requiresNegotiation 
                        ? "Required - amount exceeds $25,000" 
                        : "Skipped - amount is $25,000 or less"}
                    </p>
                  )}
                </div>
                {isIncluded && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {/* High-value notice */}
        {requiresNegotiation && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">High-Value Request</p>
              <p className="text-muted-foreground">
                Requests over $25,000 require negotiation review by Director of Operations.
              </p>
            </div>
          </div>
        )}

        {/* Renewal notice */}
        {formData.requestType === 'renewal' && (
          <div className="mt-4 p-3 rounded-lg bg-status-info-bg border border-status-info/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-status-info mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-status-info">Contract Renewal</p>
              <p className="text-muted-foreground">
                Renewals skip the Compliance & IT review step since the vendor was previously approved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
