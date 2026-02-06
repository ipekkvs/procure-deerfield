import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { RenewalCard } from "@/components/RenewalCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  renewals, 
  formatCurrency,
  getCurrentUser
} from "@/lib/mockData";
import { 
  FileText, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const currentUser = getCurrentUser();
  
  // Calculate stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const needsInfoRequests = requests.filter(r => r.status === 'needs_info').length;
  
  // Calculate total spend in pending
  const pendingSpend = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
  
  // Get upcoming renewals (next 60 days)
  const upcomingRenewals = renewals
    .filter(r => r.reviewStatus !== 'completed')
    .slice(0, 3);
  
  // Get recent requests for the user
  const myRequests = requests
    .filter(r => r.requesterId === currentUser.id)
    .slice(0, 5);
  
  // Get pending approvals
  const pendingApprovals = requests
    .filter(r => r.status === 'pending')
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser.name.split(' ')[0]}
          </p>
        </div>
        <Link to="/new-request">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Requests"
          value={totalRequests}
          subtitle="All time"
          icon={FileText}
        />
        <StatsCard
          title="Pending Approval"
          value={pendingRequests}
          subtitle={`${formatCurrency(pendingSpend)} total value`}
          icon={Clock}
          trend={{ value: 12, positive: false }}
        />
        <StatsCard
          title="Approved This Month"
          value={approvedRequests}
          subtitle="7 new this week"
          icon={DollarSign}
          trend={{ value: 23, positive: true }}
        />
        <StatsCard
          title="Needs Attention"
          value={needsInfoRequests}
          subtitle="Awaiting response"
          icon={AlertTriangle}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Requests / Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals Section */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <Link to="/approvals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((request) => (
                  <RequestCard key={request.id} request={request} compact />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending approvals
                </p>
              )}
            </div>
          </div>

          {/* My Recent Requests */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Recent Requests</h2>
              <Link to="/new-request" className="text-sm text-primary hover:underline flex items-center gap-1">
                New request <Plus className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {myRequests.length > 0 ? (
                myRequests.map((request) => (
                  <RequestCard key={request.id} request={request} compact />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't submitted any requests yet
                  </p>
                  <Link to="/new-request">
                    <Button variant="outline" size="sm">
                      Create your first request
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Budget Widget */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Q1 Budget</h3>
            <div className="space-y-4">
              <BudgetWidget 
                label="Marketing" 
                spent={245000} 
                total={350000} 
              />
              <BudgetWidget 
                label="IT & Engineering" 
                spent={520000} 
                total={600000} 
              />
              <BudgetWidget 
                label="Operations" 
                spent={89000} 
                total={150000} 
              />
            </div>
          </div>

          {/* Upcoming Renewals */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming Renewals</h3>
              <Link to="/renewals" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingRenewals.map((renewal) => (
                <RenewalCard key={renewal.id} renewal={renewal} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
