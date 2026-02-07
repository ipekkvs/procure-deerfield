import { useMemo } from "react";
import { RequestFormData } from "./types";
import { calculateRiskAssessment, tierDescriptions, RiskTier } from "@/lib/riskScoring";
import { departmentBudgets } from "@/lib/mockData";
import {
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Bot,
  Building2,
  DollarSign,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskAssessmentPanelProps {
  formData: RequestFormData;
}

export function RiskAssessmentPanel({ formData }: RiskAssessmentPanelProps) {
  const assessment = useMemo(() => {
    const budget = departmentBudgets.find(b => b.department === formData.department);
    
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
  
  const tierInfo = tierDescriptions[assessment.tier];
  
  const getTierIcon = (tier: RiskTier) => {
    switch (tier) {
      case 0: return <ShieldCheck className="w-6 h-6 text-status-success" />;
      case 1: return <Shield className="w-6 h-6 text-primary" />;
      case 2: return <Shield className="w-6 h-6 text-status-warning" />;
      case 3: return <ShieldAlert className="w-6 h-6 text-status-error" />;
      case 4: return <ShieldAlert className="w-6 h-6 text-status-error" />;
    }
  };
  
  const getTierBgColor = (tier: RiskTier) => {
    switch (tier) {
      case 0: return "bg-status-success-bg border-status-success/30";
      case 1: return "bg-primary/5 border-primary/30";
      case 2: return "bg-status-warning-bg border-status-warning/30";
      case 3: return "bg-status-error-bg border-status-error/30";
      case 4: return "bg-status-error-bg border-status-error/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Risk Tier Header */}
      <div className={cn(
        "rounded-xl border p-5",
        getTierBgColor(assessment.tier)
      )}>
        <div className="flex items-start gap-4">
          {getTierIcon(assessment.tier)}
          <div className="flex-1">
            <h3 className={cn("text-lg font-semibold", tierInfo.color)}>
              {tierInfo.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {tierInfo.description}
            </p>
            
            {/* Risk Score Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Risk Score</span>
                <span className="font-medium">{assessment.riskScore}/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                  assessment.riskScore < 25 ? "bg-status-success" :
                    assessment.riskScore < 50 ? "bg-status-warning" :
                    assessment.riskScore < 75 ? "bg-status-warning" : "bg-status-error"
                  )}
                  style={{ width: `${assessment.riskScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Triggers */}
      <div className="rounded-xl border bg-card p-5">
        <h4 className="font-semibold mb-3">Key Triggers Detected</h4>
        <div className="grid grid-cols-2 gap-3">
          <TriggerBadge 
            active={assessment.aiMlDetected}
            icon={<Bot className="w-4 h-4" />}
            label="AI/ML Tool"
          />
          <TriggerBadge 
            active={assessment.portfolioAccessDetected}
            icon={<Building2 className="w-4 h-4" />}
            label="Portfolio Access"
          />
          <TriggerBadge 
            active={assessment.isPreApprovedVendor}
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Pre-Approved Vendor"
            positive
          />
          <TriggerBadge 
            active={(formData.budgetedAmount || 0) > 50000}
            icon={<DollarSign className="w-4 h-4" />}
            label="Over $50K"
          />
        </div>
      </div>
      
      {/* Required Approvers */}
      <div className="rounded-xl border bg-card p-5">
        <h4 className="font-semibold mb-3">Required Approvers</h4>
        <div className="space-y-2">
          <ApproverRow label="Manager" required />
          <ApproverRow 
            label="IT Review" 
            required={assessment.requiresIt} 
            skipped={!assessment.requiresIt}
          />
          <ApproverRow 
            label="Compliance" 
            required={assessment.requiresCompliance}
            skipped={!assessment.requiresCompliance}
          />
          <ApproverRow 
            label="Legal" 
            required={assessment.requiresLegal}
            skipped={!assessment.requiresLegal}
          />
          <ApproverRow 
            label="Finance" 
            required={assessment.requiresFinance}
            autoApproved={assessment.financeAutoApproved}
          />
          <ApproverRow 
            label="CIO" 
            required={assessment.requiresCio}
            skipped={!assessment.requiresCio}
          />
        </div>
      </div>
      
      {/* Approval Path */}
      <div className="rounded-xl border bg-card p-5">
        <h4 className="font-semibold mb-3">Approval Path</h4>
        <div className="flex flex-wrap items-center gap-2">
          {assessment.approvalPath.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium",
                idx === 0 ? "bg-primary text-primary-foreground" :
                step === "Auto-Approved" ? "bg-status-success-bg text-status-success" :
                step === "Done" ? "bg-muted text-muted-foreground" :
                "bg-muted text-foreground"
              )}>
                {step}
              </span>
              {idx < assessment.approvalPath.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Routing Reasons */}
      {assessment.routingReasons.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="font-semibold mb-3">Routing Reasons</h4>
          <ul className="space-y-1.5">
            {assessment.routingReasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TriggerBadge({ 
  active, 
  icon, 
  label, 
  positive = false 
}: { 
  active: boolean; 
  icon: React.ReactNode; 
  label: string;
  positive?: boolean;
}) {
  if (!active) return null;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
      positive 
        ? "bg-status-success-bg text-status-success" 
        : "bg-status-warning-bg text-status-warning"
    )}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function ApproverRow({ 
  label, 
  required, 
  skipped = false,
  autoApproved = false 
}: { 
  label: string; 
  required: boolean;
  skipped?: boolean;
  autoApproved?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={cn(
        "text-sm",
        skipped && "text-muted-foreground line-through"
      )}>
        {label}
      </span>
      {autoApproved ? (
        <span className="text-xs bg-status-success-bg text-status-success px-2 py-0.5 rounded-full">
          Auto-Approved
        </span>
      ) : skipped ? (
        <span className="text-xs text-muted-foreground">Skipped</span>
      ) : required ? (
        <CheckCircle2 className="w-4 h-4 text-status-success" />
      ) : (
        <XCircle className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}
