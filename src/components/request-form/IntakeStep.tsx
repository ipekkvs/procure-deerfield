import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "./CategorySelector";
import { StepProps } from "./types";
import { 
  RequestCategory, 
  RequestType,
  departments, 
  subDepartments,
  Department,
  SubDepartment
} from "@/lib/mockData";
import { detectKeywords, isPreApprovedVendor, ContractTerm } from "@/lib/riskScoring";
import { Sparkles, AlertCircle, AlertTriangle, Bot, Building2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function IntakeStep({ formData, updateFormData }: StepProps) {
  const [detectedCategory, setDetectedCategory] = useState<RequestCategory | null>(null);
  const [keywordAlerts, setKeywordAlerts] = useState<{
    aiMl: boolean;
    portfolio: boolean;
    preApproved: boolean;
  }>({ aiMl: false, portfolio: false, preApproved: false });

  // Auto-detect category and keywords based on description and vendor name
  useEffect(() => {
    const text = `${formData.description} ${formData.vendorName}`;
    const lower = text.toLowerCase();
    
    // Category detection
    if (lower.match(/software|saas|subscription|license|app|platform|tool|slack|zoom|salesforce|hubspot|notion/)) {
      setDetectedCategory('saas');
    } else if (lower.match(/laptop|computer|macbook|monitor|keyboard|mouse|hardware|device|phone|ipad/)) {
      setDetectedCategory('hardware');
    } else if (lower.match(/consulting|contractor|audit|training|agency|freelancer|service/)) {
      setDetectedCategory('services');
    } else {
      setDetectedCategory(null);
    }
    
    // Keyword detection for risk factors
    const detection = detectKeywords(text);
    const isPreApproved = isPreApprovedVendor(formData.vendorName);
    
    setKeywordAlerts({
      aiMl: detection.aiMlDetected,
      portfolio: detection.portfolioAccessDetected,
      preApproved: isPreApproved,
    });
    
    // Auto-check boxes if keywords detected
    if (detection.aiMlDetected && !formData.hasAiMlCapabilities) {
      updateFormData({ hasAiMlCapabilities: true });
    }
    if (detection.portfolioAccessDetected && !formData.hasPortfolioCompanyAccess) {
      updateFormData({ hasPortfolioCompanyAccess: true });
    }
  }, [formData.description, formData.vendorName]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Request Type */}
      <div className="rounded-xl border bg-card p-6">
        <Label className="text-base font-semibold">Request Type</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Is this a new purchase or a contract renewal?
        </p>
        <RadioGroup
          value={formData.requestType}
          onValueChange={(v) => updateFormData({ requestType: v as RequestType })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new_purchase" id="new_purchase" />
            <Label htmlFor="new_purchase" className="cursor-pointer">New Purchase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="renewal" id="renewal" />
            <Label htmlFor="renewal" className="cursor-pointer">Contract Renewal</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Vendor Name (for pre-approved detection) */}
      <div className="rounded-xl border bg-card p-6">
        <Label htmlFor="vendorName" className="text-base font-semibold">
          Vendor / Product Name
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Enter the vendor or product name to check pre-approval status
        </p>
        <Input
          id="vendorName"
          placeholder="e.g., Salesforce, Microsoft, OpenAI..."
          value={formData.vendorName}
          onChange={(e) => updateFormData({ vendorName: e.target.value })}
          className="text-base"
        />
        
        {keywordAlerts.preApproved && formData.vendorName && (
          <div className="mt-4 p-3 rounded-lg bg-status-success-bg border border-status-success/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-status-success" />
            <span className="text-sm">
              <strong>{formData.vendorName}</strong> is a pre-approved vendor - streamlined review available
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border bg-card p-6">
        <Label htmlFor="description" className="text-base font-semibold">
          What are you requesting?
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Describe what you need in plain language. We'll help categorize it.
        </p>
        <Textarea
          id="description"
          placeholder="e.g., Annual subscription to Figma for our design team..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className="min-h-[120px] text-base"
        />
        
        {detectedCategory && !formData.category && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Looks like a <strong className="capitalize">{detectedCategory}</strong> purchase
            </span>
          </div>
        )}
      </div>

      {/* Auto-detection Alerts */}
      {(keywordAlerts.aiMl || keywordAlerts.portfolio) && (
        <div className="space-y-3">
          {keywordAlerts.aiMl && (
            <div className="p-4 rounded-lg bg-status-warning-bg border border-status-warning/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-warning mt-0.5" />
              <div>
                <p className="font-medium text-status-warning">⚠️ AI/ML Tool Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  CIO review required for platform consistency. The AI/ML capability checkbox has been auto-selected.
                </p>
              </div>
            </div>
          )}
          
          {keywordAlerts.portfolio && (
            <div className="p-4 rounded-lg bg-status-warning-bg border border-status-warning/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-warning mt-0.5" />
              <div>
                <p className="font-medium text-status-warning">⚠️ Portfolio Company Access Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  CIO review required for reputational risk. The portfolio company access checkbox has been auto-selected.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category */}
      <div className="rounded-xl border bg-card p-6">
        <Label className="text-base font-semibold">Category</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Select or confirm the category for your purchase
        </p>
        <CategorySelector
          selectedCategory={formData.category}
          detectedCategory={detectedCategory}
          onSelect={(cat) => updateFormData({ category: cat })}
        />
      </div>

      {/* AI/ML Detection Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">AI & Machine Learning</Label>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          CIO reviews all AI/ML tools to ensure platform consistency
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasAiMlCapabilities"
              checked={formData.hasAiMlCapabilities}
              onCheckedChange={(checked) => 
                updateFormData({ hasAiMlCapabilities: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="hasAiMlCapabilities" className="cursor-pointer text-sm">
              This tool uses or provides AI/ML capabilities
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasLlmApiAccess"
              checked={formData.hasLlmApiAccess}
              onCheckedChange={(checked) => 
                updateFormData({ hasLlmApiAccess: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="hasLlmApiAccess" className="cursor-pointer text-sm">
              This tool provides API access to LLM services (OpenAI, Anthropic, etc.)
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="usesMlForAnalysis"
              checked={formData.usesMlForAnalysis}
              onCheckedChange={(checked) => 
                updateFormData({ usesMlForAnalysis: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="usesMlForAnalysis" className="cursor-pointer text-sm">
              This tool uses machine learning for analysis or decisions
            </Label>
          </div>
        </div>
      </div>

      {/* Portfolio Company Access Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Portfolio Company Integration</Label>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          CIO reviews portfolio integrations for reputational risk
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="hasPortfolioCompanyAccess"
              checked={formData.hasPortfolioCompanyAccess}
              onCheckedChange={(checked) => 
                updateFormData({ hasPortfolioCompanyAccess: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="hasPortfolioCompanyAccess" className="cursor-pointer text-sm">
              This tool will have direct access to portfolio company systems
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="integratesWithPortfolioNetworks"
              checked={formData.integratesWithPortfolioNetworks}
              onCheckedChange={(checked) => 
                updateFormData({ integratesWithPortfolioNetworks: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="integratesWithPortfolioNetworks" className="cursor-pointer text-sm">
              This tool will integrate with portfolio company networks
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="usedByPortfolioStaff"
              checked={formData.usedByPortfolioStaff}
              onCheckedChange={(checked) => 
                updateFormData({ usedByPortfolioStaff: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="usedByPortfolioStaff" className="cursor-pointer text-sm">
              This tool will be used by portfolio company staff
            </Label>
          </div>
        </div>
      </div>
      {/* Contract Term - Moved to RequirementsStep for better flow with budget calculation */}

      {/* Use Case Change (Renewals Only) */}
      {formData.requestType === 'renewal' && (
        <div className="rounded-xl border bg-card p-6 animate-fade-in">
          <Label className="text-base font-semibold">Use Case Changes</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Has the use case or enabled features changed since last approval?
          </p>
          
          <RadioGroup
            value={formData.useCaseChanged ? "yes" : "no"}
            onValueChange={(v) => updateFormData({ 
              useCaseChanged: v === "yes",
              useCaseChangeDescription: v === "no" ? "" : formData.useCaseChangeDescription
            })}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="use_case_no" />
              <Label htmlFor="use_case_no" className="cursor-pointer">
                No changes - Same use as before
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="use_case_yes" />
              <Label htmlFor="use_case_yes" className="cursor-pointer">
                Yes, use case has changed
              </Label>
            </div>
          </RadioGroup>
          
          {formData.useCaseChanged && (
            <div className="mt-4 animate-fade-in">
              <Label htmlFor="useCaseChangeDescription" className="text-sm">
                Please describe what's changing:
              </Label>
              <Textarea
                id="useCaseChangeDescription"
                placeholder="Examples: Enabling AI features, new integrations, different data access..."
                value={formData.useCaseChangeDescription}
                onChange={(e) => updateFormData({ useCaseChangeDescription: e.target.value })}
                className="mt-2 min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Changed use cases require IT re-review even for pre-approved vendors
              </p>
            </div>
          )}
        </div>
      )}

      {/* Department */}
      <div className="rounded-xl border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.department || ""} 
              onValueChange={(v) => updateFormData({ 
                department: v as Department,
                subDepartment: null
              })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.department === 'deerfield_intelligence' && (
            <div>
              <Label htmlFor="subDepartment">Sub-Department / Pod</Label>
              <Select 
                value={formData.subDepartment || ""} 
                onValueChange={(v) => updateFormData({ subDepartment: v as SubDepartment })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select pod" />
                </SelectTrigger>
                <SelectContent>
                  {subDepartments.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* SaaS-specific: Licenses/Seats */}
      {(formData.category === 'saas' || detectedCategory === 'saas') && (
        <div className="rounded-xl border bg-card p-6 animate-fade-in">
          <Label htmlFor="licensesSeatsCount">Number of Licenses/Seats Required</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            e.g., Salesforce licenses = 90
          </p>
          <Input
            id="licensesSeatsCount"
            type="number"
            placeholder="Enter number of seats"
            value={formData.licensesSeatsCount || ""}
            onChange={(e) => updateFormData({ 
              licensesSeatsCount: e.target.value ? parseInt(e.target.value) : null 
            })}
            className="max-w-[200px]"
          />
        </div>
      )}

      {/* Redundancy Check */}
      <div className={cn(
        "rounded-xl border p-6",
        formData.redundancyCheckConfirmed ? "bg-card" : "bg-warning/5 border-warning/30"
      )}>
        <div className="flex items-start gap-3">
          <Checkbox
            id="redundancyCheck"
            checked={formData.redundancyCheckConfirmed}
            onCheckedChange={(checked) => 
              updateFormData({ redundancyCheckConfirmed: checked === true })
            }
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="redundancyCheck" className="text-base font-semibold cursor-pointer">
              Redundancy Check Confirmation
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I confirm that I have checked and Deerfield does not already have a comparable 
              software or resource that could fulfill this need.
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              This prevents redundant acquisitions and optimizes existing assets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
