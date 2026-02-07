import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mockData";
import { Bell, Check } from "lucide-react";
import {
  ApprovalCard,
  ApprovalDetailPanel,
  ApprovalFilters,
  ApprovalGroup,
  EmptyState,
  SkeletonList,
  type ApprovalRequest,
  type FilterType,
} from "@/components/approvals";

// Sample data for demonstration
const sampleRequests: ApprovalRequest[] = [
  {
    id: "REQ-001",
    title: "Enterprise Analytics Platform",
    department: "deerfield_intelligence",
    amount: 75000,
    requesterName: "Alex Johnson",
    daysWaiting: 5,
    isOverBudget: true,
    isNewVendor: true,
    urgency: "critical",
  },
  {
    id: "REQ-002",
    title: "OpenAI API Integration",
    department: "investment",
    amount: 35000,
    requesterName: "Mike Wilson",
    daysWaiting: 4,
    isOverBudget: false,
    isNewVendor: true,
    urgency: "high",
  },
  {
    id: "REQ-003",
    title: "Patient Data Management System",
    department: "3dc",
    amount: 42000,
    requesterName: "Emily Brown",
    daysWaiting: 1,
    isOverBudget: false,
    isNewVendor: false,
    urgency: "medium",
  },
  {
    id: "REQ-004",
    title: "Salesforce Renewal",
    department: "business_operations",
    amount: 65000,
    requesterName: "Sarah Chen",
    daysWaiting: 2,
    isOverBudget: false,
    isNewVendor: false,
    urgency: "medium",
  },
  {
    id: "REQ-005",
    title: "Security Audit Services",
    department: "external_operations",
    amount: 55000,
    requesterName: "David Lee",
    daysWaiting: 1,
    isOverBudget: true,
    isNewVendor: true,
    urgency: "high",
  },
  {
    id: "REQ-006",
    title: "Team Collaboration Tool",
    department: "investment",
    amount: 8500,
    requesterName: "Lisa Park",
    daysWaiting: 1,
    isOverBudget: false,
    isNewVendor: false,
    urgency: "low",
  },
  {
    id: "REQ-007",
    title: "Cloud Storage Expansion",
    department: "deerfield_intelligence",
    amount: 12000,
    requesterName: "Tom Harris",
    daysWaiting: 2,
    isOverBudget: false,
    isNewVendor: false,
    urgency: "medium",
  },
];

const Approvals = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>(sampleRequests);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [isLoading] = useState(false);

  // Filter requests
  const filteredRequests = useMemo(() => {
    switch (activeFilter) {
      case "over-budget":
        return requests.filter((r) => r.isOverBudget);
      case "high-value":
        return requests.filter((r) => r.amount > 50000);
      case "new-vendors":
        return requests.filter((r) => r.isNewVendor);
      default:
        return requests;
    }
  }, [requests, activeFilter]);

  // Group requests by urgency
  const urgentRequests = useMemo(
    () => filteredRequests.filter((r) => r.isOverBudget || r.daysWaiting > 3),
    [filteredRequests]
  );

  const standardRequests = useMemo(
    () => filteredRequests.filter((r) => !r.isOverBudget && r.daysWaiting <= 3),
    [filteredRequests]
  );

  // Filter counts
  const counts = useMemo(() => ({
    all: requests.length,
    overBudget: requests.filter((r) => r.isOverBudget).length,
    highValue: requests.filter((r) => r.amount > 50000).length,
    newVendors: requests.filter((r) => r.isNewVendor).length,
  }), [requests]);

  // Calculate totals
  const totalPendingAmount = useMemo(
    () => requests.reduce((sum, r) => sum + r.amount, 0),
    [requests]
  );

  // Handlers
  const handleQuickApprove = useCallback((id: string) => {
    setApprovingId(id);
    
    // Simulate API call
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
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
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setApprovingId(null);
      setSelectedRequest(null);
      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
      });
    }, 800);
  }, []);

  const handleReject = useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
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

  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRequests.map((r) => r.id)));
    }
  }, [filteredRequests, selectedIds.size]);

  const handleBatchApprove = useCallback(() => {
    const eligibleIds = Array.from(selectedIds).filter((id) => {
      const request = requests.find((r) => r.id === id);
      return request && request.amount < 10000 && !request.isOverBudget;
    });

    if (eligibleIds.length === 0) {
      toast({
        title: "Cannot Batch Approve",
        description: "Selected requests must be under $10K and within budget.",
        variant: "destructive",
      });
      return;
    }

    setRequests((prev) => prev.filter((r) => !eligibleIds.includes(r.id)));
    setSelectedIds(new Set());
    toast({
      title: `${eligibleIds.length} Requests Approved`,
      description: "Batch approval completed successfully.",
    });
  }, [selectedIds, requests]);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approvals</h1>
          <p className="text-muted-foreground mt-1">
            {requests.length} pending • {formatCurrency(totalPendingAmount)} total value
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ApprovalFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCheckbox(!showCheckbox)}
            className="text-muted-foreground"
          >
            {showCheckbox ? "Cancel Selection" : "Select Multiple"}
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {showCheckbox && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {selectedIds.size === filteredRequests.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <Button size="sm" onClick={handleBatchApprove} className="gap-1.5 ml-auto">
            <Check className="w-3.5 h-3.5" />
            Approve Selected ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <SkeletonList />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Urgent Group */}
          <ApprovalGroup
            title="Urgent"
            icon="urgent"
            requests={urgentRequests}
            defaultOpen={true}
            onQuickApprove={handleQuickApprove}
            onViewDetails={handleViewDetails}
            approvingId={approvingId}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            showCheckbox={showCheckbox}
          />

          {/* Standard Group */}
          <ApprovalGroup
            title="Standard"
            icon="standard"
            requests={standardRequests}
            defaultOpen={urgentRequests.length === 0}
            onQuickApprove={handleQuickApprove}
            onViewDetails={handleViewDetails}
            approvingId={approvingId}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            showCheckbox={showCheckbox}
          />
        </div>
      )}

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
};

export default Approvals;
