import { StatsCard } from "@/components/StatsCard";
import { requests } from "@/lib/mockData";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Plug,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { preApprovedVendors } from "@/lib/riskScoring";

interface ITSummaryProps {
  userName: string;
}

export function ITSummary({ userName }: ITSummaryProps) {
  // Categorize requests
  const newVendors = requests.filter(r => 
    r.status === 'pending' && !r.itApproved && !r.vendorId &&
    !preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
  );
  
  const integrationRequests = requests.filter(r => 
    r.status === 'pending' && !r.itApproved && 
    r.description.toLowerCase().includes('api') || r.description.toLowerCase().includes('integration')
  );
  
  const useCaseChanges = requests.filter(r => 
    r.status === 'pending' && !r.itApproved &&
    r.requestType === 'renewal'
  );
  
  const totalNeedingReview = newVendors.length + integrationRequests.length;
  
  // Stats
  const reviewedThisMonth = requests.filter(r => r.itApproved).length;
  const avgReviewTime = 3.2;
  const autoSkipped = requests.filter(r => 
    r.status === 'approved' && 
    preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
  ).length;
  
  // Integration stats
  const activeIntegrations = requests.filter(r => r.status === 'approved' && r.category === 'saas').length;
  const addedThisMonth = 3;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IT Security Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Security assessments and integrations.
          </p>
        </div>
      </div>

      {/* Needs My Review Alert */}
      {totalNeedingReview > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {totalNeedingReview} items need your review
                </p>
              </div>
              <Link to="/approvals">
                <Button className="gap-2">
                  Go to Approvals <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {newVendors.length > 0 && (
                <span>• {newVendors.length} New vendors (security assessment)</span>
              )}
              {integrationRequests.length > 0 && (
                <span>• {integrationRequests.length} API integrations</span>
              )}
              {useCaseChanges.length > 0 && (
                <span>• {useCaseChanges.length} Use case changes</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Security Reviews"
          value={reviewedThisMonth}
          subtitle="Completed this month"
          icon={Shield}
        />
        <StatsCard
          title="Approved"
          value={reviewedThisMonth}
          subtitle="Security cleared"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Avg. Review Time"
          value={`${avgReviewTime}d`}
          subtitle="Your reviews"
          icon={Clock}
        />
        <StatsCard
          title="Auto-Skipped"
          value={autoSkipped}
          subtitle="Pre-approved vendors"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Assessments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Security Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">New Vendors Pending</span>
              <span className="text-lg font-semibold">{newVendors.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">Integrations This Quarter</span>
              <span className="text-lg font-semibold">{integrationRequests.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">SOC 2 Renewals Due</span>
              <span className="text-lg font-semibold">2</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Integrations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Integrations</CardTitle>
              <Link to="/vendors" className="text-sm text-primary hover:underline flex items-center gap-1">
                Integration Map <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Server className="w-10 h-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeIntegrations}</p>
                <p className="text-sm text-muted-foreground">Total active integrations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Added This Month</p>
                <p className="font-semibold">{addedThisMonth}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Next Security Review</p>
                <p className="font-semibold">Feb 15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
