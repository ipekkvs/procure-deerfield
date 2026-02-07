import { StatsCard } from "@/components/StatsCard";
import { requests, formatCurrency, vendors } from "@/lib/mockData";
import { 
  DollarSign, 
  Bot, 
  Building2, 
  Shield,
  AlertTriangle,
  ArrowRight,
  Eye,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CIOSummaryProps {
  userName: string;
}

export function CIOSummary({ userName }: CIOSummaryProps) {
  // CIO triggers
  const largePurchases = requests.filter(r => r.status === 'pending' && r.budgetedAmount > 50000);
  const aiMlTools = requests.filter(r => 
    r.status === 'pending' && 
    (r.title.toLowerCase().includes('ai') || r.description.toLowerCase().includes('machine learning'))
  );
  const portfolioIntegrations = requests.filter(r => 
    r.status === 'pending' && r.department === 'investment'
  );
  
  const totalNeedingApproval = largePurchases.length + aiMlTools.length + portfolioIntegrations.length;
  
  // Stats
  const totalRequestsOrg = requests.length;
  const cioReviewed = requests.filter(r => r.budgetedAmount > 50000 && r.status === 'approved').length;
  const autoPassed = requests.filter(r => r.status === 'approved' && r.budgetedAmount <= 50000).length;
  const totalSpend = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.negotiatedAmount || r.budgetedAmount), 0);
  
  // Vendor stats
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const preApprovedVendors = vendors.filter(v => v.isPreApproved).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CIO Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Strategic technology oversight.
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
              {largePurchases.length > 0 && (
                <span>• {largePurchases.length} Large purchases (&gt;$50K)</span>
              )}
              {aiMlTools.length > 0 && (
                <span>• {aiMlTools.length} AI/ML tools</span>
              )}
              {portfolioIntegrations.length > 0 && (
                <span>• {portfolioIntegrations.length} Portfolio integrations</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Requests"
          value={totalRequestsOrg}
          subtitle="Across organization"
          icon={Eye}
        />
        <StatsCard
          title="CIO Reviewed"
          value={cioReviewed}
          subtitle="This month"
          icon={Shield}
        />
        <StatsCard
          title="Auto-Passed"
          value={autoPassed}
          subtitle="Didn't need CIO"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Spend"
          value={formatCurrency(totalSpend)}
          subtitle="Approved"
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Initiatives */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Strategic Initiatives</CardTitle>
              <Link to="/approvals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="font-medium">AI/ML Tools</span>
              </div>
              <span className="text-lg font-semibold">{aiMlTools.length} pending</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Portfolio Access</span>
              </div>
              <span className="text-lg font-semibold">{portfolioIntegrations.length} pending</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span className="font-medium">Large Commitments</span>
              </div>
              <span className="text-lg font-semibold">{largePurchases.length} pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Vendor Portfolio</CardTitle>
              <Link to="/vendors" className="text-sm text-primary hover:underline flex items-center gap-1">
                View Analysis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{activeVendors}</p>
                <p className="text-xs text-muted-foreground">Active Vendors</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{preApprovedVendors}</p>
                <p className="text-xs text-muted-foreground">Pre-Approved</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">New This Q</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Consistency Alerts */}
      <Card className="border-amber-500/30">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-medium">Platform Consistency Alert</p>
              <p className="text-sm text-muted-foreground">
                2 departments using different AI/ML tools
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            Review for Consolidation <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
