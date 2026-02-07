import { useMemo } from "react";
import { StatsCard } from "@/components/StatsCard";
import { formatCurrency, requests } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Server, 
  Clock, 
  Network,
  Key,
  Database,
  Settings
} from "lucide-react";

export function ITReports() {
  // Filter IT-relevant requests
  const itRequests = useMemo(() => 
    requests.filter(r => 
      !r.itApproved || 
      r.category === 'saas' ||
      r.description.toLowerCase().includes('integration') ||
      r.description.toLowerCase().includes('api')
    ),
    []
  );
  
  const stats = useMemo(() => {
    const reviewed = itRequests.filter(r => r.itApproved);
    const pending = itRequests.filter(r => r.status === 'pending' && !r.itApproved);
    
    // Mock integration data
    const withIntegrations = itRequests.filter(r => 
      r.description.toLowerCase().includes('integration') ||
      r.description.toLowerCase().includes('api') ||
      r.description.toLowerCase().includes('sso')
    );
    
    const ssoRequests = itRequests.filter(r => 
      r.description.toLowerCase().includes('sso') ||
      r.description.toLowerCase().includes('okta')
    );
    
    return {
      totalReviewed: reviewed.length,
      pending: pending.length,
      avgReviewTime: 1.8,
      autoSkipped: 3,
      newIntegrations: withIntegrations.length,
      ssoUsage: ssoRequests.length,
      securityAssessments: pending.length,
    };
  }, [itRequests]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">IT Security Reports</h1>
        <p className="text-muted-foreground mt-1">
          Technical and security review metrics
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="IT Reviews"
          value={stats.totalReviewed}
          subtitle="Completed this month"
          icon={Shield}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pending}
          subtitle="Awaiting IT"
          icon={Clock}
        />
        <StatsCard
          title="Avg. Review Time"
          value={`${stats.avgReviewTime}d`}
          subtitle="Days to complete"
          icon={Clock}
        />
        <StatsCard
          title="Auto-Skipped"
          value={stats.autoSkipped}
          subtitle="Pre-approved vendors"
          icon={Settings}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Integration & Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">New Integrations</p>
                    <p className="text-sm text-muted-foreground">Added this quarter</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{stats.newIntegrations}</span>
              </div>
              
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">SSO Implementations</p>
                    <p className="text-sm text-muted-foreground">Single sign-on enabled</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{stats.ssoUsage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Vendor Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Security Assessments</p>
                    <p className="text-sm text-muted-foreground">New vendors pending</p>
                  </div>
                </div>
                <Badge variant="destructive">{stats.securityAssessments}</Badge>
              </div>
              
              <div className="p-4 rounded-lg border flex items-center justify-between bg-status-success-bg/30">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-status-success" />
                  <div>
                    <p className="font-medium">Pre-Approved Usage</p>
                    <p className="text-sm text-muted-foreground">Vendors with fast-track</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-status-success">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
