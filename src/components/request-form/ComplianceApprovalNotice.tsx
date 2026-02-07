import { formatCurrency } from "@/lib/mockData";
import { 
  Shield, 
  ShieldCheck,
  Clock, 
  CheckCircle2, 
  HeartPulse,
  TrendingUp,
  Building2,
  Globe,
  FileCheck,
  FlaskConical,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskAssessment } from "@/lib/riskScoring";

interface ComplianceApprovalNoticeProps {
  assessment: RiskAssessment;
  vendorName: string;
  isPreApprovedVendor: boolean;
  useCaseChanged: boolean;
  useCaseChangeDescription: string;
}

const triggerIcons: Record<string, React.ReactNode> = {
  'PHI/Patient data access': <HeartPulse className="w-4 h-4" />,
  'Portfolio company patient-facing tool': <Building2 className="w-4 h-4" />,
  'Portfolio company patient data': <HeartPulse className="w-4 h-4" />,
  'Investment research/proprietary data': <TrendingUp className="w-4 h-4" />,
  'Healthcare delivery or medical device related': <HeartPulse className="w-4 h-4" />,
  'FDA-regulated activities or clinical trials': <FlaskConical className="w-4 h-4" />,
  'New vendor requiring data processing agreement': <FileCheck className="w-4 h-4" />,
  'International vendor with data storage (cross-border transfer)': <Globe className="w-4 h-4" />,
  'Use case changed on pre-approved vendor - security re-review needed': <RefreshCcw className="w-4 h-4" />,
};

export function ComplianceApprovalNotice({ 
  assessment, 
  vendorName,
  isPreApprovedVendor,
  useCaseChanged,
  useCaseChangeDescription
}: ComplianceApprovalNoticeProps) {
  // Use case change on pre-approved vendor - special messaging
  if (isPreApprovedVendor && useCaseChanged) {
    return (
      <div className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-status-warning/20">
            <RefreshCcw className="w-5 h-5 text-status-warning" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-status-warning">
              ⚠️ Use Case Change Detected - Compliance Review Required
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              You're renewing <strong>{vendorName}</strong> (pre-approved vendor), but enabling NEW features:
            </p>
            
            {useCaseChangeDescription && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
                <p className="text-sm italic">"{useCaseChangeDescription}"</p>
              </div>
            )}
            
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Why review is needed:</p>
              <p className="text-sm text-muted-foreground">
                Pre-approved vendors can skip review for STANDARD use, but new features may 
                process data differently and require Compliance assessment.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-status-warning/20">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              This should be a quick review (2-3 days) focused only on new features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compliance skipped - show confirmation
  if (assessment.complianceSkipped || !assessment.requiresCompliance) {
    return (
      <div className="rounded-xl border border-status-success/30 bg-status-success-bg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-status-success/20">
            <ShieldCheck className="w-5 h-5 text-status-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-status-success">✓ Compliance Review Not Required</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {assessment.complianceSkipReason || 
                "This request doesn't involve regulated data or healthcare activities."}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Compliance has been notified but doesn't need to approve.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Compliance required - show triggers
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-primary">Compliance Review Required</h4>
          <p className="text-sm text-muted-foreground mt-1">
            This request requires Compliance approval because:
          </p>
          
          <div className="mt-3 space-y-2">
            {assessment.complianceTriggers.map((trigger, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <span className="text-primary">
                  {triggerIcons[trigger] || <Shield className="w-4 h-4" />}
                </span>
                <span className="text-sm font-medium">{trigger}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-y-1.5">
            <p className="text-sm font-medium">Compliance will review for:</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Data privacy compliance (HIPAA, GDPR)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Regulatory requirements (SEC, FDA)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Vendor due diligence</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Contract risk assessment</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-primary/20">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Estimated review time: 5-7 days
          </p>
        </div>
      </div>
    </div>
  );
}
