import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  requests, 
  formatCurrency, 
  formatDate,
  getStatusColor, 
  getStatusLabel,
  getCategoryIcon,
  getDepartmentLabel,
  getSubDepartmentLabel,
  getStepLabel,
  getWorkflowSteps,
  isStepSkipped,
  getDepartmentBudget,
  ApprovalStep
} from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressTimeline, TimelineStep } from "@/components/ProgressTimeline";
import { BudgetWidget } from "@/components/BudgetWidget";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Check, 
  X, 
  HelpCircle,
  Clock,
  User,
  Building2,
  AlertTriangle,
  FileText,
  ExternalLink,
  DollarSign,
  RefreshCw,
  Shield,
  Monitor,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [comments, setComments] = useState("");
  const [negotiatedPrice, setNegotiatedPrice] = useState("");
  const [negotiationNotes, setNegotiationNotes] = useState("");

  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold mb-2">Request not found</h2>
        <p className="text-muted-foreground mb-4">The request you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")}>Go back home</Button>
      </div>
    );
  }

  // Get workflow steps for this request
  const workflowSteps = getWorkflowSteps(request);
  
  // Build timeline steps
  const buildApprovalSteps = (): TimelineStep[] => {
    const allPossibleSteps: ApprovalStep[] = [
      'intake',
      'requirements',
      'department_pre_approval',
      'compliance_it_review',
      'negotiation',
      'finance_final_approval',
      'department_final_approval',
      'contracting'
    ];

    return allPossibleSteps
      .filter(step => {
        // Always show, but mark as skipped if not in workflow
        if (step === 'department_final_approval' && !request.priceChanged) {
          return false; // Don't show if no price change
        }
        return true;
      })
      .map((step, index) => {
        const isSkipped = isStepSkipped(step, request);
        const stepIndex = workflowSteps.indexOf(step);
        const currentStepIndex = workflowSteps.indexOf(request.currentStep);
        const isCompleted = stepIndex !== -1 && stepIndex < currentStepIndex;
        const isCurrent = step === request.currentStep;
        
        let conditionLabel: string | undefined;
        if (step === 'compliance_it_review' && isSkipped) {
          conditionLabel = 'Renewal';
        } else if (step === 'negotiation') {
          conditionLabel = request.budgetedAmount > 25000 ? '>$25K' : '≤$25K';
        }

        return {
          label: getStepLabel(step),
          completed: isCompleted,
          current: isCurrent,
          skipped: isSkipped,
          conditional: step === 'negotiation' || step === 'compliance_it_review',
          conditionLabel
        };
      });
  };

  const approvalSteps = buildApprovalSteps();

  const handleApprove = () => {
    toast({
      title: "Request Approved",
      description: `${request.title} has been approved and moved to the next step.`,
    });
    setShowApproveDialog(false);
    navigate("/approvals");
  };

  const handleReject = () => {
    toast({
      title: "Request Rejected",
      description: `${request.title} has been rejected.`,
      variant: "destructive",
    });
    setShowRejectDialog(false);
    navigate("/approvals");
  };

  const handleRequestInfo = () => {
    toast({
      title: "Information Requested",
      description: "The requester has been notified.",
    });
    setShowInfoDialog(false);
  };

  const handleCompleteNegotiation = () => {
    const newPrice = parseFloat(negotiatedPrice);
    const priceChanged = newPrice !== request.budgetedAmount;
    
    toast({
      title: "Negotiation Complete",
      description: priceChanged 
        ? `Price negotiated from ${formatCurrency(request.budgetedAmount)} to ${formatCurrency(newPrice)}. Routing for re-approval.`
        : "Negotiation complete. Routing to Finance for final approval.",
    });
    setShowNegotiationDialog(false);
    navigate("/approvals");
  };

  const isPending = request.status === 'pending' || request.status === 'needs_info';
  const departmentBudget = getDepartmentBudget(request.department);
  
  // Determine current step context
  const isComplianceITStep = request.currentStep === 'compliance_it_review';
  const isNegotiationStep = request.currentStep === 'negotiation';
  const isFinanceStep = request.currentStep === 'finance_final_approval';
  const isDeptFinalStep = request.currentStep === 'department_final_approval';
  const isContractingStep = request.currentStep === 'contracting';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{getCategoryIcon(request.category)}</span>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{request.title}</h1>
                <StatusBadge variant={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </StatusBadge>
                {request.requestType === 'renewal' && (
                  <StatusBadge variant="info" dot={false}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Renewal
                  </StatusBadge>
                )}
              </div>
              <p className="text-muted-foreground">{request.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(request.budgetedAmount)}</p>
            {request.priceChanged && request.negotiatedAmount && (
              <p className="text-sm text-status-success">
                Negotiated: {formatCurrency(request.negotiatedAmount)} 
                <span className="ml-1">(saved {formatCurrency(request.savingsAchieved || 0)})</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground capitalize">{request.category}</p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <h3 className="font-semibold mb-4">Approval Progress</h3>
        <ProgressTimeline 
          steps={approvalSteps}
          showSavings={request.priceChanged && request.negotiatedAmount ? {
            originalAmount: request.originalAmount,
            negotiatedAmount: request.negotiatedAmount
          } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Step Context */}
          {isPending && (
            <div className={cn(
              "rounded-xl border p-4",
              isComplianceITStep ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900" :
              isNegotiationStep ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900" :
              isFinanceStep ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" :
              "bg-card"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {isComplianceITStep && <Shield className="w-5 h-5 text-purple-600" />}
                {isNegotiationStep && <Briefcase className="w-5 h-5 text-blue-600" />}
                {isFinanceStep && <DollarSign className="w-5 h-5 text-green-600" />}
                {isDeptFinalStep && <Building2 className="w-5 h-5 text-orange-600" />}
                {isContractingStep && <FileText className="w-5 h-5 text-primary" />}
                <span className="font-semibold">
                  Current Step: {getStepLabel(request.currentStep)}
                </span>
              </div>
              
              {isComplianceITStep && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Parallel review by Compliance and IT teams:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background">
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Compliance Review
                        {request.complianceApproved && <Check className="w-4 h-4 text-status-success" />}
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        <li>• Data privacy concerns</li>
                        <li>• Security standards compliance</li>
                        <li>• Regulatory requirements</li>
                        <li>• Vendor risk assessment</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-background">
                      <p className="font-medium flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> IT Review
                        {request.itApproved && <Check className="w-4 h-4 text-status-success" />}
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        <li>• Technical compatibility</li>
                        <li>• Integration requirements</li>
                        <li>• Security architecture</li>
                        <li>• System access needs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isNegotiationStep && (
                <p className="text-sm text-muted-foreground">
                  Director of Operations reviews for negotiation opportunities on requests over $25,000.
                </p>
              )}

              {isDeptFinalStep && (
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    ⚠️ Price was negotiated from {formatCurrency(request.originalAmount)} to {formatCurrency(request.negotiatedAmount || 0)}
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    Department re-approval required for revised terms.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Request Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Request Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="mt-1">{request.description}</p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Business Justification</label>
                <p className="mt-1">{request.businessJustification}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Requester:</span>
                  <span className="font-medium">{request.requesterName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{getDepartmentLabel(request.department)}</span>
                </div>
                {request.subDepartment && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <span className="text-muted-foreground ml-6">Sub-Dept:</span>
                    <span className="font-medium">{getSubDepartmentLabel(request.subDepartment)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{formatDate(request.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Urgency:</span>
                  <StatusBadge 
                    variant={
                      request.urgency === 'critical' ? 'error' :
                      request.urgency === 'high' ? 'warning' :
                      request.urgency === 'medium' ? 'info' : 'success'
                    }
                    dot={false}
                  >
                    {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                  </StatusBadge>
                </div>
                {request.targetSignDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Target Sign:</span>
                    <span className="font-medium">{formatDate(request.targetSignDate)}</span>
                  </div>
                )}
                {request.licensesSeatsCount && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Licenses:</span>
                    <span className="font-medium">{request.licensesSeatsCount} seats</span>
                  </div>
                )}
              </div>

              {request.negotiationNotes && (
                <div className="pt-4 border-t">
                  <label className="text-sm text-muted-foreground">Negotiation Notes</label>
                  <p className="mt-1 text-sm">{request.negotiationNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Only show for pending requests */}
          {isPending && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {isNegotiationStep ? (
                  <Button 
                    onClick={() => {
                      setNegotiatedPrice(request.budgetedAmount.toString());
                      setShowNegotiationDialog(true);
                    }}
                    className="gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Complete Negotiation
                  </Button>
                ) : isContractingStep ? (
                  <Button 
                    onClick={() => setShowApproveDialog(true)}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Sign Contract
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowApproveDialog(true)}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setShowInfoDialog(true)}
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Request More Info
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Impact */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Budget Impact</h3>
            {departmentBudget && (
              <>
                <BudgetWidget 
                  label={`${getDepartmentLabel(request.department)} Budget`}
                  spent={departmentBudget.spentToDate}
                  total={departmentBudget.totalBudget}
                />
                <div className="mt-4 pt-4 border-t text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">After this purchase:</span>
                  </div>
                  <BudgetWidget 
                    label="Projected"
                    spent={departmentBudget.spentToDate + (request.negotiatedAmount || request.budgetedAmount)}
                    total={departmentBudget.totalBudget}
                  />
                </div>
              </>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Risk Score</h3>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                request.budgetedAmount > 50000 ? "bg-status-warning-bg" : "bg-status-success-bg"
              )}>
                <span className={cn(
                  "text-lg font-bold",
                  request.budgetedAmount > 50000 ? "text-status-warning" : "text-status-success"
                )}>
                  {request.budgetedAmount > 50000 ? "Med" : "Low"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {request.budgetedAmount > 50000 
                  ? "High-value request requires additional review"
                  : "Within budget limits and standard approval threshold"
                }
              </div>
            </div>
          </div>

          {/* Related Documents */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Documents</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-sm text-left">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">Quote_{request.title.replace(/\s/g, '_')}.pdf</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-sm text-left">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">Business_Case.docx</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isContractingStep ? "Sign Contract" : "Approve Request"}
            </DialogTitle>
            <DialogDescription>
              {isContractingStep 
                ? `Sign the contract for "${request.title}" at ${formatCurrency(request.negotiatedAmount || request.budgetedAmount)}.`
                : `Approve "${request.title}" for ${formatCurrency(request.negotiatedAmount || request.budgetedAmount)}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Comments (optional)</label>
            <Textarea
              placeholder="Add any comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              {isContractingStep ? "Sign & Complete" : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiation Dialog */}
      <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Negotiation</DialogTitle>
            <DialogDescription>
              Review and update the negotiated terms for "{request.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Original Amount</Label>
                <p className="text-lg font-semibold">{formatCurrency(request.budgetedAmount)}</p>
              </div>
              <div>
                <Label htmlFor="negotiatedPrice">Negotiated Amount</Label>
                <Input
                  id="negotiatedPrice"
                  type="number"
                  value={negotiatedPrice}
                  onChange={(e) => setNegotiatedPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {negotiatedPrice && parseFloat(negotiatedPrice) !== request.budgetedAmount && (
              <div className="p-3 rounded-lg bg-status-success-bg text-status-success text-sm">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Savings: {formatCurrency(request.budgetedAmount - parseFloat(negotiatedPrice))}
              </div>
            )}
            <div>
              <Label htmlFor="negotiationNotes">Negotiation Notes</Label>
              <Textarea
                id="negotiationNotes"
                placeholder="Describe what was negotiated..."
                value={negotiationNotes}
                onChange={(e) => setNegotiationNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {negotiatedPrice && parseFloat(negotiatedPrice) !== request.budgetedAmount && (
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-sm text-orange-800 dark:text-orange-200">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Price change will require department re-approval.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteNegotiation}>
              Complete Negotiation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason for rejection *</label>
            <Textarea
              placeholder="Explain why this request is being rejected..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!comments}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Specify what additional information you need from the requester.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">What do you need? *</label>
            <Textarea
              placeholder="e.g., Please provide vendor comparison quotes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInfo} disabled={!comments}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestDetail;
