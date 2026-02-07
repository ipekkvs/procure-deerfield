import { getCurrentUser } from "@/lib/mockData";
import { StatsCard } from "@/components/StatsCard";
import { 
  formatCurrency 
} from "@/lib/mockData";
import {
  getCycleTimeByTier,
  getApprovalBottlenecks,
  getDepartmentBudgetStatuses,
  getSavingsMetrics,
  getRequestVolumeByDepartment,
  getRequestTypeBreakdown,
  getPreApprovedVendorUsage,
  getRenewalCompliance,
  getProcurementSummary,
} from "@/lib/analytics";
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Building2,
  RefreshCw,
  CheckCircle2,
  Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  NoReportsAccess, 
  ManagerReports, 
  ComplianceReports, 
  ITReports 
} from "@/components/reports";

// Full reports for Finance, CIO, and Director of Operations
function FullReports() {
  const summary = getProcurementSummary();
  const cycleTime = getCycleTimeByTier();
  const bottlenecks = getApprovalBottlenecks();
  const budgetStatuses = getDepartmentBudgetStatuses();
  const savings = getSavingsMetrics();
  const volumeByDept = getRequestVolumeByDepartment();
  const typeBreakdown = getRequestTypeBreakdown();
  const vendorUsage = getPreApprovedVendorUsage();
  const renewalCompliance = getRenewalCompliance();
  const currentUser = getCurrentUser();
  
  // Customize title based on role
  const getTitle = () => {
    switch (currentUser.role) {
      case 'cio': return 'Strategic Reports';
      case 'director_operations': return 'Operational Reports';
      case 'finance': return 'Financial Reports';
      default: return 'Analytics & Reports';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{getTitle()}</h1>
        <p className="text-muted-foreground mt-1">
          Procurement performance metrics and insights
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Requests"
          value={summary.totalRequestsThisMonth}
          subtitle="This month"
          icon={BarChart3}
        />
        <StatsCard
          title="Approved Spend"
          value={formatCurrency(summary.totalApprovedSpend)}
          subtitle="This month"
          icon={DollarSign}
        />
        <StatsCard
          title="Savings Achieved"
          value={formatCurrency(savings.totalNegotiatedSavings)}
          subtitle={`${savings.negotiationsCount} negotiations`}
          icon={TrendingUp}
          trend={{ value: Math.round(savings.avgSavingsPercent), positive: true }}
        />
        <StatsCard
          title="Avg. Approval Time"
          value={`${summary.avgApprovalTime}d`}
          subtitle="All tiers"
          icon={Clock}
        />
      </div>

      <Tabs defaultValue="cycle" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="cycle">Cycle Time</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="vendors">Pre-Approved</TabsTrigger>
        </TabsList>

        {/* Cycle Time by Tier */}
        <TabsContent value="cycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Procurement Cycle Time by Risk Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cycleTime.map(tier => (
                  <div key={tier.tier} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          tier.tier === 0 ? 'secondary' :
                          tier.tier <= 2 ? 'outline' :
                          tier.tier === 3 ? 'default' : 'destructive'
                        }>
                          Tier {tier.tier}
                        </Badge>
                        <span className="font-medium">{tier.tierLabel}</span>
                      </div>
                      <span className="text-2xl font-bold">{tier.avgDays}d</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{tier.requestCount} requests</span>
                      <span>Range: {tier.minDays}-{tier.maxDays} days</span>
                    </div>
                    <Progress 
                      value={(tier.avgDays / 20) * 100} 
                      className="mt-2 h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottlenecks */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Approval Bottlenecks (Who is Slowest)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottlenecks.map((b, i) => (
                  <div 
                    key={b.approverRole} 
                    className={`p-4 rounded-lg border ${i === 0 ? 'border-destructive/50 bg-destructive/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {i === 0 && <Badge variant="destructive">Slowest</Badge>}
                          <span className="font-medium">{b.approverRole}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{b.approverName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{b.avgDaysInQueue}d</p>
                        <p className="text-sm text-muted-foreground">avg. queue time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {b.requestsDelayed} requests delayed
                      </span>
                      <span className="text-muted-foreground">
                        Longest wait: {b.longestWait}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tracking */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Tracking by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetStatuses.map(dept => (
                  <div key={dept.department} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{dept.departmentLabel}</span>
                        <Badge variant={
                          dept.status === 'healthy' ? 'outline' :
                          dept.status === 'warning' ? 'secondary' :
                          dept.status === 'critical' ? 'destructive' : 'destructive'
                        }>
                          {Math.round(dept.percentUsed)}%
                        </Badge>
                      </div>
                      <span className={`font-bold ${
                        dept.status === 'over' ? 'text-destructive' :
                        dept.status === 'critical' ? 'text-destructive' : ''
                      }`}>
                        {formatCurrency(dept.remaining)} left
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, dept.percentUsed)} 
                      className={`h-2 ${dept.status === 'critical' || dept.status === 'over' ? '[&>div]:bg-destructive' : ''}`}
                    />
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span>Spent: {formatCurrency(dept.spentToDate)}</span>
                      <span>Pending: {formatCurrency(dept.pendingCommitments)}</span>
                      <span>Total: {formatCurrency(dept.totalBudget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings */}
        <TabsContent value="savings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(savings.totalNegotiatedSavings)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Discount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {savings.avgSavingsPercent.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Negotiations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{savings.negotiationsCount}</p>
              </CardContent>
            </Card>
          </div>
          
          {savings.topSavingsRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Savings Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                  <p className="font-medium">{savings.topSavingsRequest.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Original: {formatCurrency(savings.topSavingsRequest.originalAmount)}</span>
                    <span>→</span>
                    <span>Final: {formatCurrency(savings.topSavingsRequest.negotiatedAmount)}</span>
                    <Badge className="bg-green-600">
                      -{savings.topSavingsRequest.savingsPercent.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Request Volume */}
        <TabsContent value="volume" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Volume by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volumeByDept.map(dept => (
                    <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{dept.departmentLabel}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {dept.pending} pending
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {dept.approved} approved
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{dept.totalRequests}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(dept.totalSpend)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Request Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeBreakdown.map(type => (
                    <div key={type.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.category}</span>
                        <span className="text-muted-foreground">{type.count} ({type.percent.toFixed(0)}%)</span>
                      </div>
                      <Progress value={type.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pre-Approved Vendor Usage */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Pre-Approved Vendor Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorUsage.length > 0 ? vendorUsage.map(vendor => (
                    <div key={vendor.vendorName} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{vendor.vendorName}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg. processing: {vendor.avgProcessingTime}d
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{vendor.requestCount} requests</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(vendor.totalSpend)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      No pre-approved vendor usage this period
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Renewal Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                    <span>On-Time Renewals</span>
                    <span className="text-2xl font-bold text-green-600">
                      {renewalCompliance.complianceRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Total Renewals</p>
                      <p className="text-xl font-bold">{renewalCompliance.totalRenewals}</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Avg. Lead Time</p>
                      <p className="text-xl font-bold">{renewalCompliance.avgLeadTimeDays.toFixed(0)}d</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Reports = () => {
  const currentUser = getCurrentUser();
  
  // Role-based access control
  switch (currentUser.role) {
    case 'requester':
      return <NoReportsAccess />;
    case 'department_leader':
      return <ManagerReports />;
    case 'compliance':
      return <ComplianceReports />;
    case 'it':
      return <ITReports />;
    case 'finance':
    case 'cio':
    case 'director_operations':
    case 'admin':
      return <FullReports />;
    default:
      return <NoReportsAccess />;
  }
};

export default Reports;
