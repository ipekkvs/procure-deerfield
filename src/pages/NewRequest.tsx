import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Cloud,
  Monitor,
  Wrench,
  Package,
  Sparkles
} from "lucide-react";
import { RequestCategory, Urgency, formatCurrency } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: 'saas', label: 'SaaS / Software', icon: Cloud, description: 'Cloud software and subscriptions' },
  { id: 'hardware', label: 'Hardware', icon: Monitor, description: 'Physical equipment and devices' },
  { id: 'services', label: 'Professional Services', icon: Wrench, description: 'Consulting, contractors, etc.' },
  { id: 'other', label: 'Other', icon: Package, description: 'Anything else' },
];

const urgencyOptions: { value: Urgency; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'No rush - within 30 days' },
  { value: 'medium', label: 'Medium', description: 'Standard - within 14 days' },
  { value: 'high', label: 'High', description: 'Urgent - within 7 days' },
  { value: 'critical', label: 'Critical', description: 'Immediate - ASAP' },
];

const NewRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Form state
  const [description, setDescription] = useState("");
  const [detectedCategory, setDetectedCategory] = useState<RequestCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [department, setDepartment] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [justification, setJustification] = useState("");

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

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    detectCategory(value);
  };

  const steps = [
    { label: "Describe", completed: step > 1, current: step === 1 },
    { label: "Details", completed: step > 2, current: step === 2 },
    { label: "Review", completed: step > 3, current: step === 3 },
  ];

  const canProceedStep1 = description.length > 10 && (selectedCategory || detectedCategory);
  const canProceedStep2 = title && amount && department && justification;

  const handleSubmit = () => {
    toast({
      title: "Request Submitted!",
      description: "Your purchase request has been submitted for approval.",
    });
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold">New Purchase Request</h1>
        <p className="text-muted-foreground mt-1">
          Tell us what you need and we'll route it to the right approvers
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <ProgressTimeline steps={steps} />
      </div>

      {/* Step 1: Description */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border bg-card p-6">
            <Label htmlFor="description" className="text-base font-semibold">
              What would you like to purchase?
            </Label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Describe what you need in plain language. We'll help categorize it.
            </p>
            <Textarea
              id="description"
              placeholder="e.g., Annual subscription to Figma for our design team..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="min-h-[120px] text-base"
            />
            
            {detectedCategory && !selectedCategory && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Looks like a <strong className="capitalize">{detectedCategory}</strong> purchase
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6">
            <Label className="text-base font-semibold">Category</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Select or confirm the category for your purchase
            </p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const isDetected = !selectedCategory && detectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as RequestCategory)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isDetected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected || isDetected ? "bg-primary/20" : "bg-muted"
                      )}>
                        <cat.icon className={cn(
                          "w-5 h-5",
                          isSelected || isDetected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border bg-card p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Request Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Figma Enterprise License"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Estimated Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Urgency</Label>
              <RadioGroup
                value={urgency}
                onValueChange={(v) => setUrgency(v as Urgency)}
                className="grid grid-cols-4 gap-3 mt-2"
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

            <div>
              <Label htmlFor="justification">Business Justification</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Why is this purchase necessary? What problem does it solve?
              </p>
              <Textarea
                id="justification"
                placeholder="Explain the business need and expected outcomes..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="gap-2"
            >
              Review
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Review Your Request</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Title</span>
                  <p className="font-medium">{title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium capitalize">{selectedCategory || detectedCategory}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-medium">{formatCurrency(Number(amount))}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department</span>
                  <p className="font-medium capitalize">{department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Urgency</span>
                  <p className="font-medium capitalize">{urgency}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="text-sm mt-1">{description}</p>
              </div>
              
              <div className="pt-4 border-t">
                <span className="text-sm text-muted-foreground">Business Justification</span>
                <p className="text-sm mt-1">{justification}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-2">Approval Workflow</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on the category and amount, this request will be routed to:
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-muted font-medium">Manager</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-muted font-medium">IT Review</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-muted font-medium">Finance</span>
              {Number(amount) > 50000 && (
                <>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1 rounded-full bg-muted font-medium">CFO</span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRequest;
