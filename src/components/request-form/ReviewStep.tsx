import { useMemo } from "react";
import { StepProps } from "./types";
import { 
  formatCurrency, 
  getDepartmentLabel, 
  getSubDepartmentLabel,
  departmentBudgets,
  getDepartmentBudget
} from "@/lib/mockData";
import { CheckCircle2, DollarSign, AlertCircle, Paperclip, Bot, Building2, Server } from "lucide-react";
import { ApprovalWorkflowDiagram, WorkflowNode, WorkflowStep, ParallelSteps } from "@/components/ApprovalWorkflowDiagram";
import { RiskAssessmentPanel } from "./RiskAssessmentPanel";
import { FinanceApprovalNotice } from "./FinanceApprovalNotice";
import { CioApprovalNotice } from "./CioApprovalNotice";
import { ComplianceApprovalNotice } from "./ComplianceApprovalNotice";
import { ItApprovalNotice } from "./ItApprovalNotice";
import { calculateRiskAssessment, RiskAssessment, isPreApprovedVendor } from "@/lib/riskScoring";
function buildWorkflowNodes(
  requestType: 'new_purchase' | 'renewal',
  budgetedAmount: number,
  assessment: RiskAssessment
): WorkflowNode[] {
  const requiresNegotiation = budgetedAmount > 25000;
  const isRenewal = requestType === 'renewal';

  const nodes: WorkflowNode[] = [];

  // Step 1 & 2: Intake & Requirements (combined as they're both by requester)
  nodes.push({
    id: 'intake_requirements',
    label: 'Intake & Requirements',
    description: 'Form submission complete',
    status: 'completed',
    approver: { name: 'You', role: 'Requester' },
    completedAt: 'Just now',
    whyRequired: 'Every request starts with intake to gather requirements and route appropriately.',
    comments: 'Request submitted successfully with all required information.',
  } as WorkflowStep);

  // Step 3: Department Pre-Approval
  nodes.push({
    id: 'department_pre',
    label: 'Manager Approval',
    description: 'Department/Pod Leader review',
    status: 'current',
    approver: { name: 'Department Leader', role: 'Manager' },
    slaHoursRemaining: 48,
    whyRequired: 'Manager must approve all purchases for their department to ensure business need and budget alignment.',
  } as WorkflowStep);

  // Step 4: Compliance & IT Review (Parallel) - Conditional based on assessment
  const complianceStatus = assessment.complianceSkipped ? 'skipped' : (assessment.requiresCompliance ? 'pending' : 'skipped');
  const itStatus = assessment.itSkipped ? 'skipped' : (assessment.requiresIt ? 'pending' : 'skipped');
  
  // Build compliance trigger reason for whyRequired
  const complianceWhyRequired = assessment.complianceTriggers.length > 0 
    ? `Required because: ${assessment.complianceTriggers.slice(0, 2).join(', ')}` 
    : undefined;
  
  // Build IT trigger reason for whyRequired  
  const itWhyRequired = assessment.itTriggers.length > 0 
    ? `Required because: ${assessment.itTriggers.slice(0, 2).join(', ')}` 
    : undefined;
  
  // Show parallel reviews if either is required
  if (assessment.requiresIt || assessment.requiresCompliance) {
    nodes.push({
      steps: [
        {
          id: 'compliance',
          label: 'Compliance',
          description: assessment.requiresCompliance ? 'Data privacy & regulatory' : undefined,
          status: complianceStatus,
          conditionLabel: assessment.complianceSkipped 
            ? assessment.complianceSkipReason || 'Skipped - Not required'
            : undefined,
          approver: assessment.requiresCompliance 
            ? { name: 'Compliance Team', role: 'Reviewer' } 
            : undefined,
          slaHoursRemaining: assessment.requiresCompliance ? 120 : undefined,
          whyRequired: assessment.requiresCompliance ? complianceWhyRequired : undefined,
        } as WorkflowStep,
        {
          id: 'it_review',
          label: 'IT Security',
          description: assessment.requiresIt ? 'Technical & security review' : undefined,
          status: itStatus,
          conditionLabel: assessment.itSkipped 
            ? assessment.itSkipReason || 'Skipped - Not required'
            : undefined,
          approver: assessment.requiresIt 
            ? { name: 'IT Security Team', role: 'Reviewer' } 
            : undefined,
          slaHoursRemaining: assessment.requiresIt ? 72 : undefined,
          whyRequired: assessment.requiresIt ? itWhyRequired : undefined,
        } as WorkflowStep,
      ],
      label: assessment.requiresParallelItCompliance ? 'Reviews in Parallel' : 'Technical Reviews',
    } as ParallelSteps);
  } else if (isRenewal) {
    // For renewals with no reviews needed, show skipped
    nodes.push({
      steps: [
        {
          id: 'compliance',
          label: 'Compliance',
          status: 'skipped',
          conditionLabel: 'Pre-approved vendor renewal with no changes',
        } as WorkflowStep,
        {
          id: 'it_review',
          label: 'IT Security',
          status: 'skipped',
          conditionLabel: 'No technical changes detected',
        } as WorkflowStep,
      ],
      label: 'Technical Reviews',
    } as ParallelSteps);
  }

  // Step 5: Negotiation (conditional on amount)
  nodes.push({
    id: 'negotiation',
    label: 'Negotiation',
    description: requiresNegotiation ? 'Director of Operations review' : undefined,
    status: requiresNegotiation ? 'pending' : 'skipped',
    isConditional: true,
    conditionLabel: requiresNegotiation 
      ? `Amount exceeds $25,000`
      : 'Under $25K threshold',
    approver: requiresNegotiation 
      ? { name: 'Director of Operations', role: 'Negotiator' } 
      : undefined,
    slaHoursRemaining: requiresNegotiation ? 72 : undefined,
    whyRequired: requiresNegotiation 
      ? 'High-value purchases require negotiation to ensure best pricing and terms.'
      : undefined,
  } as WorkflowStep);

  // Step 6: Finance & Department Final Approval (can be parallel if negotiated)
  const financeWhyRequired = assessment.financeAutoApproved 
    ? 'Auto-approved: Under $10K, within budget, single-year term'
    : assessment.isOverBudget 
      ? 'Required because request exceeds department budget'
      : budgetedAmount >= 10000 
        ? 'Required for purchases $10K or more'
        : 'Budget verification required';

  nodes.push({
    steps: [
      {
        id: 'finance_final',
        label: 'Finance',
        description: assessment.financeAutoApproved ? 'Auto-approved' : 'Budget approval',
        status: assessment.financeAutoApproved ? 'completed' : 'pending',
        approver: { name: 'Finance Team', role: 'Approver' },
        slaHoursRemaining: assessment.financeAutoApproved ? undefined : 48,
        whyRequired: financeWhyRequired,
        completedAt: assessment.financeAutoApproved ? 'Auto-approved' : undefined,
      } as WorkflowStep,
      {
        id: 'department_final',
        label: 'Dept. Re-Approval',
        description: requiresNegotiation ? 'Price change review' : undefined,
        status: requiresNegotiation ? 'pending' : 'skipped',
        isConditional: true,
        conditionLabel: requiresNegotiation 
          ? 'Required after negotiation'
          : 'No re-approval needed',
        approver: requiresNegotiation 
          ? { name: 'Department Head', role: 'Approver' } 
          : undefined,
        whyRequired: requiresNegotiation 
          ? 'Department must re-approve if price changes during negotiation.'
          : undefined,
      } as WorkflowStep,
    ],
    label: 'Final Approvals',
  } as ParallelSteps);

  // Step 7: CIO Approval (conditional on triggers)
  if (assessment.requiresCio) {
    const cioWhyRequired = assessment.cioTriggers.length > 0 
      ? `Required because: ${assessment.cioTriggers.slice(0, 2).join(', ')}`
      : 'Strategic review required';
      
    nodes.push({
      id: 'cio_approval',
      label: 'CIO Approval',
      description: 'Strategic & platform review',
      status: 'pending',
      approver: { name: 'CIO', role: 'Executive Approver' },
      slaHoursRemaining: 120,
      whyRequired: cioWhyRequired,
    } as WorkflowStep);
  }

  // Step 8: Contracting
  nodes.push({
    id: 'contracting',
    label: 'Contracting',
    description: 'Contract signing & setup',
    status: 'pending',
    approver: { name: 'Procurement', role: 'Contract Admin' },
    slaHoursRemaining: 48,
    whyRequired: 'Final step to execute contract and configure vendor access.',
  } as WorkflowStep);

  return nodes;
}

export function ReviewStep({ formData }: StepProps) {
  const requiresNegotiation = (formData.budgetedAmount || 0) > 25000;

  // Check for AI/ML and portfolio flags
  const hasAiMlFlags = formData.hasAiMlCapabilities || formData.hasLlmApiAccess || formData.usesMlForAnalysis;
  const hasPortfolioFlags = formData.hasPortfolioCompanyAccess || formData.integratesWithPortfolioNetworks || formData.usedByPortfolioStaff;

  // Calculate risk assessment for finance and CIO notices
  const assessment = useMemo(() => {
    const budget = getDepartmentBudget(formData.department || 'investment');
    
    return calculateRiskAssessment({
      amount: formData.budgetedAmount || 0,
      requestType: formData.requestType,
      riskFactors: {
        hasAiMlCapabilities: formData.hasAiMlCapabilities,
        hasLlmApiAccess: formData.hasLlmApiAccess,
        usesMlForAnalysis: formData.usesMlForAnalysis,
        hasPortfolioCompanyAccess: formData.hasPortfolioCompanyAccess,
        integratesWithPortfolioNetworks: formData.integratesWithPortfolioNetworks,
        usedByPortfolioStaff: formData.usedByPortfolioStaff,
        contractTerm: formData.contractTerm,
        useCaseChanged: formData.useCaseChanged,
        useCaseChangeDescription: formData.useCaseChangeDescription,
        vendorName: formData.vendorName,
        // Technical integration fields
        integrationType: formData.integrationType,
        requiresDataStorage: formData.requiresDataStorage,
        requiresNetworkAccess: formData.requiresNetworkAccess,
        requiresCustomDevelopment: formData.requiresCustomDevelopment,
        sensitiveDataAccess: formData.sensitiveDataAccess,
        // Map integration type to legacy fields for compatibility
        requiresApiIntegration: formData.integrationType === 'read_only_api' || 
                                formData.integrationType === 'bidirectional_api',
        requiresCoreSystemAccess: formData.integrationType === 'core_system',
        requiresSsoSetup: formData.integrationType === 'sso_only',
      },
      department: formData.department,
      departmentBudgetRemaining: budget?.remaining || 100000,
      description: formData.description,
      vendorName: formData.vendorName,
    });
  }, [formData]);

  // Build workflow nodes with assessment
  const workflowNodes = buildWorkflowNodes(
    formData.requestType,
    formData.budgetedAmount || 0,
    assessment
  );

  const departmentBudget = formData.department 
    ? getDepartmentBudget(formData.department) 
    : null;
  const isOverBudget = departmentBudget && formData.budgetedAmount
    ? formData.budgetedAmount > departmentBudget.remaining
    : false;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CIO Approval Notice (if required) */}
      {assessment.requiresCio && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Executive Approval Required</h2>
          <CioApprovalNotice assessment={assessment} />
        </div>
      )}

      {/* IT Security Review Notice */}
      <div>
        <h2 className="text-lg font-semibold mb-4">IT Security Review Status</h2>
        <ItApprovalNotice 
          assessment={assessment}
          vendorName={formData.vendorName}
          isPreApprovedVendor={isPreApprovedVendor(formData.vendorName)}
          useCaseChanged={formData.useCaseChanged}
          integrationType={formData.integrationType}
        />
      </div>

      {/* Compliance Approval Notice */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Compliance Review Status</h2>
        <ComplianceApprovalNotice 
          assessment={assessment}
          vendorName={formData.vendorName}
          isPreApprovedVendor={isPreApprovedVendor(formData.vendorName)}
          useCaseChanged={formData.useCaseChanged}
          useCaseChangeDescription={formData.useCaseChangeDescription}
        />
      </div>

      {/* Finance Approval Notice */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Finance Approval Status</h2>
        <FinanceApprovalNotice 
          assessment={assessment}
          amount={formData.budgetedAmount || 0}
          contractTerm={formData.contractTerm}
          isOverBudget={isOverBudget}
        />
      </div>

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
