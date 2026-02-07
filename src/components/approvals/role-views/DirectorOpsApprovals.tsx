import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { requests, formatCurrency, departments } from "@/lib/mockData";
import { 
  ApprovalCard, 
  ApprovalDetailPanel, 
  ApprovalFilters,
  EmptyState,
  type ApprovalRequest,
  type FilterType
} from "@/components/approvals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Handshake, AlertTriangle, BarChart3, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { SearchInput } from "@/components/ui/search-input";
import { NoSearchResults } from "@/components/search/NoSearchResults";
import { searchItems } from "@/hooks/useRoleBasedSearch";

export function DirectorOpsApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [openSections, setOpenSections] = useState({ negotiation: true, bottlenecks: true });
  const [searchTerm, setSearchTerm] = useState("");

  // All requests base
  const allRequestsBase = useMemo(() => 
    requests.map(r => ({
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
    })),
    []
  );

  // Apply search first
  const searchedRequests = useMemo(() => 
    searchItems(allRequestsBase, searchTerm, ['title', 'department', 'requesterName', 'status']),
    [allRequestsBase, searchTerm]
  );

  // Negotiation queue from searched
  const negotiationQueue = useMemo(() => 
    searchedRequests.filter(r => 
      r.status === 'pending' && 
      r.amount > 50000 && 
      r.currentStep === 'negotiation' &&
      !approvedIds.has(r.id)
    ),
    [searchedRequests, approvedIds]
  );

  // Bottlenecks from searched
  const bottlenecks = useMemo(() => 
    searchedRequests.filter(r => 
      r.status === 'pending' && 
      r.daysWaiting > 5 && 
      !approvedIds.has(r.id)
    ),
    [searchedRequests, approvedIds]
  );

  // All requests with additional filters
  const allRequests = useMemo(() => {
    return searchedRequests.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
      return true;
    });
  }, [searchedRequests, statusFilter, departmentFilter]);

  // Stats
  const avgCycleTime = 6.5;
  const savingsAchieved = requests
    .filter(r => r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);

  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovedIds(prev => new Set(prev).add(id));
      setApprovingId(null);
      toast({ title: "Approved", description: "Request approved successfully." });
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
      toast({ title: "Approved", description: "Request approved successfully." });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
    setSelectedRequest(null);
    toast({ title: "Rejected", description: "Request rejected.", variant: "destructive" });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Operations Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Complete procurement oversight
        </p>
      </div>

      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search all requests..."
        resultsCount={searchedRequests.length}
        totalCount={allRequestsBase.length}
        showResultsCount={searchTerm.length >= 2}
        syncToUrl={true}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Handshake className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{negotiationQueue.length}</p>
              <p className="text-sm text-muted-foreground">Negotiations</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{bottlenecks.length}</p>
              <p className="text-sm text-muted-foreground">Bottlenecks</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{avgCycleTime}d</p>
              <p className="text-sm text-muted-foreground">Avg Cycle</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(savingsAchieved)}</p>
              <p className="text-sm text-muted-foreground">Savings</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Negotiation Queue */}
        <Collapsible open={openSections.negotiation} onOpenChange={(open) => setOpenSections(s => ({...s, negotiation: open}))}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-primary" />
                    NEGOTIATION QUEUE (&gt;$50K)
                    <Badge variant="outline">{negotiationQueue.length}</Badge>
                  </CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.negotiation ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3 max-w-4xl">
            {negotiationQueue.map(request => (
              <ApprovalCard
                key={request.id}
                request={request}
                onQuickApprove={handleQuickApprove}
                onViewDetails={handleViewDetails}
                isApproving={approvingId === request.id}
              />
            ))}
            {negotiationQueue.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No negotiations pending</p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Bottlenecks */}
        {bottlenecks.length > 0 && (
          <Collapsible open={openSections.bottlenecks} onOpenChange={(open) => setOpenSections(s => ({...s, bottlenecks: open}))}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer border-destructive/50">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      BOTTLENECK ALERTS (Stuck &gt;5 days)
                      <Badge variant="destructive">{bottlenecks.length}</Badge>
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.bottlenecks ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3 max-w-4xl">
              {bottlenecks.map(request => (
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

      {/* All Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              ALL ACTIVE REQUESTS
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRequests.slice(0, 10).map(request => (
            <Card key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium truncate">{request.title}</p>
                    <Badge variant={
                      request.status === 'approved' ? 'default' : 
                      request.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.department?.replace(/_/g, ' ')} • {formatCurrency(request.amount)} • {request.currentStep?.replace(/_/g, ' ')}
                  </p>
                </div>
                <Link to={`/requests/${request.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </Card>
          ))}
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
