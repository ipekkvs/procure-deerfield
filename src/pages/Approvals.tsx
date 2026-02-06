import { useState } from "react";
import { RequestCard } from "@/components/RequestCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  formatCurrency, 
  getStatusColor, 
  getStatusLabel,
  PurchaseRequest,
  RequestStatus
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
import { 
  Search, 
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";

const Approvals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("urgency");

  // Get pending requests (for approval queue)
  const pendingRequests = requests.filter(r => 
    r.status === 'pending' || r.status === 'needs_info'
  );

  // Filter and sort
  const filteredRequests = pendingRequests
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
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        case 'days':
          return b.daysInCurrentStage - a.daysInCurrentStage;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalPendingAmount = pendingRequests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const avgDaysInQueue = Math.round(
    pendingRequests.reduce((sum, r) => sum + r.daysInCurrentStage, 0) / 
    pendingRequests.length
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Approval Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve purchase requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

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

          {/* Request cards */}
          <div className="space-y-3">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No requests match your filters
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
                <span className="font-semibold text-status-success">$127,500</span>
              </div>
            </div>
          </div>

          {/* Quick Stats by Category */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">By Category</h3>
            <div className="space-y-3">
              {['saas', 'hardware', 'services'].map((cat) => {
                const catRequests = pendingRequests.filter(r => r.category === cat);
                const catAmount = catRequests.reduce((sum, r) => sum + r.amount, 0);
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
  );
};

export default Approvals;
