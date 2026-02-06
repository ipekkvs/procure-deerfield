import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  requests, 
  formatCurrency, 
  formatDate,
  getStatusColor, 
  getStatusLabel,
  getCategoryIcon,
  PurchaseRequest 
} from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { BudgetWidget } from "@/components/BudgetWidget";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [comments, setComments] = useState("");

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

  const approvalSteps = [
    { label: "Submitted", completed: true, current: false },
    { label: "Manager", completed: request.approvalStage > 1, current: request.approvalStage === 1 },
    { label: "IT Review", completed: request.approvalStage > 2, current: request.approvalStage === 2 },
    { label: "Finance", completed: request.approvalStage > 3, current: request.approvalStage === 3 },
    { label: "Approved", completed: request.status === 'approved', current: false },
  ];

  const handleApprove = () => {
    toast({
      title: "Request Approved",
      description: `${request.title} has been approved.`,
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

  const isPending = request.status === 'pending' || request.status === 'needs_info';

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
              </div>
              <p className="text-muted-foreground">{request.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(request.amount)}</p>
            <p className="text-sm text-muted-foreground capitalize">{request.category}</p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <h3 className="font-semibold mb-4">Approval Progress</h3>
        <ProgressTimeline steps={approvalSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
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
                  <span className="font-medium">{request.department}</span>
                </div>
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
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for pending requests */}
          {isPending && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setShowApproveDialog(true)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
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
            <BudgetWidget 
              label={`${request.department} Budget`}
              spent={245000}
              total={350000}
            />
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">After this purchase:</span>
              </div>
              <BudgetWidget 
                label="Projected"
                spent={245000 + request.amount}
                total={350000}
              />
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Risk Score</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-status-success-bg flex items-center justify-center">
                <span className="text-lg font-bold text-status-success">Low</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Within budget limits and standard approval threshold
              </div>
            </div>
          </div>

          {/* Related Documents */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Documents</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-sm text-left">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">Quote_Figma_2024.pdf</span>
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
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              You are about to approve "{request.title}" for {formatCurrency(request.amount)}.
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
              Confirm Approval
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
