import { StepProps } from "./types";
import { 
  formatCurrency, 
  getDepartmentLabel, 
  getSubDepartmentLabel,
  departmentBudgets
} from "@/lib/mockData";
import { CheckCircle2, DollarSign, AlertCircle, Paperclip, Bot, Building2 } from "lucide-react";
import { ApprovalWorkflowDiagram, WorkflowNode, WorkflowStep, ParallelSteps } from "@/components/ApprovalWorkflowDiagram";
import { RiskAssessmentPanel } from "./RiskAssessmentPanel";
import { calculateRiskAssessment } from "@/lib/riskScoring";
function buildWorkflowNodes(
  requestType: 'new_purchase' | 'renewal',
  budgetedAmount: number
): WorkflowNode[] {
  const requiresNegotiation = budgetedAmount > 25000;
  const isRenewal = requestType === 'renewal';

  const nodes: WorkflowNode[] = [];

  // Step 1 & 2: Intake & Requirements (combined as they're both by requester)
  nodes.push({
    id: 'intake_requirements',
    label: 'Intake & Requirements',
    description: 'Steps 1 & 2 - Form submission',
    status: 'completed',
    approver: { name: 'You', role: 'Requester' },
    completedAt: 'Just now',
  } as WorkflowStep);

  // Step 3: Department Pre-Approval
  nodes.push({
    id: 'department_pre',
    label: 'Department Pre-Approval',
    description: 'Step 3 - Department/Pod Leader review',
    status: 'current',
    approver: { name: 'Department Leader', role: 'Approver' },
  } as WorkflowStep);

  // Step 4: Compliance & IT Review (Parallel) - Skip for renewals
  if (isRenewal) {
    nodes.push({
      steps: [
        {
          id: 'compliance',
          label: 'Compliance Review',
          status: 'skipped',
          conditionLabel: 'Skipped - Not required for renewals',
        } as WorkflowStep,
        {
          id: 'it_review',
          label: 'IT Review',
          status: 'skipped',
          conditionLabel: 'Skipped - Not required for renewals',
        } as WorkflowStep,
      ],
      label: 'Parallel Reviews',
    } as ParallelSteps);
  } else {
    nodes.push({
      steps: [
        {
          id: 'compliance',
          label: 'Compliance Review',
          description: 'Data privacy, security & regulatory',
          status: 'pending',
          approver: { name: 'Compliance Team', role: 'Reviewer' },
        } as WorkflowStep,
        {
          id: 'it_review',
          label: 'IT Review',
          description: 'Technical compatibility & security',
          status: 'pending',
          approver: { name: 'IT Team', role: 'Reviewer' },
        } as WorkflowStep,
      ],
      label: 'Parallel Reviews',
    } as ParallelSteps);
  }

  // Step 5: Negotiation (conditional on amount)
  nodes.push({
    id: 'negotiation',
    label: 'Negotiation',
    description: 'Director of Operations review',
    status: requiresNegotiation ? 'pending' : 'skipped',
    isConditional: true,
    conditionLabel: requiresNegotiation 
      ? `Required - Amount exceeds $25,000`
      : 'Skipped - Under $25K threshold',
    approver: requiresNegotiation 
      ? { name: 'Director of Operations', role: 'Negotiator' } 
      : undefined,
  } as WorkflowStep);

  // Step 6: Finance & Department Final Approval (can be parallel if negotiated)
  // For preview, we show them as potentially parallel
  nodes.push({
    steps: [
      {
        id: 'finance_final',
        label: 'Finance Approval',
        description: 'Final budget approval',
        status: 'pending',
        approver: { name: 'Finance Team', role: 'Approver' },
      } as WorkflowStep,
      {
        id: 'department_final',
        label: 'Dept. Re-Approval',
        description: 'If price was negotiated',
        status: 'pending',
        isConditional: true,
        conditionLabel: 'Only if price changes',
        approver: { name: 'Department Head', role: 'Approver' },
      } as WorkflowStep,
    ],
    label: 'Final Approvals',
  } as ParallelSteps);

  // Step 7: Contracting
  nodes.push({
    id: 'contracting',
    label: 'Contracting',
    description: 'Contract signing & system setup',
    status: 'pending',
    approver: { name: 'Finance', role: 'Contract Admin' },
  } as WorkflowStep);

  return nodes;
}

export function ReviewStep({ formData }: StepProps) {
  const requiresNegotiation = (formData.budgetedAmount || 0) > 25000;
  const workflowNodes = buildWorkflowNodes(
    formData.requestType,
    formData.budgetedAmount || 0
  );

  // Check for AI/ML and portfolio flags
  const hasAiMlFlags = formData.hasAiMlCapabilities || formData.hasLlmApiAccess || formData.usesMlForAnalysis;
  const hasPortfolioFlags = formData.hasPortfolioCompanyAccess || formData.integratesWithPortfolioNetworks || formData.usedByPortfolioStaff;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Risk Assessment Panel */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Risk Assessment & Routing</h2>
        <RiskAssessmentPanel formData={formData} />
      </div>

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
              <span className="text-muted-foreground">Vendor</span>
              <p className="font-medium">{formData.vendorName || "—"}</p>
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
              <span className="text-muted-foreground">Contract Term</span>
              <p className="font-medium capitalize">
                {formData.contractTerm.replace('_', ' ')}
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

          {/* Risk Flags Summary */}
          {(hasAiMlFlags || hasPortfolioFlags) && (
            <div className="pt-4 border-t space-y-2">
              {hasAiMlFlags && (
                <div className="flex items-center gap-2 text-sm">
                  <Bot className="w-4 h-4 text-status-warning" />
                  <span>AI/ML capabilities detected - CIO review required</span>
                </div>
              )}
              {hasPortfolioFlags && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-status-warning" />
                  <span>Portfolio company access - CIO review required</span>
                </div>
              )}
            </div>
          )}

          {/* Renewal Use Case Change */}
          {formData.requestType === 'renewal' && formData.useCaseChanged && (
            <div className="pt-4 border-t">
              <span className="text-sm text-muted-foreground">Use Case Changes</span>
              <p className="text-sm mt-1">{formData.useCaseChangeDescription || "Changes noted but not described"}</p>
            </div>
          )}

          {/* Uploaded Files */}
          {formData.uploadedFiles.length > 0 && (
            <div className="pt-4 border-t">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attached Documents ({formData.uploadedFiles.length})
              </span>
              <div className="mt-2 space-y-1">
                {formData.uploadedFiles.filter(f => f.status === 'complete').map(file => (
                  <p key={file.id} className="text-sm text-primary">
                    • {file.name}
                  </p>
                ))}
              </div>
            </div>
          )}
          
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

      {/* Approval Workflow Diagram */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Approval Workflow Diagram</h3>
          <p className="text-sm text-muted-foreground">
            Visual representation of the approval flow. Click any step for details.
          </p>
        </div>

        <ApprovalWorkflowDiagram
          nodes={workflowNodes}
          requestType={formData.requestType}
          budgetedAmount={formData.budgetedAmount || 0}
        />

        {/* High-value notice */}
        {requiresNegotiation && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
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
        {formData.requestType === 'renewal' && !formData.useCaseChanged && (
          <div className="p-3 rounded-lg bg-status-info-bg border border-status-info/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-status-info mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-status-info">Contract Renewal - Streamlined Review</p>
              <p className="text-muted-foreground">
                Renewals with no use case changes skip the Compliance & IT review steps.
              </p>
            </div>
          </div>
        )}

        {/* Renewal with changes notice */}
        {formData.requestType === 'renewal' && formData.useCaseChanged && (
          <div className="p-3 rounded-lg bg-status-warning-bg border border-status-warning/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-status-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-status-warning">Contract Renewal - Use Case Changed</p>
              <p className="text-muted-foreground">
                IT review required due to changed use case or enabled features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
