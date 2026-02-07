import { StatsCard } from "@/components/StatsCard";
import { 
  requests, 
  renewals,
  formatCurrency,
  departmentBudgets,
  departments,
  User
} from "@/lib/mockData";
import { 
  ClipboardCheck, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ManagerSummaryProps {
  userName: string;
  user: User;
}

export function ManagerSummary({ userName, user }: ManagerSummaryProps) {
  const userDepartment = user.department;
  const deptBudget = departmentBudgets.find(b => b.department === userDepartment);
  const deptLabel = departments.find(d => d.value === userDepartment)?.label || userDepartment;
  
  // Pending my approval
  const pendingMyApproval = requests.filter(r => 
    r.status === 'pending' && 
    r.department === userDepartment &&
    (r.currentStep === 'department_pre_approval' || r.currentStep === 'department_final_approval')
  );
  
  // Department stats
  const departmentRequests = requests.filter(r => r.department === userDepartment);
  const approvedRequests = departmentRequests.filter(r => r.status === 'approved');
  const avgCycleTime = 5.2;
  const totalSpend = approvedRequests.reduce((sum, r) => sum + (r.negotiatedAmount || r.budgetedAmount), 0);
  
  const budgetPercent = deptBudget 
    ? Math.round((deptBudget.spentToDate / deptBudget.totalBudget) * 100) 
    : 0;
  
  const departmentRenewals = renewals.filter(r => r.daysUntilExpiration <= 90).slice(0, 3);
  const recentRequests = departmentRequests.filter(r => r.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{deptLabel} Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Department oversight.
          </p>
        </div>
      </div>

      {/* Needs My Approval Alert */}
      {pendingMyApproval.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {pendingMyApproval.length} request{pendingMyApproval.length > 1 ? 's' : ''} waiting for your approval
                </p>
                <p className="text-sm text-muted-foreground">Review and approve to keep workflows moving</p>
              </div>
            </div>
            <Link to="/approvals">
              <Button className="gap-2">
                Go to Approvals <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Budget Status Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          {deptBudget && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatCurrency(deptBudget.totalBudget)}</span>
                <Badge variant={budgetPercent > 90 ? 'destructive' : budgetPercent > 75 ? 'secondary' : 'outline'}>
                  {budgetPercent}% used
                </Badge>
              </div>
              <Progress 
                value={budgetPercent} 
                className={budgetPercent > 90 ? '[&>div]:bg-destructive' : budgetPercent > 75 ? '[&>div]:bg-amber-500' : ''}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-medium">{formatCurrency(deptBudget.spentToDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-medium text-green-600">{formatCurrency(deptBudget.remaining)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Requests Submitted"
          value={departmentRequests.length}
          subtitle="Last 30 days"
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Approved"
          value={approvedRequests.length}
          subtitle="This period"
          icon={TrendingUp}
        />
        <StatsCard
          title="Avg. Cycle Time"
          value={`${avgCycleTime}d`}
          subtitle="Department average"
          icon={Clock}
        />
        <StatsCard
          title="Total Spend"
          value={formatCurrency(totalSpend)}
          subtitle="Approved"
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Requests</CardTitle>
              <Link to="/approvals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.length > 0 ? (
              recentRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.currentStep.replace(/_/g, ' ')} • {formatCurrency(request.budgetedAmount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No active requests</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
              <Link to="/renewals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View Renewals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentRenewals.length > 0 ? (
              departmentRenewals.map(renewal => (
                <div key={renewal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{renewal.vendorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {renewal.daysUntilExpiration} days • {formatCurrency(renewal.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No upcoming renewals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
