import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { IntakeStep } from "@/components/request-form/IntakeStep";
import { RequirementsStep } from "@/components/request-form/RequirementsStep";
import { ReviewStep } from "@/components/request-form/ReviewStep";
import { RequestFormData, initialFormData } from "@/components/request-form/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RequestFormData>(initialFormData);

  const updateFormData = (updates: Partial<RequestFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const steps = [
    { label: "Intake", completed: step > 1, current: step === 1 },
    { label: "Requirements", completed: step > 2, current: step === 2 },
    { label: "Review", completed: step > 3, current: step === 3 },
  ];

  // Validation for Step 1
  const canProceedStep1 = 
    formData.description.length > 10 && 
    formData.category !== null &&
    formData.department !== null &&
    formData.redundancyCheckConfirmed;

  // Validation for Step 2
  const canProceedStep2 = 
    formData.title.trim() !== "" && 
    formData.budgetedAmount !== null && 
    formData.budgetedAmount > 0 &&
    formData.targetSignDate !== "" &&
    formData.businessJustification.trim() !== "";

  const handleSubmit = () => {
    toast({
      title: "Request Submitted!",
      description: "Your purchase request has been submitted for approval. You'll receive updates as it progresses.",
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

      {/* Step 1: Initial Intake */}
      {step === 1 && (
        <>
          <IntakeStep formData={formData} updateFormData={updateFormData} />
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Requirements Gathering */}
      {step === 2 && (
        <>
          <RequirementsStep formData={formData} updateFormData={updateFormData} />
          <div className="flex justify-between mt-6">
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
        </>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <>
          <ReviewStep formData={formData} updateFormData={updateFormData} />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewRequest;
