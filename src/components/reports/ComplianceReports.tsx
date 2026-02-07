import { useMemo } from "react";
import { StatsCard } from "@/components/StatsCard";
import { formatCurrency, requests } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileCheck, 
  Clock, 
  AlertTriangle,
  Database,
  Building2
} from "lucide-react";

export function ComplianceReports() {
  // Filter compliance-relevant requests
  const complianceRequests = useMemo(() => 
    requests.filter(r => 
      !r.complianceApproved || 
      r.description.toLowerCase().includes('patient') ||
      r.description.toLowerCase().includes('phi') ||
      r.description.toLowerCase().includes('hipaa')
    ),
    []
  );
  
  const stats = useMemo(() => {
    const reviewed = complianceRequests.filter(r => r.complianceApproved);
    const pending = complianceRequests.filter(r => r.status === 'pending' && !r.complianceApproved);
    
    // Categorize by risk type (mock data)
    const phiRequests = complianceRequests.filter(r => 
      r.description.toLowerCase().includes('patient') || 
      r.description.toLowerCase().includes('phi')
    );
    const investmentData = complianceRequests.filter(r => 
      r.description.toLowerCase().includes('investment') ||
      r.department === 'investment'
    );
    const healthcareRequests = complianceRequests.filter(r => 
      r.description.toLowerCase().includes('fda') ||
      r.description.toLowerCase().includes('healthcare')
    );
    
    return {
      totalReviewed: reviewed.length,
      pending: pending.length,
      approved: reviewed.length,
      avgReviewTime: 2.5,
      phiCount: phiRequests.length,
      investmentCount: investmentData.length,
      healthcareCount: healthcareRequests.length,
      gdprCount: 0,
    };
  }, [complianceRequests]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <p className="text-muted-foreground mt-1">
          Regulatory and compliance metrics
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Reviews Completed"
          value={stats.totalReviewed}
          subtitle="This month"
          icon={FileCheck}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pending}
          subtitle="Awaiting compliance"
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          subtitle="Compliance cleared"
          icon={Shield}
        />
        <StatsCard
          title="Avg. Review Time"
          value={`${stats.avgReviewTime}d`}
          subtitle="Days to complete"
          icon={Clock}
        />
      </div>

      {/* Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Requests by Risk Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-status-error-bg/30 border-status-error/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-status-error" />
                  <span className="font-medium">PHI/Patient Data</span>
                </div>
                <Badge variant="destructive">{stats.phiCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Requests involving protected health information
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-status-warning-bg/30 border-status-warning/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-status-warning" />
                  <span className="font-medium">Investment Data</span>
                </div>
                <Badge className="bg-status-warning">{stats.investmentCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Requests involving investment or proprietary data
              </p>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">Healthcare/FDA</span>
                </div>
                <Badge variant="outline">{stats.healthcareCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                FDA-regulated or healthcare-related requests
              </p>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">International/GDPR</span>
                </div>
                <Badge variant="outline">{stats.gdprCount}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Cross-border or GDPR-affected requests
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
