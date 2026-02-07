import { StatsCard } from "@/components/StatsCard";
import { requests, renewals, formatCurrency } from "@/lib/mockData";
import { 
  Clock, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Handshake,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DirectorOpsSummaryProps {
  userName: string;
}

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
  const isOnTrack = avgCycleTime <= targetCycleTime;
  
  // Savings
  const negotiationSavings = requests
    .filter(r => r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);
  const licenseSavings = 12500; // Mock
  const totalSavings = negotiationSavings + licenseSavings;
  
  const renewalForecast = renewals
    .filter(r => r.daysUntilExpiration <= 90)
    .reduce((sum, r) => sum + r.amount, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Avg. Cycle Time"
          value={`${avgCycleTime}d`}
          subtitle={`Target: ${targetCycleTime}d`}
          icon={Clock}
          trend={{ value: isOnTrack ? 8 : -5, positive: isOnTrack }}
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
        <Card className="p-4 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{isOnTrack ? '✓ On Track' : '⚠️ Behind'}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Month Savings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">This Month Savings</CardTitle>
              <Link to="/reports" className="text-sm text-primary hover:underline flex items-center gap-1">
                View Report <ArrowRight className="w-3 h-3" />
              </Link>
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

        {/* Bottleneck Preview */}
        <Card className={bottlenecks.length > 0 ? 'border-destructive/30' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {bottlenecks.length > 0 && <AlertTriangle className="w-5 h-5 text-destructive" />}
                Bottlenecks
              </CardTitle>
              <Link to="/approvals" className="text-sm text-primary hover:underline flex items-center gap-1">
                Investigate <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bottlenecks.length > 0 ? (
              <div className="space-y-3">
                {bottlenecks.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Stuck at {request.currentStep.replace(/_/g, ' ')} • {request.daysInCurrentStage} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No bottlenecks detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewals */}
      <Card>
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
          <Link to="/renewals">
            <Button variant="outline" className="gap-2">
              View Pipeline <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
