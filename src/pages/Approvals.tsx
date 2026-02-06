import { useState } from "react";
import { RequestCard } from "@/components/RequestCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  formatCurrency, 
  getStepLabel,
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
  Building2
} from "lucide-react";

type ApprovalView = 'all' | 'department' | 'compliance' | 'it' | 'negotiation' | 'finance' | 'contracting';

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

  const viewTabs: { value: ApprovalView; label: string; icon: React.ElementType; count: number }[] = [
    { value: 'all', label: 'All', icon: Filter, count: pendingRequests.length },
    { value: 'department', label: 'Dept. Approval', icon: Building2, count: getRequestsForView('department').length },
    { value: 'compliance', label: 'Compliance', icon: Shield, count: getRequestsForView('compliance').length },
    { value: 'it', label: 'IT Review', icon: Monitor, count: getRequestsForView('it').length },
    { value: 'negotiation', label: 'Negotiation', icon: Briefcase, count: getRequestsForView('negotiation').length },
    { value: 'finance', label: 'Finance', icon: DollarSign, count: getRequestsForView('finance').length },
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
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
                    <div key={tab.value} className="flex items-center justify-between text-sm">
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
        </div>
      </Tabs>
    </div>
  );
};

export default Approvals;
