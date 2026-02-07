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
import { ChevronDown, Shield, Plug, Database, Settings2, CheckCircle2, Eye } from "lucide-react";
import { preApprovedVendors } from "@/lib/riskScoring";

export function ITApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({ newVendor: true, integration: true, dataAccess: false, useCase: false, auto: false });

  // New vendors needing security assessment
  const newVendors: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.itApproved && 
        !approvedIds.has(r.id) &&
        !r.vendorId &&
        !preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
      )
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: false,
        isNewVendor: true,
        urgency: 'critical' as const,
      })),
    [approvedIds]
  );

  // Integration requests
  const integrationRequests: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.itApproved && 
        !approvedIds.has(r.id) &&
        (r.description.toLowerCase().includes('api') || r.description.toLowerCase().includes('integration'))
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
    [approvedIds]
  );

  // Data access
  const dataAccessRequests: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.itApproved && 
        !approvedIds.has(r.id) &&
        (r.description.toLowerCase().includes('patient') || r.department === 'investment')
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
        urgency: 'high' as const,
      })),
    [approvedIds]
  );

  // Use case changes
  const useCaseChanges: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !r.itApproved && 
        !approvedIds.has(r.id) &&
        r.requestType === 'renewal'
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

  const autoApproved = requests.filter(r => 
    r.status === 'approved' && 
    preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
  ).slice(0, 5);

  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      toast({ title: "IT Review Complete", description: "Security assessment passed." });
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
      toast({ title: "IT Review Complete", description: "Security assessment passed." });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({ title: "Request Rejected", description: "IT security review failed.", variant: "destructive" });
  }, []);

  const totalPending = newVendors.length + integrationRequests.length + dataAccessRequests.length + useCaseChanges.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">IT Security Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {totalPending} items requiring your review
        </p>
      </div>

      {totalPending === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {/* New Vendors */}
          {newVendors.length > 0 && (
            <Collapsible open={openSections.newVendor} onOpenChange={(open) => setOpenSections(s => ({...s, newVendor: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-destructive/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <Shield className="w-5 h-5" />
                        🔴 NEW VENDORS - Security Assessment Needed
                        <Badge variant="destructive">{newVendors.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.newVendor ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {newVendors.map(request => (
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

          {/* Integrations */}
          {integrationRequests.length > 0 && (
            <Collapsible open={openSections.integration} onOpenChange={(open) => setOpenSections(s => ({...s, integration: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plug className="w-5 h-5 text-blue-600" />
                        🔌 INTEGRATIONS - API & System Access
                        <Badge variant="outline">{integrationRequests.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.integration ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {integrationRequests.map(request => (
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

          {/* Data Access */}
          {dataAccessRequests.length > 0 && (
            <Collapsible open={openSections.dataAccess} onOpenChange={(open) => setOpenSections(s => ({...s, dataAccess: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        📊 DATA ACCESS - Sensitive Information
                        <Badge variant="outline">{dataAccessRequests.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.dataAccess ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {dataAccessRequests.map(request => (
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
                        <Settings2 className="w-5 h-5 text-orange-600" />
                        ⚙️ USE CASE CHANGES
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
                      ✅ AUTO-APPROVED (Pre-Approved Vendors)
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
