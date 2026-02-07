import { RiskAssessment } from "@/lib/riskScoring";
import { CheckCircle2, AlertCircle, Shield, Server, Key, Database, Monitor, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItApprovalNoticeProps {
  assessment: RiskAssessment;
  vendorName: string;
  isPreApprovedVendor: boolean;
  useCaseChanged: boolean;
  integrationType: string;
}

export function ItApprovalNotice({
  assessment,
  vendorName,
  isPreApprovedVendor,
  useCaseChanged,
  integrationType,
}: ItApprovalNoticeProps) {
  const itTriggers = assessment.itTriggers || [];
  const requiresIt = assessment.requiresIt;
  const skipIt = !requiresIt && isPreApprovedVendor && !useCaseChanged;

  // If IT is skipped for pre-approved vendor
  if (skipIt) {
    return (
      <div className="rounded-xl border-2 border-status-success/30 bg-status-success-bg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-status-success mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-status-success text-lg">
              ✓ IT Review Not Required
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              This is a pre-approved vendor with no technical changes.
            </p>
            
            {vendorName && (
              <div className="mt-4 p-3 rounded-lg bg-white/50 border border-status-success/20">
                <p className="text-sm font-medium text-foreground">
                  Pre-Approved Vendor - IT Review Skipped
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>{vendorName}</strong> is pre-approved and you're using standard features.
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span>SSO already configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span>API access already established</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span>Security review completed</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              IT has been notified but doesn't need to approve.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If IT review is required
  if (requiresIt) {
    return (
      <div className="rounded-xl border-2 border-status-warning/30 bg-status-warning-bg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-status-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-status-warning text-lg">
              🔔 IT Security Review Required
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              This request requires IT approval because:
            </p>
            
            <ul className="mt-3 space-y-2">
              {itTriggers.map((trigger, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" />
                  <span className="font-medium">{trigger}</span>
                </li>
              ))}
            </ul>

            {/* Use Case Change Special Alert */}
            {useCaseChanged && isPreApprovedVendor && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Technical Changes Detected - IT Review Required
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're modifying the integration or enabling new features.
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  IT needs to review these changes for security and compatibility.
                </p>
              </div>
            )}
            
            <div className="mt-4 p-3 rounded-lg bg-white/50 border border-status-warning/20">
              <p className="text-sm font-medium text-foreground">IT will review for:</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-status-warning" />
                  <span>Security architecture</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Server className="w-4 h-4 text-status-warning" />
                  <span>Technical compatibility</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Key className="w-4 h-4 text-status-warning" />
                  <span>Access controls</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="w-4 h-4 text-status-warning" />
                  <span>Infrastructure impact</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-medium">Estimated review time:</span> 3-5 days
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: No IT review needed (not pre-approved, but no triggers)
  return (
    <div className="rounded-xl border bg-muted/30 p-6">
      <div className="flex items-start gap-3">
        <Monitor className="w-6 h-6 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            IT Review Status
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            No technical triggers detected for this request.
          </p>
        </div>
      </div>
    </div>
  );
}