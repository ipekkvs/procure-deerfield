import { useState } from "react";
import { RequestCard } from "@/components/RequestCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  formatCurrency, 
  getStepLabel,
  getDepartmentLabel,
  getDepartmentBudget,
  ApprovalStep
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter,
  ArrowUpDown,
  Shield,
  Monitor,
  DollarSign,
  Briefcase,
  FileText,
  Building2,
  AlertTriangle,
  TrendingDown,
  Users,
  RefreshCcw,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ApprovalView = 'all' | 'department' | 'compliance' | 'it' | 'negotiation' | 'finance' | 'overbudget' | 'multiyear' | 'contracting';

// Mock over-budget requests for demonstration
const overBudgetRequests = [
  {
    id: 'OB-001',
    title: 'Advanced Analytics Platform',
    requesterName: 'Alex Johnson',
    department: 'deerfield_intelligence' as const,
    budgetedAmount: 85000,
    shortfall: 25000,
    justification: 'Critical for Q4 reporting cycle. Budget overrun due to unexpected compliance tools earlier this quarter. This platform will improve our portfolio analysis capabilities by 40% and is essential for the upcoming investor meeting.',
    urgency: 'high' as const,
    daysInQueue: 2,
    budgetSpentPercentage: 115,
  },
  {
    id: 'OB-002',
    title: 'Security Audit Services',
    requesterName: 'Emily Brown',
    department: 'business_operations' as const,
    budgetedAmount: 55000,
    shortfall: 15000,
    justification: 'Annual SOC 2 compliance audit is mandatory and cannot be deferred. Previous vendor became unavailable, requiring engagement with new firm at higher cost. Failure to complete audit will impact client contracts.',
    urgency: 'critical' as const,
    daysInQueue: 1,
    budgetSpentPercentage: 108,
  },
];

// Mock multi-year commitment requests
const multiYearRequests: Array<{
  id: string;
  title: string;
  requesterName: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  annualCost: number;
  contractYears: number;
  totalCommitment: number;
  isLowAnnual: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  daysInQueue: number;
}> = [
  {
    id: 'MY-001',
    title: 'CRM System',
    requesterName: 'Alex Johnson',
    department: 'investment',
    annualCost: 8000,
    contractYears: 3,
    totalCommitment: 24000,
    isLowAnnual: true,
    urgency: 'medium',
    daysInQueue: 1,
  },
  {
    id: 'MY-002',
    title: 'Document Management System',
    requesterName: 'Mike Wilson',
    department: 'business_operations',
    annualCost: 15000,
    contractYears: 2,
    totalCommitment: 30000,
    isLowAnnual: false,
    urgency: 'high',
    daysInQueue: 3,
  },
  {
    id: 'MY-003',
    title: 'Team Collaboration Tool',
    requesterName: 'Emily Brown',
    department: 'deerfield_intelligence',
    annualCost: 6500,
    contractYears: 4,
    totalCommitment: 26000,
    isLowAnnual: true,
    urgency: 'critical',
    daysInQueue: 2,
  },
];

const Approvals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("urgency");
  const [currentView, setCurrentView] = useState<ApprovalView>("all");

  // Get pending requests (for approval queue)
  const pendingRequests = requests.filter(r => 
    r.status === 'pending' || r.status === 'needs_info'
  );

  // Filter by approval step/role view
  const getRequestsForView = (view: ApprovalView) => {
    switch (view) {
      case 'department':
        return pendingRequests.filter(r => 
          r.currentStep === 'department_pre_approval' || 
          r.currentStep === 'department_final_approval'
        );
      case 'compliance':
        return pendingRequests.filter(r => 
          r.currentStep === 'compliance_it_review' && 
          r.requestType === 'new_purchase'
        );
      case 'it':
        return pendingRequests.filter(r => 
          r.currentStep === 'compliance_it_review' && 
          r.requestType === 'new_purchase'
        );
      case 'negotiation':
        return pendingRequests.filter(r => 
          r.currentStep === 'negotiation' && 
          r.budgetedAmount > 25000
        );
      case 'finance':
        return pendingRequests.filter(r => 
          r.currentStep === 'finance_final_approval'
        );
      case 'overbudget':
        return []; // Handled separately with overBudgetRequests
      case 'multiyear':
        return []; // Handled separately with multiYearRequests
      case 'contracting':
        return pendingRequests.filter(r => 
          r.currentStep === 'contracting'
        );
      default:
        return pendingRequests;
    }
  };

  const viewRequests = getRequestsForView(currentView);

  // Filter and sort
  const filteredRequests = viewRequests
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'amount-high':
          return b.budgetedAmount - a.budgetedAmount;
        case 'amount-low':
          return a.budgetedAmount - b.budgetedAmount;
        case 'days':
          return b.daysInCurrentStage - a.daysInCurrentStage;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalPendingAmount = pendingRequests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.budgetedAmount, 0);

  const avgDaysInQueue = Math.round(
    pendingRequests.reduce((sum, r) => sum + r.daysInCurrentStage, 0) / 
    (pendingRequests.length || 1)
  );

  // Calculate total savings
  const totalSavings = requests
    .filter(r => r.priceChanged && r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);

  const viewTabs: { value: ApprovalView; label: string; icon: React.ElementType; count: number; highlight?: boolean }[] = [
    { value: 'all', label: 'All', icon: Filter, count: pendingRequests.length },
    { value: 'department', label: 'Dept. Approval', icon: Building2, count: getRequestsForView('department').length },
    { value: 'compliance', label: 'Compliance', icon: Shield, count: getRequestsForView('compliance').length },
    { value: 'it', label: 'IT Review', icon: Monitor, count: getRequestsForView('it').length },
    { value: 'negotiation', label: 'Negotiation', icon: Briefcase, count: getRequestsForView('negotiation').length },
    { value: 'finance', label: 'Finance', icon: DollarSign, count: getRequestsForView('finance').length },
    { value: 'overbudget', label: 'Over-Budget', icon: AlertTriangle, count: overBudgetRequests.length, highlight: true },
    { value: 'multiyear', label: 'Multi-Year', icon: RefreshCcw, count: multiYearRequests.length, highlight: multiYearRequests.some(r => r.isLowAnnual) },
    { value: 'contracting', label: 'Contracting', icon: FileText, count: getRequestsForView('contracting').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Approval Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve purchase requests based on your role
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold mt-1">
            {pendingRequests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Needs Information</p>
          <p className="text-2xl font-bold mt-1">
            {pendingRequests.filter(r => r.status === 'needs_info').length}
          </p>
        </div>
        <div className={cn(
          "rounded-xl border p-4",
          overBudgetRequests.length > 0 ? "bg-status-error-bg border-status-error/30" : "bg-card"
        )}>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Over-Budget Exceptions
          </p>
          <p className={cn(
            "text-2xl font-bold mt-1",
            overBudgetRequests.length > 0 && "text-status-error"
          )}>
            {overBudgetRequests.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPendingAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg. Days in Queue</p>
          <p className="text-2xl font-bold mt-1">{avgDaysInQueue || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">YTD Savings</p>
          <p className="text-2xl font-bold text-status-success mt-1">{formatCurrency(totalSavings)}</p>
        </div>
      </div>

      {/* Role-based Tabs */}
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ApprovalView)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {viewTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className={cn(
                "gap-2",
                tab.highlight && tab.count > 0 && "text-status-error data-[state=active]:text-status-error"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                  tab.highlight && tab.count > 0 
                    ? "bg-status-error/20 text-status-error" 
                    : "bg-muted"
                )}>
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {/* Over-Budget Exceptions View */}
          {currentView === 'overbudget' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-error-bg border border-status-error/30 flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-status-error mt-0.5" />
                <div>
                  <p className="font-semibold text-status-error">Over-Budget Exceptions Requiring Finance Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These requests exceed department budgets and require exception approval. 
                    Review with Department Head before approving.
                  </p>
                </div>
              </div>

              {overBudgetRequests.length > 0 ? (
                <div className="space-y-4">
                  {overBudgetRequests.map((request) => {
                    const budget = getDepartmentBudget(request.department);
                    return (
                      <div key={request.id} className="rounded-xl border border-status-error/30 bg-card overflow-hidden">
                        {/* Header */}
                        <div className="p-4 bg-status-error-bg border-b border-status-error/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-status-error" />
                                <span className="text-xs font-medium text-status-error uppercase">Over-Budget Exception</span>
                              </div>
                              <h3 className="text-lg font-semibold mt-1">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Requested by {request.requesterName} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} ago
                              </p>
                            </div>
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                              request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                            </span>
                          </div>
                        </div>

                        {/* Budget Details */}
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-muted-foreground">Department</span>
                              <p className="font-medium">{getDepartmentLabel(request.department)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Amount Requested</span>
                              <p className="font-semibold">{formatCurrency(request.budgetedAmount)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Budget Shortfall</span>
                              <p className="font-semibold text-status-error">-{formatCurrency(request.shortfall)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Budget Status</span>
                              <p className="font-semibold text-status-error">{request.budgetSpentPercentage}% spent</p>
                            </div>
                          </div>

                          {/* Department Budget Summary */}
                          {budget && (
                            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                              <p className="text-sm font-medium">Department Budget Status</p>
                              <div className="grid grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground">Annual Budget</span>
                                  <p className="font-medium">{formatCurrency(budget.totalBudget)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Spent to Date</span>
                                  <p className="font-medium">{formatCurrency(budget.spentToDate)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Remaining</span>
                                  <p className="font-medium text-status-success">{formatCurrency(budget.remaining)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">After Approval</span>
                                  <p className="font-medium text-status-error">{formatCurrency(budget.remaining - request.budgetedAmount)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Requester Justification */}
                          <div className="p-3 rounded-lg bg-muted/30 border">
                            <p className="text-sm font-medium mb-2">Requester Justification</p>
                            <p className="text-sm text-muted-foreground">{request.justification}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <Button variant="outline" className="gap-2">
                              <Users className="w-4 h-4" />
                              Contact Dept Head
                            </Button>
                            <Button variant="default" className="gap-2 bg-status-success hover:bg-status-success/90">
                              Approve Exception
                            </Button>
                            <Button variant="outline" className="gap-2">
                              <RefreshCcw className="w-4 h-4" />
                              Request Reallocation
                            </Button>
                            <Button variant="outline" className="gap-2 text-status-error hover:text-status-error">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No over-budget exceptions pending review
                </div>
              )}
            </div>
          ) : currentView === 'multiyear' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-warning-bg border border-status-warning/30 flex items-start gap-3">
                <RefreshCcw className="w-5 h-5 text-status-warning mt-0.5" />
                <div>
                  <p className="font-semibold text-status-warning">🔄 Multi-Year Commitments Requiring Finance Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These requests involve multi-year contract terms and require Finance approval regardless of annual cost.
                  </p>
                </div>
              </div>

              {multiYearRequests.length > 0 ? (
                <div className="space-y-4">
                  {multiYearRequests.map((request) => (
                    <div key={request.id} className={cn(
                      "rounded-xl border bg-card overflow-hidden",
                      request.isLowAnnual ? "border-status-warning/50" : "border-border"
                    )}>
                      {/* Header */}
                      <div className={cn(
                        "p-4 border-b",
                        request.isLowAnnual ? "bg-status-warning-bg border-status-warning/20" : "bg-muted/30"
                      )}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <RefreshCcw className="w-4 h-4 text-status-warning" />
                              <span className="text-xs font-medium text-status-warning uppercase">
                                {request.contractYears}-Year Commitment
                              </span>
                              {request.isLowAnnual && (
                                <span className="text-xs bg-status-warning/20 text-status-warning px-2 py-0.5 rounded-full">
                                  Annual &lt;$10K
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mt-1">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {request.requesterName} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} ago
                            </p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                            request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Department</span>
                            <p className="font-medium">{getDepartmentLabel(request.department)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Annual Cost</span>
                            <p className="font-semibold">{formatCurrency(request.annualCost)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Contract Term</span>
                            <p className="font-semibold">{request.contractYears} years</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">TOTAL COMMITMENT</span>
                            <p className="font-bold text-lg text-status-warning">{formatCurrency(request.totalCommitment)}</p>
                          </div>
                        </div>

                        {/* Special Note for Low Annual */}
                        {request.isLowAnnual && (
                          <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-sm">
                            <p className="text-muted-foreground">
                              <strong className="text-status-warning">⚠️ Low annual but multi-year:</strong> {formatCurrency(request.annualCost)}/year × {request.contractYears} years = {formatCurrency(request.totalCommitment)} total commitment.
                              Requires Finance review due to multi-year term even though annual cost is under $10K.
                            </p>
                          </div>
                        )}

                        {/* Commitment Breakdown */}
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-sm font-medium mb-2">Commitment Breakdown</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatCurrency(request.annualCost)}</span>
                            <span>×</span>
                            <span>{request.contractYears} years</span>
                            <span>=</span>
                            <span className="font-bold text-foreground">{formatCurrency(request.totalCommitment)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button variant="outline" className="gap-2">
                            <Users className="w-4 h-4" />
                            Contact Dept Head
                          </Button>
                          <Button variant="default" className="gap-2 bg-status-success hover:bg-status-success/90">
                            Approve Commitment
                          </Button>
                          <Button variant="outline" className="gap-2">
                            Request Shorter Term
                          </Button>
                          <Button variant="outline" className="gap-2 text-status-error hover:text-status-error">
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No multi-year commitments pending review
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request list */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="needs_info">Needs Info</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgency">Urgency</SelectItem>
                      <SelectItem value="amount-high">Amount (High)</SelectItem>
                      <SelectItem value="amount-low">Amount (Low)</SelectItem>
                      <SelectItem value="days">Days Waiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Context message for filtered views */}
                {currentView !== 'all' && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {currentView === 'compliance' && (
                      <>Showing new purchase requests requiring compliance review. Renewals skip this step.</>
                    )}
                    {currentView === 'it' && (
                      <>Showing new purchase requests requiring IT review. Renewals skip this step.</>
                    )}
                    {currentView === 'negotiation' && (
                      <>Showing requests over $25,000 requiring Director of Operations negotiation review.</>
                    )}
                    {currentView === 'department' && (
                      <>Showing requests pending department pre-approval or re-approval after negotiation.</>
                    )}
                    {currentView === 'finance' && (
                      <>Showing requests pending final finance approval.</>
                    )}
                    {currentView === 'contracting' && (
                      <>Showing approved requests awaiting contract signature.</>
                    )}
                  </div>
                )}

                {/* Request cards */}
                <div className="space-y-3">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <div key={request.id} className="relative">
                        <RequestCard request={request} />
                        <div className="absolute top-3 right-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">
                            {getStepLabel(request.currentStep)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {currentView === 'all' 
                        ? "No requests match your filters"
                        : `No requests pending ${viewTabs.find(t => t.value === currentView)?.label.toLowerCase()}`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Over-Budget Alert */}
                {overBudgetRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-error/30 bg-status-error-bg p-4 cursor-pointer hover:bg-status-error/10 transition-colors"
                    onClick={() => setCurrentView('overbudget')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-error/20">
                        <AlertTriangle className="w-5 h-5 text-status-error" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-error">
                          💰 {overBudgetRequests.length} Over-Budget Exception{overBudgetRequests.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total shortfall: {formatCurrency(overBudgetRequests.reduce((sum, r) => sum + r.shortfall, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Year Commitments Alert */}
                {multiYearRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-4 cursor-pointer hover:bg-status-warning/10 transition-colors"
                    onClick={() => setCurrentView('multiyear')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-warning/20">
                        <RefreshCcw className="w-5 h-5 text-status-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-warning">
                          🔄 {multiYearRequests.length} Multi-Year Commitment{multiYearRequests.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(multiYearRequests.reduce((sum, r) => sum + r.totalCommitment, 0))}
                          {multiYearRequests.some(r => r.isLowAnnual) && (
                            <span className="ml-1 text-status-warning">
                              • {multiYearRequests.filter(r => r.isLowAnnual).length} with annual &lt;$10K
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spend Pipeline */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Spend Pipeline</h3>
                  <div className="space-y-4">
                    <BudgetWidget 
                      label="Q1 Approved" 
                      spent={412000} 
                      total={800000} 
                    />
                    <BudgetWidget 
                      label="Q1 Pipeline" 
                      spent={totalPendingAmount} 
                      total={800000 - 412000} 
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>YTD Savings</span>
                      <span className="font-semibold text-status-success">{formatCurrency(totalSavings)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats by Step */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">By Approval Step</h3>
                  <div className="space-y-3">
                    {viewTabs.slice(1).map((tab) => (
                      <div 
                        key={tab.value} 
                        className={cn(
                          "flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded",
                          tab.highlight && tab.count > 0 && "text-status-error"
                        )}
                        onClick={() => setCurrentView(tab.value)}
                      >
                        <span className="flex items-center gap-2">
                          <tab.icon className="w-4 h-4 text-muted-foreground" />
                          {tab.label}
                        </span>
                        <span className="font-semibold">{tab.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats by Category */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">By Category</h3>
                  <div className="space-y-3">
                    {['saas', 'hardware', 'services'].map((cat) => {
                      const catRequests = pendingRequests.filter(r => r.category === cat);
                      const catAmount = catRequests.reduce((sum, r) => sum + r.budgetedAmount, 0);
                      return (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{cat}</span>
                          <div className="text-right">
                            <span className="font-semibold">{catRequests.length}</span>
                            <span className="text-muted-foreground ml-2">
                              ({formatCurrency(catAmount)})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Approvals;
