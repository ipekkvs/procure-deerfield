import { useMemo } from "react";
import { StatsCard } from "@/components/StatsCard";
import { formatCurrency, requests, getCurrentUser, departments } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Users,
  TrendingUp,
  PieChart
} from "lucide-react";

export function ManagerReports() {
  const currentUser = getCurrentUser();
  const deptLabel = departments.find(d => d.value === currentUser.department)?.label || currentUser.department;
  
  // Filter requests by department
  const deptRequests = useMemo(() => 
    requests.filter(r => r.department === currentUser.department),
    [currentUser.department]
  );
  
  const stats = useMemo(() => {
    const thisMonth = deptRequests.filter(r => {
      const date = new Date(r.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const approved = deptRequests.filter(r => r.status === 'approved');
    const pending = deptRequests.filter(r => r.status === 'pending');
    const avgTime = approved.length > 0 
      ? Math.round(approved.reduce((sum, r) => sum + r.daysInCurrentStage, 0) / approved.length)
      : 0;
    
    const totalSpend = approved.reduce((sum, r) => sum + r.budgetedAmount, 0);
    
    // Group by requester
    const byRequester: Record<string, { count: number; spend: number }> = {};
    deptRequests.forEach(r => {
      if (!byRequester[r.requesterName]) {
        byRequester[r.requesterName] = { count: 0, spend: 0 };
      }
      byRequester[r.requesterName].count++;
      byRequester[r.requesterName].spend += r.budgetedAmount;
    });
    
    const topRequesters = Object.entries(byRequester)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Group by category
    const byCategory: Record<string, number> = {};
    deptRequests.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.budgetedAmount;
    });
    
    return {
      thisMonthCount: thisMonth.length,
      totalRequests: deptRequests.length,
      approved: approved.length,
      pending: pending.length,
      avgApprovalTime: avgTime,
      totalSpend,
      topRequesters,
      byCategory: Object.entries(byCategory).map(([category, spend]) => ({
        category,
        spend,
        percent: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
      })),
    };
  }, [deptRequests]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Department Reports - {deptLabel}</h1>
        <p className="text-muted-foreground mt-1">
          Procurement metrics for your department
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Requests This Month"
          value={stats.thisMonthCount}
          subtitle="Department submissions"
          icon={BarChart3}
        />
        <StatsCard
          title="Total Approved"
          value={stats.approved}
          subtitle="All time"
          icon={TrendingUp}
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pending}
          subtitle="Awaiting approval"
          icon={Clock}
        />
        <StatsCard
          title="Total Spend"
          value={formatCurrency(stats.totalSpend)}
          subtitle="Approved requests"
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Requesters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Requesters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topRequesters.map((requester, i) => (
                <div key={requester.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">#{i + 1}</span>
                    <span className="font-medium">{requester.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{requester.count} requests</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(requester.spend)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.topRequesters.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No requests yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spend by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Spend by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byCategory.map(cat => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{cat.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(cat.spend)} ({cat.percent.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={cat.percent} className="h-2" />
                </div>
              ))}
              {stats.byCategory.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No spend data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
