import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "./types";
import { FileUpload } from "./FileUpload";
import { 
  Urgency, 
  getDepartmentBudget, 
  formatCurrency,
  getDepartmentLabel
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Calendar, DollarSign, Info } from "lucide-react";

const urgencyOptions: { value: Urgency; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'No rush - 30 days' },
  { value: 'medium', label: 'Medium', description: 'Standard - 14 days' },
  { value: 'high', label: 'High', description: 'Urgent - 7 days' },
  { value: 'critical', label: 'Critical', description: 'Immediate - ASAP' },
];

export function RequirementsStep({ formData, updateFormData }: StepProps) {
  const departmentBudget = formData.department 
    ? getDepartmentBudget(formData.department) 
    : null;
  
  const budgetAfterPurchase = departmentBudget && formData.budgetedAmount
    ? departmentBudget.remaining - formData.budgetedAmount
    : null;

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
            />
          </div>
        </div>

        {/* Budget Impact Display */}
        {departmentBudget && formData.department && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="w-4 h-4 text-primary" />
              {getDepartmentLabel(formData.department)} Budget Impact
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Budget</span>
                <p className="font-semibold">{formatCurrency(departmentBudget.totalBudget)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Spent to Date</span>
                <p className="font-semibold">{formatCurrency(departmentBudget.spentToDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining</span>
                <p className="font-semibold text-status-success">{formatCurrency(departmentBudget.remaining)}</p>
              </div>
              {formData.budgetedAmount && budgetAfterPurchase !== null && (
                <div>
                  <span className="text-muted-foreground">After Purchase</span>
                  <p className={cn(
                    "font-semibold",
                    budgetAfterPurchase < 0 ? "text-destructive" : 
                    budgetAfterPurchase < departmentBudget.totalBudget * 0.1 ? "text-status-warning" :
                    "text-status-success"
                  )}>
                    {formatCurrency(budgetAfterPurchase)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
