import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  formatCurrency,
  departmentBudgets,
  departments,
  User
} from "@/lib/mockData";
import { 
  ClipboardCheck, 
  Clock, 
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface DepartmentHeadDashboardProps {
  userName: string;
  user: User;
}

export function DepartmentHeadDashboard({ userName, user }: DepartmentHeadDashboardProps) {
  const userDepartment = user.department;
  
  // Get department budget
  const deptBudget = departmentBudgets.find(b => b.department === userDepartment);
  const deptLabel = departments.find(d => d.value === userDepartment)?.label || userDepartment;
  
  // Pending my approval (department pre-approval or final approval for price changes)
  const pendingMyApproval = requests.filter(r => 
    r.status === 'pending' && 
    r.department === userDepartment &&
    (r.currentStep === 'department_pre_approval' || r.currentStep === 'department_final_approval')
  );
  
  // My department's requests
  const departmentRequests = requests.filter(r => r.department === userDepartment);
  const pendingRequests = departmentRequests.filter(r => r.status === 'pending');
  const approvedRequests = departmentRequests.filter(r => r.status === 'approved');
  const rejectedRequests = departmentRequests.filter(r => r.status === 'rejected');
  
  // Team activity - group by requester
  const requestsByRequester = departmentRequests.reduce((acc, r) => {
    if (!acc[r.requesterName]) acc[r.requesterName] = [];
    acc[r.requesterName].push(r);
    return acc;
  }, {} as Record<string, typeof requests>);
  
  // Pending commitments
  const pendingCommitments = pendingRequests.reduce((sum, r) => sum + r.budgetedAmount, 0);
  
  // Budget burn rate (mock: assume linear over 12 months)
  const budgetBurnRate = deptBudget 
    ? Math.round((deptBudget.spentToDate / deptBudget.totalBudget) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{deptLabel} Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Department oversight and approvals.
          </p>
        </div>
        <Link to="/new-request">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Approval"
          value={pendingMyApproval.length}
          subtitle="Awaiting your review"
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Dept. Requests"
          value={departmentRequests.length}
          subtitle="Total this year"
          icon={Clock}
        />
        <StatsCard
          title="Budget Used"
          value={`${budgetBurnRate}%`}
          subtitle={deptBudget ? formatCurrency(deptBudget.remaining) + ' remaining' : ''}
          icon={DollarSign}
        />
        <StatsCard
          title="Team Members"
          value={Object.keys(requestsByRequester).length}
          subtitle="Active requesters"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                Pending Approval
                {pendingMyApproval.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingMyApproval.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Department Requests</TabsTrigger>
              <TabsTrigger value="team">Team Activity</TabsTrigger>
            </TabsList>

            {/* Pending My Approval */}
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Awaiting Your Approval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingMyApproval.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <RequestCard request={request} compact />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                  {pendingMyApproval.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No requests awaiting your approval
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Department Requests */}
            <TabsContent value="all" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Badge variant={pendingRequests.length > 0 ? 'default' : 'outline'}>
                  Pending: {pendingRequests.length}
                </Badge>
                <Badge variant="outline">
                  Approved: {approvedRequests.length}
                </Badge>
                <Badge variant="outline">
                  Rejected: {rejectedRequests.length}
                </Badge>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {departmentRequests.map(request => (
                    <RequestCard key={request.id} request={request} compact />
                  ))}
                  {departmentRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No requests from your department
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Activity */}
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Request Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(requestsByRequester).map(([name, reqs]) => (
                    <div key={name} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{name}</span>
                        <Badge variant="outline">{reqs.length} requests</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reqs.slice(0, 3).map(r => (
                          <Badge key={r.id} variant="secondary" className="text-xs">
                            {r.title.substring(0, 20)}...
                          </Badge>
                        ))}
                        {reqs.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{reqs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Budget */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deptBudget && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Annual Budget</span>
                      <span className="font-medium">{formatCurrency(deptBudget.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spent to Date</span>
                      <span>{formatCurrency(deptBudget.spentToDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(deptBudget.remaining)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Commitments</span>
                      <span className="text-amber-600">{formatCurrency(pendingCommitments)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Burn Rate</span>
                      <span className={budgetBurnRate > 85 ? 'text-destructive' : ''}>
                        {budgetBurnRate}%
                      </span>
                    </div>
                    <Progress 
                      value={budgetBurnRate} 
                      className={budgetBurnRate > 85 ? '[&>div]:bg-destructive' : ''}
                    />
                    {budgetBurnRate > 85 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        Budget running low
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Duplicate Tool Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Duplicate Tool Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No duplicate tool requests detected in your department.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
