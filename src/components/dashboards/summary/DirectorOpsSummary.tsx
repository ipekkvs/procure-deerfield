import { StatsCard } from "@/components/StatsCard";
import { requests, renewals, formatCurrency } from "@/lib/mockData";
import { 
  Clock, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Handshake,
  CheckCircle2,
  Timer,
  Hourglass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DirectorOpsSummaryProps {
  userName: string;
}

// Calculate average time spent at each stage
function getStageTimingAnalysis() {
  const stageData: Record<string, { total: number; count: number; sla: number }> = {
    'intake': { total: 0, count: 0, sla: 1 },
    'requirements': { total: 0, count: 0, sla: 2 },
    'department_pre_approval': { total: 0, count: 0, sla: 2 },
    'compliance_it_review': { total: 0, count: 0, sla: 3 },
    'negotiation': { total: 0, count: 0, sla: 5 },
    'finance_final_approval': { total: 0, count: 0, sla: 2 },
    'department_final_approval': { total: 0, count: 0, sla: 2 },
    'contracting': { total: 0, count: 0, sla: 2 },
  };

  // Analyze pending requests to see where they're spending time
  requests.forEach(r => {
    if (r.currentStep && stageData[r.currentStep]) {
      stageData[r.currentStep].total += r.daysInCurrentStage;
      stageData[r.currentStep].count += 1;
    }
  });

  // Calculate averages and find slowest stages
  const stageAnalysis = Object.entries(stageData)
    .filter(([_, data]) => data.count > 0)
    .map(([stage, data]) => ({
      stage,
      avgDays: data.count > 0 ? data.total / data.count : 0,
      sla: data.sla,
      count: data.count,
      overSla: data.count > 0 && (data.total / data.count) > data.sla,
      percentOfSla: data.count > 0 ? Math.round(((data.total / data.count) / data.sla) * 100) : 0,
    }))
    .sort((a, b) => b.avgDays - a.avgDays);

  return stageAnalysis;
}

const stageLabels: Record<string, string> = {
  'intake': 'Intake',
  'requirements': 'Requirements',
  'department_pre_approval': 'Dept. Pre-Approval',
  'compliance_it_review': 'Compliance/IT Review',
  'negotiation': 'Negotiation',
  'finance_final_approval': 'Finance Approval',
  'department_final_approval': 'Dept. Final Approval',
  'contracting': 'Contracting',
};

export function DirectorOpsSummary({ userName }: DirectorOpsSummaryProps) {
  // Negotiation queue
  const negotiationQueue = requests.filter(r => 
    r.status === 'pending' && r.budgetedAmount > 50000 && r.currentStep === 'negotiation'
  );
  
  // Bottlenecks
  const bottlenecks = requests.filter(r => r.status === 'pending' && r.daysInCurrentStage > 5);
  
  const totalNeedingAttention = negotiationQueue.length + bottlenecks.length;
  
  // Stats
  const avgCycleTime = 6.5;
  const targetCycleTime = 7;
  const activeRequests = requests.filter(r => r.status === 'pending').length;
  const completedThisMonth = requests.filter(r => r.status === 'approved').length;
  
  // Savings
  const negotiationSavings = requests
    .filter(r => r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);
  const licenseSavings = 12500; // Mock
  const totalSavings = negotiationSavings + licenseSavings;
  
  const renewalForecast = renewals
    .filter(r => r.daysUntilExpiration <= 90)
    .reduce((sum, r) => sum + r.amount, 0);

  // Stage timing analysis
  const stageAnalysis = getStageTimingAnalysis();
  const slowestStages = stageAnalysis.filter(s => s.avgDays > 0).slice(0, 4);
  const overSlaStages = stageAnalysis.filter(s => s.overSla);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Complete procurement oversight.
          </p>
        </div>
      </div>

      {/* Needs Attention Alert */}
      {totalNeedingAttention > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {totalNeedingAttention} items need attention
                </p>
              </div>
              <Link to="/approvals">
                <Button className="gap-2">
                  Go to Approvals <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {negotiationQueue.length > 0 && (
                <span>• {negotiationQueue.length} Negotiations pending (&gt;$50K)</span>
              )}
              {bottlenecks.length > 0 && (
                <span>• {bottlenecks.length} Bottlenecks (stuck &gt;5 days)</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Performance */}
      <Link to="/reports" className="block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 group">
          <StatsCard
            title="Avg. Cycle Time"
            value={`${avgCycleTime}d`}
            subtitle={`Target: ${targetCycleTime}d`}
            icon={Clock}
            trend={{ value: 8, positive: true }}
          />
          <StatsCard
            title="Active Requests"
            value={activeRequests}
            subtitle="In pipeline"
            icon={BarChart3}
          />
          <StatsCard
            title="Completed"
            value={completedThisMonth}
            subtitle="This month"
            icon={CheckCircle2}
          />
          <Card className="p-4 flex items-center gap-3 transition-colors group-hover:border-primary/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Throughput</p>
              <p className="font-semibold">{Math.round(completedThisMonth / 4)}/week</p>
            </div>
          </Card>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Month Savings */}
        <Link to="/reports" className="block">
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">This Month Savings</CardTitle>
                <span className="text-sm text-primary flex items-center gap-1">
                  View Report <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
                <p className="text-sm text-muted-foreground">Total savings achieved</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Negotiation Savings</p>
                  <p className="font-semibold">{formatCurrency(negotiationSavings)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">License Recovery</p>
                  <p className="font-semibold">{formatCurrency(licenseSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Stage Timing Analysis - Replaces simple bottleneck view */}
        <Link to="/reports" className="block">
          <Card className={`h-full transition-colors hover:border-primary/50 ${overSlaStages.length > 0 ? 'border-amber-500/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-muted-foreground" />
                  Stage Timing Analysis
                </CardTitle>
                <span className="text-sm text-primary flex items-center gap-1">
                  Full Report <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {slowestStages.length > 0 ? (
                <>
                  {overSlaStages.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {overSlaStages.length} stage{overSlaStages.length > 1 ? 's' : ''} exceeding SLA targets
                      </p>
                    </div>
                  )}
                  {slowestStages.map(stage => {
                    const isOverSla = stage.overSla;
                    const progressValue = Math.min(stage.percentOfSla, 150);
                    
                    return (
                      <div key={stage.stage} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            {isOverSla && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            {stageLabels[stage.stage] || stage.stage}
                          </span>
                          <span className={`text-xs ${isOverSla ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                            {stage.avgDays.toFixed(1)}d avg / {stage.sla}d SLA
                          </span>
                        </div>
                        <Progress 
                          value={progressValue} 
                          className={`h-2 ${isOverSla ? '[&>div]:bg-amber-500' : ''}`}
                        />
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground pt-2">
                    Based on {requests.filter(r => r.status === 'pending').length} active requests
                  </p>
                </>
              ) : (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">All stages within SLA</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stuck Requests - Only show if there are bottlenecks */}
      {bottlenecks.length > 0 && (
        <Link to="/approvals" className="block">
          <Card className="border-destructive/30 transition-colors hover:border-destructive/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Stuck Requests (&gt;5 days)
                </CardTitle>
                <span className="text-sm text-primary flex items-center gap-1">
                  Investigate <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottlenecks.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Stuck at {stageLabels[request.currentStep] || request.currentStep.replace(/_/g, ' ')} • {request.daysInCurrentStage} days
                      </p>
                    </div>
                  </div>
                ))}
                {bottlenecks.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{bottlenecks.length - 3} more stuck requests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Renewals */}
      <Link to="/renewals" className="block">
        <Card className="transition-colors hover:border-primary/50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Handshake className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">Upcoming Renewals</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(renewalForecast)} in the next 90 days
                </p>
              </div>
            </div>
            <span className="text-sm text-primary flex items-center gap-1">
              View Pipeline <ArrowRight className="w-4 h-4" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
