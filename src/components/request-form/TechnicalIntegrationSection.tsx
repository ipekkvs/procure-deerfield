import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StepProps } from "./types";
import { Server, HelpCircle, Shield, Database, Key, Network, Settings, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type IntegrationRequirement = 
  | 'sso_only' 
  | 'read_only_api' 
  | 'bidirectional_api' 
  | 'core_system' 
  | 'network_vpn'
  | 'not_sure';

const integrationOptions: {
  value: IntegrationRequirement;
  label: string;
  description: string;
  riskScore: number;
  icon: React.ReactNode;
}[] = [
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
    label: "I don't know",
    description: 'IT will assess integration requirements during review',
    riskScore: 5,
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export function TechnicalIntegrationSection({ formData, updateFormData }: StepProps) {
  const [open, setOpen] = useState(false);
  
  // Convert single integrationType to array for multi-select
  // We'll store selected items in a derived state from formData
  const selectedIntegrations: IntegrationRequirement[] = 
    formData.integrationType === 'none' 
      ? [] 
      : formData.integrationType === 'not_sure'
        ? ['not_sure']
        : [formData.integrationType as IntegrationRequirement];
  
  // For multi-select, we need to track multiple selections
  // Let's use the existing sensitiveDataAccess pattern to store multiple
  const [multiSelect, setMultiSelect] = useState<IntegrationRequirement[]>(
    formData.integrationType === 'none' ? [] : [formData.integrationType as IntegrationRequirement]
  );
  
  const handleToggle = (value: IntegrationRequirement) => {
    let newSelection: IntegrationRequirement[];
    
    // If selecting "I don't know", clear other selections
    if (value === 'not_sure') {
      newSelection = multiSelect.includes('not_sure') ? [] : ['not_sure'];
    } else {
      // Remove "not_sure" if selecting other options
      const withoutNotSure = multiSelect.filter(v => v !== 'not_sure');
      
      if (withoutNotSure.includes(value)) {
        newSelection = withoutNotSure.filter(v => v !== value);
      } else {
        newSelection = [...withoutNotSure, value];
      }
    }
    
    setMultiSelect(newSelection);
    
    // Update formData - for backward compatibility, set the primary integration type
    if (newSelection.length === 0) {
      updateFormData({ integrationType: 'none' });
    } else if (newSelection.includes('not_sure')) {
      updateFormData({ integrationType: 'not_sure' });
    } else {
      // Set the highest risk integration as the primary
      const highest = newSelection.reduce((max, curr) => {
        const currOption = integrationOptions.find(o => o.value === curr);
        const maxOption = integrationOptions.find(o => o.value === max);
        return (currOption?.riskScore || 0) > (maxOption?.riskScore || 0) ? curr : max;
      }, newSelection[0]);
      updateFormData({ integrationType: highest });
    }
  };
  
  const requiresItReview = multiSelect.length > 0;
  const hasNotSure = multiSelect.includes('not_sure');
  
  const getSelectedLabels = () => {
    if (multiSelect.length === 0) return "Select integration requirements...";
    if (multiSelect.length === 1) {
      return integrationOptions.find(o => o.value === multiSelect[0])?.label || "";
    }
    return `${multiSelect.length} requirements selected`;
  };
  
  const getMaxRiskScore = () => {
    if (multiSelect.length === 0) return 0;
    return Math.max(...multiSelect.map(v => 
      integrationOptions.find(o => o.value === v)?.riskScore || 0
    ));
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <Label className="text-base font-semibold">Technical Integration Requirements</Label>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        How will this tool integrate with Deerfield systems? Select all that apply.
      </p>
      
      {/* Multi-select Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <div className="flex items-center gap-2 flex-wrap flex-1 text-left">
              {multiSelect.length === 0 ? (
                <span className="text-muted-foreground">Select integration requirements...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {multiSelect.map(value => {
                    const option = integrationOptions.find(o => o.value === value);
                    return (
                      <span
                        key={value}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                          value === 'not_sure' 
                            ? "bg-status-warning-bg text-status-warning"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {option?.icon}
                        <span className="max-w-[150px] truncate">{option?.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 py-1">
              Select all integration types that apply
            </p>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {integrationOptions.map((option) => {
              const isSelected = multiSelect.includes(option.value);
              const isDisabled = hasNotSure && option.value !== 'not_sure';
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 text-left transition-colors",
                    isSelected 
                      ? "bg-primary/5" 
                      : "hover:bg-muted/50",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    option.value === 'not_sure' && "border-t"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    className="mt-0.5"
                    disabled={isDisabled}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{option.icon}</span>
                      <span className="font-medium text-sm">{option.label}</span>
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
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          {multiSelect.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setMultiSelect([]);
                  updateFormData({ integrationType: 'none' });
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* IT Review Notice */}
      {requiresItReview && (
        <div className={cn(
          "mt-4 p-3 rounded-lg border",
          hasNotSure 
            ? "bg-status-warning-bg border-status-warning/20" 
            : "bg-status-info-bg border-status-info/20"
        )}>
          <p className={cn(
            "text-sm font-medium",
            hasNotSure ? "text-status-warning" : "text-status-info"
          )}>
            {hasNotSure 
              ? "→ IT will assess integration requirements and add review to approval flow"
              : "→ IT review will be added to the approval flow"
            }
          </p>
          {getMaxRiskScore() >= 7 && !hasNotSure && (
            <p className="text-xs text-muted-foreground mt-1">
              High-risk integration detected. Security assessment required.
            </p>
          )}
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
