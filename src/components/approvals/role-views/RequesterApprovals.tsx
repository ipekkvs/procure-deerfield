import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { requests, formatCurrency, User } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ApprovalCard, 
  ApprovalDetailPanel, 
  EmptyState, 
  SkeletonList,
  type ApprovalRequest 
} from "@/components/approvals";
import { CheckCircle2, FileText, Clock, Plus } from "lucide-react";

interface RequesterApprovalsProps {
  user: User;
}

export function RequesterApprovals({ user }: RequesterApprovalsProps) {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Get user's own requests
  const myRequests = useMemo(() => 
    requests.filter(r => r.requesterId === user.id).map(r => ({
      id: r.id,
      title: r.title,
      department: r.department,
      amount: r.budgetedAmount,
      requesterName: r.requesterName,
      daysWaiting: r.daysInCurrentStage,
      isOverBudget: r.budgetedAmount > 25000,
      isNewVendor: !r.vendorId,
      urgency: r.urgency,
      status: r.status,
      currentStep: r.currentStep,
      approvalStage: r.approvalStage,
      totalStages: r.totalStages,
    })),
    [user.id]
  );

  const inProgress = myRequests.filter(r => r.status === 'pending');
  const approved = myRequests.filter(r => r.status === 'approved');
  const needsAction = myRequests.filter(r => r.status === 'needs_info');

  const handleViewDetails = useCallback((request: ApprovalRequest) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Requests</h1>
          <p className="text-muted-foreground mt-1">
            {myRequests.length} total requests
          </p>
        </div>
        <Link to="/new-request">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            In Progress
            {inProgress.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{inProgress.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="action" className="gap-2">
            Action Needed
            {needsAction.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">{needsAction.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {myRequests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {myRequests.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                        <Badge variant={
                          request.status === 'approved' ? 'default' : 
                          request.status === 'needs_info' ? 'destructive' : 'secondary'
                        }>
                          {request.status === 'needs_info' ? 'Action Needed' : request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Step {request.approvalStage} of {request.totalStages} • {formatCurrency(request.amount)}
                      </p>
                    </div>
                    <Link to={`/requests/${request.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {inProgress.length === 0 ? (
            <Card className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No requests in progress</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {inProgress.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.currentStep?.replace(/_/g, ' ')} • {request.daysWaiting} days
                      </p>
                    </div>
                    <Link to={`/requests/${request.id}`}>
                      <Button variant="outline" size="sm">Track Progress</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
            <Card className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No approved requests yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {approved.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(request.amount)} • Approved
                      </p>
                    </div>
                    <Link to={`/requests/${request.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="action" className="space-y-4">
          {needsAction.length === 0 ? (
            <Card className="py-12 text-center border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="font-medium text-green-700 dark:text-green-400">All caught up!</p>
              <p className="text-muted-foreground">No requests need your action</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {needsAction.map(request => (
                <Card key={request.id} className="p-4 border-destructive/30 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Additional information requested
                      </p>
                    </div>
                    <Link to={`/requests/${request.id}`}>
                      <Button size="sm">Respond Now</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      <ApprovalDetailPanel
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={handleCloseDetails}
        onApprove={() => {}}
        onReject={() => {}}
        onRequestInfo={() => {}}
        isApproving={false}
      />
    </div>
  );
}
