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
import { Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function IntakeStep({ formData, updateFormData }: StepProps) {
  const [detectedCategory, setDetectedCategory] = useState<RequestCategory | null>(null);

  // Auto-detect category based on keywords
  const detectCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.match(/software|saas|subscription|license|app|platform|tool|slack|zoom|salesforce|hubspot|notion/)) {
      setDetectedCategory('saas');
    } else if (lower.match(/laptop|computer|macbook|monitor|keyboard|mouse|hardware|device|phone|ipad/)) {
      setDetectedCategory('hardware');
    } else if (lower.match(/consulting|contractor|audit|training|agency|freelancer|service/)) {
      setDetectedCategory('services');
    } else {
      setDetectedCategory(null);
    }
  };

  useEffect(() => {
    detectCategory(formData.description);
  }, [formData.description]);

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

      {/* Department */}
      <div className="rounded-xl border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.department || ""} 
              onValueChange={(v) => updateFormData({ 
                department: v as Department,
                subDepartment: null // Reset sub-department when department changes
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
          
          {/* Sub-Department (only for Deerfield Intelligence) */}
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
      {formData.category === 'saas' && (
        <div className="rounded-xl border bg-card p-6">
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
