import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  requests, 
  formatCurrency, 
  departmentBudgets,
  departments
} from "@/lib/mockData";
import { 
  ApprovalCard, 
  ApprovalDetailPanel,
  EmptyState,
  type ApprovalRequest 
} from "@/components/approvals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, DollarSign, CalendarDays, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { NoSearchResults } from "@/components/search/NoSearchResults";
import { searchItems } from "@/hooks/useRoleBasedSearch";

export function FinanceApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState({ overBudget: true, material: true, multiYear: false, auto: false });
  const [searchTerm, setSearchTerm] = useState("");

  // All pending requests for search baseline
  const allPendingRequests = useMemo(() => 
    requests
      .filter(r => r.status === 'pending' && !approvedIds.has(r.id))
      .map(r => ({
        id: r.id,
        title: r.title,
        department: r.department,
        amount: r.budgetedAmount,
        requesterName: r.requesterName,
        daysWaiting: r.daysInCurrentStage,
        isOverBudget: r.budgetedAmount > 25000,
        isNewVendor: !r.vendorId,
        urgency: r.urgency as 'low' | 'medium' | 'high' | 'critical',
        category: r.category,
      })),
    [approvedIds]
  );

  // Apply search
  const searchedRequests = useMemo(() => 
    searchItems(allPendingRequests, searchTerm, ['title', 'department', 'requesterName']),
    [allPendingRequests, searchTerm]
  );

  // Categorize searched requests
  const overBudgetRequests = searchedRequests.filter(r => r.amount > 25000);
  const materialPurchases = searchedRequests.filter(r => r.amount >= 10000 && r.amount <= 25000);
  const multiYearCommitments = searchedRequests.filter(r => r.category === 'services' && r.amount > 50000);

  const autoApproved = requests.filter(r => r.status === 'approved' && r.budgetedAmount < 10000).slice(0, 5);

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
      toast({ title: "Request Approved", description: "The request has been approved successfully." });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({ title: "Request Rejected", description: "The request has been rejected.", variant: "destructive" });
  }, []);

  const totalPending = searchedRequests.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finance Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {totalPending} items requiring your approval
        </p>
      </div>

      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search all procurement requests..."
        resultsCount={searchedRequests.length}
        totalCount={allPendingRequests.length}
        showResultsCount={searchTerm.length >= 2}
        syncToUrl={true}
      />

      {totalPending === 0 ? (
        searchTerm.length >= 2 ? (
          <NoSearchResults searchTerm={searchTerm} onClear={() => setSearchTerm("")} />
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="space-y-4 max-w-4xl">
          {/* Over-Budget Exceptions */}
          {overBudgetRequests.length > 0 && (
            <Collapsible open={openSections.overBudget} onOpenChange={(open) => setOpenSections(s => ({...s, overBudget: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-destructive/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        💰 OVER-BUDGET EXCEPTIONS
                        <Badge variant="destructive">{overBudgetRequests.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.overBudget ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {overBudgetRequests.map(request => (
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

          {/* Material Purchases */}
          {materialPurchases.length > 0 && (
            <Collapsible open={openSections.material} onOpenChange={(open) => setOpenSections(s => ({...s, material: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        💼 MATERIAL PURCHASES (≥$10K)
                        <Badge variant="outline">{materialPurchases.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.material ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {materialPurchases.map(request => (
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

          {/* Multi-Year Commitments */}
          {multiYearCommitments.length > 0 && (
            <Collapsible open={openSections.multiYear} onOpenChange={(open) => setOpenSections(s => ({...s, multiYear: open}))}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-amber-600" />
                        🔄 MULTI-YEAR COMMITMENTS
                        <Badge variant="outline">{multiYearCommitments.length}</Badge>
                      </CardTitle>
                      <ChevronDown className={`w-5 h-5 transition-transform ${openSections.multiYear ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {multiYearCommitments.map(request => (
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
                      ✅ AUTO-APPROVED THIS WEEK
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

      {/* Budget Dashboard */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Budget Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {departmentBudgets.slice(0, 4).map(budget => {
            const percentUsed = Math.round((budget.spentToDate / budget.totalBudget) * 100);
            const deptLabel = departments.find(d => d.value === budget.department)?.label || budget.department;
            
            return (
              <div key={budget.department} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{deptLabel}</span>
                  <span className={percentUsed > 85 ? 'text-destructive' : 'text-muted-foreground'}>
                    {percentUsed}% • {formatCurrency(budget.remaining)} left
                  </span>
                </div>
                <Progress value={percentUsed} className={percentUsed > 85 ? '[&>div]:bg-destructive' : ''} />
              </div>
            );
          })}
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
