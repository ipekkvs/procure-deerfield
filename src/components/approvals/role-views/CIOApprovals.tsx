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
import { ChevronDown, DollarSign, Bot, Building2, Shield, Eye, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function CIOApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({ large: true, ai: true, portfolio: false, sensitive: false });

  // Large purchases >$50K
  const largePurchases: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => r.status === 'pending' && r.budgetedAmount > 50000 && !approvedIds.has(r.id))
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

  // AI/ML tools
  const aiMlTools: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !approvedIds.has(r.id) &&
        (r.title.toLowerCase().includes('ai') || r.description.toLowerCase().includes('machine learning'))
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

  // Portfolio integrations
  const portfolioIntegrations: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !approvedIds.has(r.id) &&
        r.department === 'investment'
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

  // Sensitive data access
  const sensitiveDataRequests: ApprovalRequest[] = useMemo(() => 
    requests
      .filter(r => 
        r.status === 'pending' && 
        !approvedIds.has(r.id) &&
        (r.description.toLowerCase().includes('patient') || r.description.toLowerCase().includes('hipaa'))
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

  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      toast({ title: "CIO Approved", description: "Strategic approval granted." });
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
      toast({ title: "CIO Approved", description: "Strategic approval granted." });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({ title: "Request Rejected", description: "CIO review declined.", variant: "destructive" });
  }, []);

  const totalPending = largePurchases.length + aiMlTools.length + portfolioIntegrations.length + sensitiveDataRequests.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CIO Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {totalPending} strategic items requiring your approval
        </p>
      </div>

      {totalPending === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {/* Large Purchases */}
          {largePurchases.length > 0 && (
            <Collapsible open={openSections.large} onOpenChange={(open) => setOpenSections(s => ({...s, large: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-amber-500/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                        <DollarSign className="w-5 h-5" />
                        💰 LARGE PURCHASES (&gt;$50K)
                        <Badge variant="secondary">{largePurchases.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.large ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {largePurchases.map(request => (
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

          {/* AI/ML Tools */}
          {aiMlTools.length > 0 && (
            <Collapsible open={openSections.ai} onOpenChange={(open) => setOpenSections(s => ({...s, ai: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-purple-500/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-600">
                        <Bot className="w-5 h-5" />
                        🤖 AI/ML TOOLS & APIs
                        <Badge variant="outline">{aiMlTools.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.ai ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {aiMlTools.map(request => (
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

          {/* Portfolio Integrations */}
          {portfolioIntegrations.length > 0 && (
            <Collapsible open={openSections.portfolio} onOpenChange={(open) => setOpenSections(s => ({...s, portfolio: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        🏢 PORTFOLIO COMPANY INTEGRATIONS
                        <Badge variant="outline">{portfolioIntegrations.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.portfolio ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {portfolioIntegrations.map(request => (
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

          {/* Sensitive Data */}
          {sensitiveDataRequests.length > 0 && (
            <Collapsible open={openSections.sensitive} onOpenChange={(open) => setOpenSections(s => ({...s, sensitive: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        🔒 SENSITIVE DATA ACCESS
                        <Badge variant="outline">{sensitiveDataRequests.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.sensitive ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {sensitiveDataRequests.map(request => (
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
        </div>
      )}

      {/* Portfolio View */}
      <Card className="mt-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              📊 PORTFOLIO VIEW
            </CardTitle>
            <Link to="/vendors">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                View All Purchases
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{formatCurrency(requests.reduce((s, r) => s + r.budgetedAmount, 0))}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
