import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProps, IntegrationType } from "./types";
import { Server, HelpCircle, Shield, Database, Key, Network, Settings, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const integrationOptions: {
  value: IntegrationType;
  label: string;
  description: string;
  riskScore: number;
  icon: React.ReactNode;
}[] = [
  {
    value: 'none',
    label: 'No integration - Standalone tool',
    description: 'Runs independently, no data exchange with Deerfield systems',
    riskScore: 0,
    icon: <Server className="w-4 h-4" />,
  },
  {
    value: 'sso_only',
    label: 'Single Sign-On (SSO) only',
    description: 'Users log in with Deerfield credentials, no data sync',
    riskScore: 3,
    icon: <Key className="w-4 h-4" />,
  },
  {
    value: 'read_only_api',
    label: 'Read-only API access',
    description: 'Tool pulls data from our systems but doesn\'t write back',
    riskScore: 5,
    icon: <Database className="w-4 h-4" />,
  },
  {
    value: 'bidirectional_api',
    label: 'Bi-directional API integration',
    description: 'Two-way data sync with our systems',
    riskScore: 10,
    icon: <Settings className="w-4 h-4" />,
  },
  {
    value: 'core_system',
    label: 'Core system integration',
    description: 'Deep integration with investment platform, ERP, or critical systems',
    riskScore: 10,
    icon: <Shield className="w-4 h-4" />,
  },
  {
    value: 'network_vpn',
    label: 'Network/VPN access required',
    description: 'Needs to be on internal network or VPN for operation',
    riskScore: 7,
    icon: <Network className="w-4 h-4" />,
  },
  {
    value: 'not_sure',
    label: 'Not sure what integration is needed',
    description: 'IT will assess during review',
    riskScore: 5,
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export function TechnicalIntegrationSection({ formData, updateFormData }: StepProps) {
  const selectedOption = integrationOptions.find(o => o.value === formData.integrationType);
  const requiresItReview = formData.integrationType !== 'none';

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <Label className="text-base font-semibold">Technical Integration Requirements</Label>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        How will this tool integrate with Deerfield systems?
      </p>
      
      <RadioGroup
        value={formData.integrationType}
        onValueChange={(v) => updateFormData({ integrationType: v as IntegrationType })}
        className="space-y-3"
      >
        {integrationOptions.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
              formData.integrationType === option.value 
                ? "border-primary bg-primary/5" 
                : "border-transparent hover:bg-muted/50"
            )}
          >
            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={option.value} className="cursor-pointer flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
                {option.riskScore > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    option.riskScore >= 7 ? "bg-status-error-bg text-status-error" :
                    option.riskScore >= 5 ? "bg-status-warning-bg text-status-warning" :
                    "bg-muted text-muted-foreground"
                  )}>
                    +{option.riskScore} IT risk
                  </span>
                )}
              </Label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>

      {requiresItReview && (
        <div className="mt-4 p-3 rounded-lg bg-status-warning-bg border border-status-warning/20">
          <p className="text-sm text-status-warning font-medium">
            → IT review will be added to the approval flow
          </p>
        </div>
      )}

      {/* Additional technical requirements */}
      <div className="mt-6 pt-6 border-t">
        <Label className="text-sm font-medium">Additional Technical Requirements</Label>
        <div className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="requiresDataStorage"
              checked={formData.requiresDataStorage}
              onCheckedChange={(checked) => 
                updateFormData({ requiresDataStorage: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="requiresDataStorage" className="cursor-pointer text-sm">
              <span className="font-medium">Cloud data storage with new vendor</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Vendor will store Deerfield data in their cloud infrastructure
              </span>
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="requiresNetworkAccess"
              checked={formData.requiresNetworkAccess}
              onCheckedChange={(checked) => 
                updateFormData({ requiresNetworkAccess: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="requiresNetworkAccess" className="cursor-pointer text-sm">
              <span className="font-medium">VPN or internal network access</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Tool needs access to internal network resources
              </span>
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="requiresCustomDevelopment"
              checked={formData.requiresCustomDevelopment}
              onCheckedChange={(checked) => 
                updateFormData({ requiresCustomDevelopment: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="requiresCustomDevelopment" className="cursor-pointer text-sm">
              <span className="font-medium">Custom development or significant configuration</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Requires IT involvement for setup, customization, or infrastructure changes
              </span>
            </Label>
          </div>
        </div>
      </div>

      {/* Sensitive data access */}
      <div className="mt-6 pt-6 border-t">
        <Label className="text-sm font-medium">Sensitive Data Access</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Select all types of sensitive data this tool will access
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="sensitiveDataPhi"
              checked={formData.sensitiveDataAccess.phi}
              onCheckedChange={(checked) => 
                updateFormData({ 
                  sensitiveDataAccess: { 
                    ...formData.sensitiveDataAccess, 
                    phi: checked === true 
                  } 
                })
              }
              className="mt-1"
            />
            <Label htmlFor="sensitiveDataPhi" className="cursor-pointer text-sm">
              <span className="font-medium">Protected Health Information (PHI)</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Patient data, medical records, health information
              </span>
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="sensitiveDataInvestment"
              checked={formData.sensitiveDataAccess.investmentData}
              onCheckedChange={(checked) => 
                updateFormData({ 
                  sensitiveDataAccess: { 
                    ...formData.sensitiveDataAccess, 
                    investmentData: checked === true 
                  } 
                })
              }
              className="mt-1"
            />
            <Label htmlFor="sensitiveDataInvestment" className="cursor-pointer text-sm">
              <span className="font-medium">Investment/Proprietary Data</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Investment research, trading data, portfolio analytics
              </span>
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="sensitiveDataPii"
              checked={formData.sensitiveDataAccess.pii}
              onCheckedChange={(checked) => 
                updateFormData({ 
                  sensitiveDataAccess: { 
                    ...formData.sensitiveDataAccess, 
                    pii: checked === true 
                  } 
                })
              }
              className="mt-1"
            />
            <Label htmlFor="sensitiveDataPii" className="cursor-pointer text-sm">
              <span className="font-medium">Personally Identifiable Information (PII)</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Names, addresses, SSNs, contact information
              </span>
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}