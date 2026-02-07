import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { requests, formatCurrency } from "@/lib/mockData";
import { 
  ApprovalCard, 
  ApprovalDetailPanel,
  EmptyState,
  type ApprovalRequest 
} from "@/components/approvals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Shield, AlertTriangle, CheckCircle2, Eye, FileCheck } from "lucide-react";
import { preApprovedVendors } from "@/lib/riskScoring";

export function ComplianceApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({ high: true, standard: true, useCase: false, auto: false });

  // High priority: new vendors with sensitive data
  const highPriority: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.complianceApproved && 
        !approvedIds.has(r.id) &&
        (r.description.toLowerCase().includes('patient') || 
         r.description.toLowerCase().includes('hipaa') ||
         (!r.vendorId && r.category === 'saas'))
      )
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: false,
        isNewVendor: !r.vendorId,
        urgency: 'critical' as const,
      })),
    [approvedIds]
  );

  // Standard: DPAs, PII
  const standardReview: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.complianceApproved && 
        !approvedIds.has(r.id) &&
        r.category === 'saas' && 
        r.licensesSeatsCount && r.licensesSeatsCount > 20 &&
        !highPriority.some(h => h.id === r.id)
      )
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: false,
        isNewVendor: !r.vendorId,
        urgency: 'medium' as const,
      })),
    [approvedIds, highPriority]
  );

  // Use case changes
  const useCaseChanges: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.complianceApproved && 
        !approvedIds.has(r.id) &&
        r.requestType === 'renewal' &&
        preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
      )
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: false,
        isNewVendor: false,
        urgency: 'low' as const,
      })),
    [approvedIds]
  );

  const autoApproved = requests.filter(r => r.status === 'approved' && r.budgetedAmount < 10000).slice(0, 5);

  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      toast({ title: "Compliance Approved", description: "Review completed successfully." });
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
      toast({ title: "Compliance Approved", description: "Review completed successfully." });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({ title: "Request Rejected", description: "Compliance review rejected.", variant: "destructive" });
  }, []);

  const totalPending = highPriority.length + standardReview.length + useCaseChanges.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Compliance Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {totalPending} items requiring your review
        </p>
      </div>

      {totalPending === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {/* High Priority */}
          {highPriority.length > 0 && (
            <Collapsible open={openSections.high} onOpenChange={(open) => setOpenSections(s => ({...s, high: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-destructive/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        🔴 HIGH PRIORITY - New Vendors with Sensitive Data
                        <Badge variant="destructive">{highPriority.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.high ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {highPriority.map(request => (
                  <ApprovalCard
                    key={request.id}
                    request={request}
                    onQuickApprove={handleQuickApprove}
                    onViewDetails={handleViewDetails}
                    isApproving={approvingId === request.id}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Standard */}
          {standardReview.length > 0 && (
            <Collapsible open={openSections.standard} onOpenChange={(open) => setOpenSections(s => ({...s, standard: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-amber-600" />
                        🟡 STANDARD - Data Processing Agreements
                        <Badge variant="outline">{standardReview.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.standard ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {standardReview.map(request => (
                  <ApprovalCard
                    key={request.id}
                    request={request}
                    onQuickApprove={handleQuickApprove}
                    onViewDetails={handleViewDetails}
                    isApproving={approvingId === request.id}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Use Case Changes */}
          {useCaseChanges.length > 0 && (
            <Collapsible open={openSections.useCase} onOpenChange={(open) => setOpenSections(s => ({...s, useCase: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        ⚠️ USE CASE CHANGES - Pre-Approved Vendors
                        <Badge variant="outline">{useCaseChanges.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.useCase ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {useCaseChanges.map(request => (
                  <ApprovalCard
                    key={request.id}
                    request={request}
                    onQuickApprove={handleQuickApprove}
                    onViewDetails={handleViewDetails}
                    isApproving={approvingId === request.id}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Auto-Approved */}
          <Collapsible open={openSections.auto} onOpenChange={(open) => setOpenSections(s => ({...s, auto: open}))}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer bg-muted/50">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5" />
                      ✅ AUTO-APPROVED (No Review Needed)
                      <Badge variant="secondary">{autoApproved.length}</Badge>
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.auto ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {autoApproved.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(request.budgetedAmount)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Jump In
                    </Button>
                  </div>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Detail Panel */}
      <ApprovalDetailPanel
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={handleCloseDetails}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestInfo={() => setSelectedRequest(null)}
        isApproving={approvingId === selectedRequest?.id}
      />
    </div>
  );
}
