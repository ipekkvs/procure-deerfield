import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  requests, 
  formatCurrency, 
  User, 
  departmentBudgets, 
  departments,
  renewals 
} from "@/lib/mockData";
import { 
  ApprovalCard, 
  ApprovalDetailPanel, 
  ApprovalGroup,
  EmptyState,
  type ApprovalRequest 
} from "@/components/approvals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ManagerApprovalsProps {
  user: User;
}

export function ManagerApprovals({ user }: ManagerApprovalsProps) {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const userDepartment = user.department;
  const deptBudget = departmentBudgets.find(b => b.department === userDepartment);
  const deptLabel = departments.find(d => d.value === userDepartment)?.label || userDepartment;

  // Pending my approval
  const pendingApproval: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        r.department === userDepartment &&
        (r.currentStep === 'department_pre_approval' || r.currentStep === 'department_final_approval') &&
        !approvedIds.has(r.id)
      )
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: r.budgetedAmount > 25000,
        isNewVendor: !r.vendorId,
        urgency: r.urgency,
      })),
    [userDepartment, approvedIds]
  );

  const urgentRequests = pendingApproval.filter(r => r.isOverBudget || r.daysWaiting > 3);
  const standardRequests = pendingApproval.filter(r => !r.isOverBudget && r.daysWaiting <= 3);

  // Department requests
  const departmentRequests = requests.filter(r => r.department === userDepartment && r.status === 'pending');
  const departmentRenewals = renewals.filter(r => r.daysUntilExpiration <= 90).slice(0, 3);

  const budgetPercent = deptBudget 
    ? Math.round((deptBudget.spentToDate / deptBudget.totalBudget) * 100) 
    : 0;

  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
      });
    }, 800);
  }, []);

  const handleViewDetails = useCallback((request: ApprovalRequest) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      setSelectedRequest(null);
      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
      });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
      variant: "destructive",
    });
  }, []);

  const handleRequestInfo = useCallback((id: string) => {
    setSelectedRequest(null);
    toast({
      title: "Information Requested",
      description: "A request for more information has been sent.",
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{deptLabel} Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {pendingApproval.length} pending your approval
        </p>
      </div>

      {/* Pending My Approval Section */}
      {pendingApproval.length > 0 ? (
        <div className="space-y-6 max-w-4xl">
          <ApprovalGroup
            title="Urgent"
            icon="urgent"
            requests={urgentRequests}
            defaultOpen={true}
            onQuickApprove={handleQuickApprove}
            onViewDetails={handleViewDetails}
            approvingId={approvingId}
            selectedIds={new Set()}
            onSelect={() => {}}
            showCheckbox={false}
          />

          <ApprovalGroup
            title="Standard"
            icon="standard"
            requests={standardRequests}
            defaultOpen={urgentRequests.length === 0}
            onQuickApprove={handleQuickApprove}
            onViewDetails={handleViewDetails}
            approvingId={approvingId}
            selectedIds={new Set()}
            onSelect={() => {}}
            showCheckbox={false}
          />
        </div>
      ) : (
        <EmptyState />
      )}

      {/* My Department Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
        {/* Budget Widget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Department Budget</CardTitle>
          </CardHeader>
          <CardContent>
            {deptBudget && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{formatCurrency(deptBudget.totalBudget)}</span>
                  <Badge variant={budgetPercent > 90 ? 'destructive' : budgetPercent > 75 ? 'secondary' : 'outline'}>
                    {budgetPercent}% used
                  </Badge>
                </div>
                <Progress 
                  value={budgetPercent} 
                  className={budgetPercent > 90 ? '[&>div]:bg-destructive' : budgetPercent > 75 ? '[&>div]:bg-amber-500' : ''}
                />
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(deptBudget.remaining)} remaining
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Requests</CardTitle>
              <span className="text-sm text-muted-foreground">{departmentRequests.length} total</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {departmentRequests.slice(0, 4).map(request => (
              <div key={request.id} className="flex items-center justify-between text-sm p-2 rounded border">
                <span className="truncate flex-1">{request.title}</span>
                <span className="text-muted-foreground ml-2">{formatCurrency(request.budgetedAmount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
              <Link to="/renewals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departmentRenewals.map(renewal => (
                <div key={renewal.id} className="p-3 rounded-lg border">
                  <p className="font-medium truncate">{renewal.vendorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {renewal.daysUntilExpiration} days • {formatCurrency(renewal.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      <ApprovalDetailPanel
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={handleCloseDetails}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestInfo={handleRequestInfo}
        isApproving={approvingId === selectedRequest?.id}
      />
    </div>
  );
}
