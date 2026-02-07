import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  renewals,
  formatCurrency,
  departmentBudgets,
  departments
} from "@/lib/mockData";
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Eye,
  Plus,
  CalendarDays,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface FinanceDashboardProps {
  userName: string;
}

export function FinanceDashboard({ userName }: FinanceDashboardProps) {
  // Over-budget exceptions (mock detection)
  const overBudgetRequests = requests.filter(r => 
    r.status === 'pending' && r.budgetedAmount > 25000 // Mock over-budget threshold
  );
  
  // Material purchases (≥$10K)
  const materialPurchases = requests.filter(r => 
    r.status === 'pending' && r.budgetedAmount >= 10000
  );
  
  // Multi-year commitments (mock: services over $50K)
  const multiYearCommitments = requests.filter(r => 
    r.status === 'pending' && 
    r.category === 'services' && 
    r.budgetedAmount > 50000
  );
  
  // Auto-approved (under $10K and approved)
  const autoApproved = requests.filter(r => 
    r.status === 'approved' && r.budgetedAmount < 10000
  ).slice(0, 5);
  
  // Pending approvals for finance
  const pendingFinanceApprovals = requests.filter(r => 
    r.status === 'pending' && 
    (r.currentStep === 'finance_final_approval' || r.budgetedAmount >= 10000)
  );
  
  // Spend pipeline
  const approvedNotPurchased = requests.filter(r => 
    r.status === 'approved' && !r.contractId
  );
  const pendingApprovalAmount = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.budgetedAmount, 0);
  const renewalForecast = renewals
    .filter(r => r.daysUntilExpiration <= 90)
    .reduce((sum, r) => sum + r.amount, 0);
  
  // Stats
  const totalSpendThisMonth = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.negotiatedAmount || r.budgetedAmount), 0);
  const savingsAchieved = requests
    .filter(r => r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Budget oversight and approvals.
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
          title="Total Approved"
          value={formatCurrency(totalSpendThisMonth)}
          subtitle="This month"
          icon={DollarSign}
        />
        <StatsCard
          title="Savings Achieved"
          value={formatCurrency(savingsAchieved)}
          subtitle="From negotiations"
          icon={TrendingUp}
          trend={{ value: 15, positive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingFinanceApprovals.length}
          subtitle={formatCurrency(pendingApprovalAmount)}
          icon={Clock}
        />
        <StatsCard
          title="Renewal Forecast"
          value={formatCurrency(renewalForecast)}
          subtitle="Next 90 days"
          icon={CalendarDays}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                Requires Approval
                {pendingFinanceApprovals.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingFinanceApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="auto">Auto-Approved</TabsTrigger>
              <TabsTrigger value="pipeline">Spend Pipeline</TabsTrigger>
            </TabsList>

            {/* Requires My Approval */}
            <TabsContent value="pending" className="space-y-4">
              {/* Over-Budget Exceptions */}
              {overBudgetRequests.length > 0 && (
                <Card className="border-destructive/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Over-Budget Exceptions
                      <Badge variant="destructive" className="ml-2">
                        {overBudgetRequests.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overBudgetRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                              {request.title}
                            </Link>
                            <Badge variant="secondary">{request.department.replace('_', ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="text-destructive font-medium">
                              {formatCurrency(request.budgetedAmount)}
                            </span>
                            <span>•</span>
                            <span>Shortfall: {formatCurrency(request.budgetedAmount - 25000)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Contact Dept Head</Button>
                          <Button size="sm" variant="destructive">Reject</Button>
                          <Button size="sm">Approve Exception</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Material Purchases */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="w-5 h-5 text-primary" />
                    Material Purchases (≥$10K)
                    <Badge variant="outline" className="ml-2">
                      {materialPurchases.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {materialPurchases.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                            {request.title}
                          </Link>
                          <Badge variant="secondary">{request.department.replace('_', ' ')}</Badge>
                          <Badge variant={
                            departmentBudgets.find(b => b.department === request.department)?.spentToDate! / 
                            departmentBudgets.find(b => b.department === request.department)?.totalBudget! > 0.85 
                              ? 'destructive' : 'outline'
                          }>
                            {Math.round(
                              (departmentBudgets.find(b => b.department === request.department)?.spentToDate! / 
                              departmentBudgets.find(b => b.department === request.department)?.totalBudget!) * 100
                            )}% budget used
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{formatCurrency(request.budgetedAmount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/requests/${request.id}`}>
                          <Button variant="outline" size="sm">Review Details</Button>
                        </Link>
                        <Button size="sm">Quick Approve</Button>
                      </div>
                    </div>
                  ))}
                  {materialPurchases.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No material purchases pending
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Multi-Year Commitments */}
              {multiYearCommitments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarDays className="w-5 h-5 text-amber-600" />
                      Multi-Year Commitments
                      <Badge variant="outline" className="ml-2">
                        {multiYearCommitments.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {multiYearCommitments.map(request => (
                      <RequestCard key={request.id} request={request} compact />
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Auto-Approved */}
            <TabsContent value="auto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Auto-Approved This Week (FYI)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {autoApproved.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <RequestCard request={request} compact />
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Jump In
                      </Button>
                    </div>
                  ))}
                  {autoApproved.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No auto-approved requests this week
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spend Pipeline */}
            <TabsContent value="pipeline" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Approved, Not Purchased
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(approvedNotPurchased.reduce((sum, r) => sum + r.budgetedAmount, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {approvedNotPurchased.length} requests
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(pendingApprovalAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {requests.filter(r => r.status === 'pending').length} requests
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Renewal Forecast (90 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(renewalForecast)}</p>
                    <p className="text-sm text-muted-foreground">
                      {renewals.filter(r => r.daysUntilExpiration <= 90).length} renewals
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Budget Health */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentBudgets.map(budget => {
                const percentUsed = (budget.spentToDate / budget.totalBudget) * 100;
                const deptLabel = departments.find(d => d.value === budget.department)?.label || budget.department;
                
                return (
                  <div key={budget.department} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{deptLabel}</span>
                      <span className={percentUsed > 85 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {Math.round(percentUsed)}%
                      </span>
                    </div>
                    <Progress 
                      value={percentUsed} 
                      className={percentUsed > 85 ? '[&>div]:bg-destructive' : ''}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(budget.spentToDate)} spent</span>
                      <span>{formatCurrency(budget.remaining)} remaining</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
