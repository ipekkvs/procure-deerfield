import { StatsCard } from "@/components/StatsCard";
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
  ArrowRight,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FinanceSummaryProps {
  userName: string;
}

export function FinanceSummary({ userName }: FinanceSummaryProps) {
  // Categorize pending items
  const overBudgetRequests = requests.filter(r => 
    r.status === 'pending' && r.budgetedAmount > 25000
  );
  const materialPurchases = requests.filter(r => 
    r.status === 'pending' && r.budgetedAmount >= 10000
  );
  const multiYearCommitments = requests.filter(r => 
    r.status === 'pending' && r.category === 'services' && r.budgetedAmount > 50000
  );
  
  const totalNeedingApproval = overBudgetRequests.length + materialPurchases.length;
  
  // Stats
  const totalProcessed = requests.filter(r => r.status === 'approved' || r.status === 'rejected').length;
  const autoApproved = requests.filter(r => r.status === 'approved' && r.budgetedAmount < 10000).length;
  const spendPipeline = requests
    .filter(r => r.status === 'approved' && !r.contractId)
    .reduce((sum, r) => sum + r.budgetedAmount, 0);
  const renewalForecast = renewals
    .filter(r => r.daysUntilExpiration <= 90)
    .reduce((sum, r) => sum + r.amount, 0);
  
  // Budget health - departments over 85%
  const concernedDepartments = departmentBudgets.filter(b => 
    (b.spentToDate / b.totalBudget) > 0.85
  );

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
      </div>

      {/* Needs My Approval Alert */}
      {totalNeedingApproval > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {totalNeedingApproval} items need your approval
                </p>
              </div>
              <Link to="/approvals">
                <Button className="gap-2">
                  Go to Approvals <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {overBudgetRequests.length > 0 && (
                <span>• {overBudgetRequests.length} Over-budget exceptions</span>
              )}
              {materialPurchases.length > 0 && (
                <span>• {materialPurchases.length} Material purchases (≥$10K)</span>
              )}
              {multiYearCommitments.length > 0 && (
                <span>• {multiYearCommitments.length} Multi-year commitments</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Requests Processed"
          value={totalProcessed}
          subtitle="This month"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Auto-Approved"
          value={autoApproved}
          subtitle="Under $10K"
          icon={TrendingUp}
        />
        <StatsCard
          title="Spend Pipeline"
          value={formatCurrency(spendPipeline)}
          subtitle="Approved, not paid"
          icon={DollarSign}
        />
        <StatsCard
          title="Renewal Forecast"
          value={formatCurrency(renewalForecast)}
          subtitle="Next 90 days"
          icon={CalendarDays}
        />
      </div>

      {/* Budget Health */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Budget Health (All Departments)</CardTitle>
            <Link to="/reports" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All Budgets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {concernedDepartments.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {concernedDepartments.length} department{concernedDepartments.length > 1 ? 's' : ''} over 85% budget
              </p>
            </div>
          )}
          {departmentBudgets.slice(0, 5).map(budget => {
            const percentUsed = Math.round((budget.spentToDate / budget.totalBudget) * 100);
            const deptLabel = departments.find(d => d.value === budget.department)?.label || budget.department;
            const isWarning = percentUsed > 85;
            
            return (
              <div key={budget.department} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    {isWarning && <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {deptLabel}
                  </span>
                  <span className={isWarning ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    {percentUsed}% • {formatCurrency(budget.remaining)} left
                  </span>
                </div>
                <Progress 
                  value={percentUsed} 
                  className={isWarning ? '[&>div]:bg-destructive' : ''}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Link to Renewals */}
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">Upcoming Renewals</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(renewalForecast)} in the next 90 days
              </p>
            </div>
          </div>
          <Link to="/renewals">
            <Button variant="outline" className="gap-2">
              View Calendar <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
