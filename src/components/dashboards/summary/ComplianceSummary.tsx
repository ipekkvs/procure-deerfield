import { StatsCard } from "@/components/StatsCard";
import { requests, formatCurrency } from "@/lib/mockData";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  FileCheck,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { preApprovedVendors } from "@/lib/riskScoring";

interface ComplianceSummaryProps {
  userName: string;
}

export function ComplianceSummary({ userName }: ComplianceSummaryProps) {
  // Categorize requests by compliance priority
  const highPriority = requests.filter(r => 
    r.status === 'pending' && !r.complianceApproved && (
      r.description.toLowerCase().includes('patient') ||
      r.description.toLowerCase().includes('hipaa') ||
      (!r.vendorId && r.category === 'saas')
    )
  );
  
  const standardReview = requests.filter(r => 
    r.status === 'pending' && !r.complianceApproved && 
    r.category === 'saas' && r.licensesSeatsCount && r.licensesSeatsCount > 20
  );
  
  const useCaseChanges = requests.filter(r => 
    r.status === 'pending' && !r.complianceApproved &&
    r.requestType === 'renewal' && 
    preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
  );
  
  const totalNeedingReview = highPriority.length + standardReview.length + useCaseChanges.length;
  
  // Stats
  const reviewedThisMonth = requests.filter(r => r.complianceApproved).length;
  const avgReviewTime = 4.5;
  const autoSkipped = requests.filter(r => r.status === 'approved' && !r.complianceApproved && r.budgetedAmount < 10000).length;
  
  // Risk type breakdown
  const phiRequests = requests.filter(r => r.description.toLowerCase().includes('patient')).length;
  const investmentData = requests.filter(r => r.department === 'investment').length;
  const gdprRequests = requests.filter(r => r.description.toLowerCase().includes('gdpr') || r.description.toLowerCase().includes('international')).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Regulatory oversight.
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
              {highPriority.length > 0 && (
                <span>• {highPriority.length} High priority (new vendors, PHI)</span>
              )}
              {standardReview.length > 0 && (
                <span>• {standardReview.length} Standard (DPAs, PII)</span>
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
          title="Total Reviewed"
          value={reviewedThisMonth}
          subtitle="This month"
          icon={FileCheck}
        />
        <StatsCard
          title="Approved"
          value={reviewedThisMonth}
          subtitle="Compliance cleared"
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
          subtitle="No review needed"
          icon={Shield}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Risk Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Requests by Risk Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">PHI/Patient Data</span>
              <span className="text-lg font-semibold">{phiRequests}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">Investment Data</span>
              <span className="text-lg font-semibold">{investmentData}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">International/GDPR</span>
              <span className="text-lg font-semibold">{gdprRequests}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Approved Vendors */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pre-Approved Vendors</CardTitle>
              <Link to="/vendors" className="text-sm text-primary hover:underline flex items-center gap-1">
                Manage List <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <ListChecks className="w-10 h-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{preApprovedVendors.length}</p>
                <p className="text-sm text-muted-foreground">Active pre-approved vendors</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {preApprovedVendors.slice(0, 6).map(vendor => (
                <span key={vendor} className="px-2 py-1 rounded-md bg-muted text-sm">
                  {vendor}
                </span>
              ))}
              {preApprovedVendors.length > 6 && (
                <span className="px-2 py-1 rounded-md bg-muted text-sm text-muted-foreground">
                  +{preApprovedVendors.length - 6} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
