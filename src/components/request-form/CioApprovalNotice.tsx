import { formatCurrency } from "@/lib/mockData";
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Bot, 
  Building2, 
  HeartPulse,
  TrendingUp,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskAssessment } from "@/lib/riskScoring";

interface CioApprovalNoticeProps {
  assessment: RiskAssessment;
}

const triggerIcons: Record<string, React.ReactNode> = {
  'Amount exceeds $50,000': <DollarSign className="w-4 h-4" />,
  'AI/ML tool detected - platform consistency review': <Bot className="w-4 h-4" />,
  'Portfolio company access - reputational risk review': <Building2 className="w-4 h-4" />,
  'PHI/Patient data access': <HeartPulse className="w-4 h-4" />,
  'Investment research/proprietary data': <TrendingUp className="w-4 h-4" />,
  'Core system integration': <Settings className="w-4 h-4" />,
  'Enterprise-wide tool': <Users className="w-4 h-4" />,
};

export function CioApprovalNotice({ assessment }: CioApprovalNoticeProps) {
  if (!assessment.requiresCio) {
    return null;
  }
  
  return (
    <div className="rounded-xl border border-status-error/30 bg-status-error-bg p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-status-error/20">
          <ShieldAlert className="w-5 h-5 text-status-error" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-status-error">CIO Review Required</h4>
          <p className="text-sm text-muted-foreground mt-1">
            This request requires CIO approval because:
          </p>
          
          <div className="mt-3 space-y-2">
            {assessment.cioTriggers.map((trigger, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-error/10 border border-status-error/20"
              >
                <span className="text-status-error">
                  {triggerIcons[trigger] || <ShieldAlert className="w-4 h-4" />}
                </span>
                <span className="text-sm font-medium text-status-error">{trigger}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-y-1.5">
            <p className="text-sm font-medium">CIO will review for:</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Strategic fit and platform consistency</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Enterprise impact</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Technology architecture alignment</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 pt-3 border-t border-status-error/20">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Estimated review time: 3-5 days
          </p>
        </div>
      </div>
    </div>
  );
}
