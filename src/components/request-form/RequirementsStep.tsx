import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "./types";
import { FileUpload } from "./FileUpload";
import { 
  Urgency, 
  getDepartmentBudget, 
  formatCurrency,
  getDepartmentLabel
} from "@/lib/mockData";
import { ContractTerm } from "@/lib/riskScoring";
import { cn } from "@/lib/utils";
import { Calendar, DollarSign, Info, AlertTriangle, TrendingDown, Clock, RefreshCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const urgencyOptions: { value: Urgency; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'No rush - 30 days' },
  { value: 'medium', label: 'Medium', description: 'Standard - 14 days' },
  { value: 'high', label: 'High', description: 'Urgent - 7 days' },
  { value: 'critical', label: 'Critical', description: 'Immediate - ASAP' },
];

const contractTermOptions: { value: ContractTerm; label: string; years: number }[] = [
  { value: 'month_to_month', label: 'Month-to-month / No commitment', years: 0 },
  { value: '1_year', label: '1 year or less', years: 1 },
  { value: '2_years', label: '2 years', years: 2 },
  { value: '3_years', label: '3 years', years: 3 },
  { value: '4_plus_years', label: '4+ years', years: 4 },
];

export function RequirementsStep({ formData, updateFormData }: StepProps) {
  const departmentBudget = formData.department 
    ? getDepartmentBudget(formData.department) 
    : null;
  
  const budgetAfterPurchase = departmentBudget && formData.budgetedAmount
    ? departmentBudget.remaining - formData.budgetedAmount
    : null;
  
  const isOverBudget = budgetAfterPurchase !== null && budgetAfterPurchase < 0;
  const shortfall = isOverBudget ? Math.abs(budgetAfterPurchase) : 0;
  const spentPercentage = departmentBudget 
    ? Math.round((departmentBudget.spentToDate / departmentBudget.totalBudget) * 100)
    : 0;
  
  // Multi-year commitment calculation
  const isMultiYear = formData.contractTerm === '2_years' || 
    formData.contractTerm === '3_years' || 
    formData.contractTerm === '4_plus_years';
  
  const contractYears = contractTermOptions.find(o => o.value === formData.contractTerm)?.years || 1;
  const annualCost = formData.budgetedAmount || 0;
  const totalCommitment = isMultiYear ? annualCost * contractYears : annualCost;
  const isLowAnnualButMultiYear = isMultiYear && annualCost < 10000 && annualCost > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="rounded-xl border bg-card p-6">
        <Label htmlFor="title" className="text-base font-semibold">Request Title</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          A concise name for this request
        </p>
        <Input
          id="title"
          placeholder="e.g., Figma Enterprise License"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
      </div>

      {/* Documentation Upload */}
      <div className="rounded-xl border bg-card p-6">
        <Label className="text-base font-semibold">Documentation</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Upload any product documentation, proposals, quotes, or related materials
        </p>
        <FileUpload
          files={formData.uploadedFiles}
          onFilesChange={(files) => updateFormData({ uploadedFiles: files })}
        />
      </div>

      {/* Timeline & Budget */}
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetSignDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Target Sign Date
            </Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              When do you need this contract signed?
            </p>
            <Input
              id="targetSignDate"
              type="date"
              value={formData.targetSignDate}
              onChange={(e) => updateFormData({ targetSignDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="budgetedAmount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budgeted Amount
            </Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Estimated total cost
            </p>
            <Input
              id="budgetedAmount"
              type="number"
              placeholder="45000"
              value={formData.budgetedAmount || ""}
              onChange={(e) => updateFormData({ 
                budgetedAmount: e.target.value ? parseFloat(e.target.value) : null 
              })}
              className={cn(isOverBudget && "border-status-error focus-visible:ring-status-error")}
            />
          </div>
        </div>

        {/* Enhanced Budget Impact Display */}
        {departmentBudget && formData.department && (
          <div className={cn(
            "p-4 rounded-lg space-y-4",
            isOverBudget ? "bg-status-error-bg border border-status-error/30" : "bg-muted/50"
          )}>
            <div className="flex items-center gap-2 text-sm font-medium">
              {isOverBudget ? (
                <AlertTriangle className="w-4 h-4 text-status-error" />
              ) : (
                <Info className="w-4 h-4 text-primary" />
              )}
              {getDepartmentLabel(formData.department)} Budget
            </div>
            
            {/* Budget Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Budget Utilization</span>
                <span className={cn(
                  "font-medium",
                  spentPercentage > 90 ? "text-status-error" :
                  spentPercentage > 70 ? "text-status-warning" : "text-status-success"
                )}>
                  {spentPercentage}% spent
                </span>
              </div>
              <Progress 
                value={spentPercentage} 
                className={cn(
                  "h-2",
                  spentPercentage > 90 ? "[&>div]:bg-status-error" :
                  spentPercentage > 70 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-success"
                )}
              />
            </div>
            
            {/* Budget Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Annual Budget</span>
                <p className="font-semibold">{formatCurrency(departmentBudget.totalBudget)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Spent to Date</span>
                <p className="font-semibold">{formatCurrency(departmentBudget.spentToDate)} ({spentPercentage}%)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining</span>
                <p className="font-semibold text-status-success">{formatCurrency(departmentBudget.remaining)}</p>
              </div>
              {formData.budgetedAmount && (
                <div>
                  <span className="text-muted-foreground">This Request</span>
                  <p className="font-semibold">{formatCurrency(formData.budgetedAmount)}</p>
                </div>
              )}
            </div>
            
            {/* After Approval Calculation */}
            {formData.budgetedAmount && budgetAfterPurchase !== null && (
              <div className={cn(
                "pt-4 border-t",
                isOverBudget ? "border-status-error/30" : "border-border"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">After Approval:</span>
                  <span className={cn(
                    "text-lg font-bold",
                    isOverBudget ? "text-status-error" : 
                    budgetAfterPurchase < departmentBudget.totalBudget * 0.1 ? "text-status-warning" :
                    "text-status-success"
                  )}>
                    {formatCurrency(budgetAfterPurchase)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Contract Term */}
      <div className={cn(
        "rounded-xl border p-6",
        isMultiYear ? "bg-status-warning-bg border-status-warning/30" : "bg-card"
      )}>
        <Label className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Contract Term
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          How long is this contract commitment?
        </p>
        
        <RadioGroup
          value={formData.contractTerm}
          onValueChange={(v) => updateFormData({ contractTerm: v as ContractTerm })}
          className="space-y-3"
        >
          {contractTermOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <RadioGroupItem value={option.value} id={`term_${option.value}`} />
              <Label htmlFor={`term_${option.value}`} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {/* Total Commitment Calculation */}
        {isMultiYear && formData.budgetedAmount && (
          <div className="mt-6 p-4 rounded-lg bg-status-warning/10 border border-status-warning/30 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <RefreshCcw className="w-5 h-5 text-status-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-status-warning">⚠️ MULTI-YEAR COMMITMENT</p>
                
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Annual Cost</span>
                    <p className="font-semibold">{formatCurrency(annualCost)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract Term</span>
                    <p className="font-semibold">{contractYears} years</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TOTAL COMMITMENT</span>
                    <p className="font-bold text-lg text-status-warning">{formatCurrency(totalCommitment)}</p>
                  </div>
                </div>
                
                {isLowAnnualButMultiYear && (
                  <div className="mt-3 p-2 rounded bg-background/50 text-sm">
                    <p className="text-muted-foreground">
                      Even though the annual cost is under $10,000, this multi-year commitment 
                      requires Finance review.
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mt-3">
                  Multi-year commitments require Finance review regardless of annual amount.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Over-Budget Warning */}
      {isOverBudget && (
        <div className="rounded-xl border border-status-error/30 bg-status-error-bg p-6 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-status-error mt-0.5" />
            <div>
              <p className="font-semibold text-status-error">
                ⚠️ OVER BUDGET BY {formatCurrency(shortfall)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This request exceeds your remaining budget by <strong>{formatCurrency(shortfall)}</strong>.
                You can still submit this request, but it will require Finance exception approval.
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 space-y-1">
            <p className="font-medium text-foreground">Finance will review this with your Department Head to discuss:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Why this purchase is critical now</li>
              <li>Where budget can be reallocated from</li>
              <li>Whether this can be deferred to next quarter</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Over-Budget Justification (Required when over budget) */}
      {isOverBudget && (
        <div className="rounded-xl border border-status-error/30 bg-card p-6 animate-fade-in">
          <Label htmlFor="overBudgetJustification" className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-error" />
            Additional Budget Justification
            <span className="text-status-error">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Explain why this purchase cannot wait or be funded differently (minimum 100 characters)
          </p>
          <Textarea
            id="overBudgetJustification"
            placeholder="Example: Critical for Q4 reporting cycle. Budget overrun due to unexpected compliance tools earlier this quarter. Recommend reallocating from Q1 marketing budget."
            value={formData.overBudgetJustification}
            onChange={(e) => updateFormData({ overBudgetJustification: e.target.value })}
            className={cn(
              "min-h-[120px]",
              formData.overBudgetJustification.length > 0 && formData.overBudgetJustification.length < 100 
                ? "border-status-warning" 
                : ""
            )}
          />
          <div className="flex justify-between mt-2 text-xs">
            <span className={cn(
              formData.overBudgetJustification.length < 100 
                ? "text-status-warning" 
                : "text-status-success"
            )}>
              {formData.overBudgetJustification.length}/100 characters minimum
            </span>
            {formData.overBudgetJustification.length >= 100 && (
              <span className="text-status-success">✓ Requirement met</span>
            )}
          </div>
          
          {/* Acknowledgment Checkbox */}
          <div className="mt-6 flex items-start gap-3">
            <Checkbox
              id="acknowledgesFinanceException"
              checked={formData.acknowledgesFinanceException}
              onCheckedChange={(checked) => 
                updateFormData({ acknowledgesFinanceException: checked === true })
              }
              className="mt-1"
            />
            <Label htmlFor="acknowledgesFinanceException" className="cursor-pointer text-sm">
              I understand this request exceeds my department budget and requires Finance exception approval
            </Label>
          </div>
        </div>
      )}

      {/* Urgency */}
      <div className="rounded-xl border bg-card p-6">
        <Label className="text-base font-semibold">Urgency</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          How soon do you need this?
        </p>
        <RadioGroup
          value={formData.urgency}
          onValueChange={(v) => updateFormData({ urgency: v as Urgency })}
          className="grid grid-cols-4 gap-3"
        >
          {urgencyOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                  "hover:bg-muted/50"
                )}
              >
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground text-center mt-0.5">
                  {option.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Business Justification */}
      <div className="rounded-xl border bg-card p-6">
        <Label htmlFor="justification" className="text-base font-semibold">
          Business Justification
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Why is this purchase necessary? What problem does it solve?
        </p>
        <Textarea
          id="justification"
          placeholder="Explain the business need and expected outcomes..."
          value={formData.businessJustification}
          onChange={(e) => updateFormData({ businessJustification: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
