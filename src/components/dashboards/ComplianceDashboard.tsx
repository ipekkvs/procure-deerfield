import { StatsCard } from "@/components/StatsCard";
import { 
  requests, 
  formatCurrency,
  Vendor
} from "@/lib/mockData";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Eye,
  Plus,
  FileCheck,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { preApprovedVendors } from "@/lib/riskScoring";

interface ComplianceDashboardProps {
  userName: string;
}

type CompliancePriority = 'high' | 'standard' | 'use_case_change';

interface ComplianceRequest {
  request: typeof requests[0];
  priority: CompliancePriority;
  dataTypes: string[];
  triggers: string[];
}

const priorityConfig: Record<CompliancePriority, { label: string; color: string; bgColor: string }> = {
  high: { label: '🔴 HIGH PRIORITY - New Vendors with Sensitive Data', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  standard: { label: '🟡 STANDARD - Data Processing Agreements', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  use_case_change: { label: '⚠️ USE CASE CHANGES - Pre-Approved Vendors', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
};

export function ComplianceDashboard({ userName }: ComplianceDashboardProps) {
  // Determine compliance requirements for each request
  const getComplianceInfo = (request: typeof requests[0]): ComplianceRequest | null => {
    const dataTypes: string[] = [];
    const triggers: string[] = [];
    let priority: CompliancePriority = 'standard';
    
    // Check for sensitive data types
    if (request.description.toLowerCase().includes('hipaa') || 
        request.description.toLowerCase().includes('patient')) {
      dataTypes.push('PHI');
      triggers.push('Patient Health Information access');
      priority = 'high';
    }
    if (request.department === 'investment') {
      dataTypes.push('Investment Data');
      triggers.push('Investment/proprietary data access');
    }
    if (request.category === 'saas' && request.licensesSeatsCount && request.licensesSeatsCount > 50) {
      dataTypes.push('PII');
      triggers.push('Large-scale PII processing');
    }
    
    // Check if pre-approved vendor with potential changes
    const vendorName = request.title.split(' ')[0]; // Mock vendor detection
    const isPreApproved = preApprovedVendors.some(v => 
      request.title.toLowerCase().includes(v.toLowerCase())
    );
    
    if (isPreApproved && request.requestType === 'renewal') {
      priority = 'use_case_change';
      triggers.push('Pre-approved vendor with potential feature changes');
    }
    
    // New vendor with data processing
    if (!isPreApproved && (dataTypes.length > 0 || request.category === 'saas')) {
      priority = 'high';
      triggers.push('New vendor requiring data processing agreement');
    }
    
    // Only return if compliance review is needed
    if (triggers.length === 0) return null;
    
    return { request, priority, dataTypes, triggers };
  };
  
  // Filter requests needing compliance review
  const pendingCompliance = requests
    .filter(r => r.status === 'pending' && !r.complianceApproved)
    .map(r => getComplianceInfo(r))
    .filter((item): item is ComplianceRequest => item !== null);
  
  // Group by priority
  const groupedByPriority = pendingCompliance.reduce((acc, item) => {
    if (!acc[item.priority]) acc[item.priority] = [];
    acc[item.priority].push(item);
    return acc;
  }, {} as Record<CompliancePriority, ComplianceRequest[]>);
  
  // Auto-approved (no compliance review needed)
  const autoApproved = requests.filter(r => {
    const info = getComplianceInfo(r);
    return r.status === 'approved' && !info;
  }).slice(0, 5);
  
  // Pre-approved vendor list with mock review dates
  const preApprovedVendorList = preApprovedVendors.map((vendor, i) => ({
    name: vendor,
    lastReview: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    nextReview: new Date(Date.now() + ((12 - i) * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
  }));
  
  // Stats
  const reviewsThisMonth = requests.filter(r => r.complianceApproved).length;
  const avgReviewTime = 4.5; // Mock average
  const requiresCompliance = pendingCompliance.length;
  const totalRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Regulatory oversight and vendor compliance.
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
          title="Reviews Completed"
          value={reviewsThisMonth}
          subtitle="This month"
          icon={FileCheck}
        />
        <StatsCard
          title="Avg. Review Time"
          value={`${avgReviewTime}d`}
          subtitle="Your reviews"
          icon={Clock}
        />
        <StatsCard
          title="Requiring Review"
          value={`${requiresCompliance}/${totalRequests}`}
          subtitle="Of pending requests"
          icon={Shield}
        />
        <StatsCard
          title="High Risk"
          value={groupedByPriority.high?.length || 0}
          subtitle="Immediate attention"
          icon={AlertTriangle}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Requires Review
            {pendingCompliance.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {pendingCompliance.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="auto">Auto-Approved (FYI)</TabsTrigger>
          <TabsTrigger value="vendors">Pre-Approved Vendors</TabsTrigger>
        </TabsList>

        {/* Requires My Review */}
        <TabsContent value="pending" className="space-y-6">
          {(['high', 'standard', 'use_case_change'] as CompliancePriority[]).map(priority => {
            const items = groupedByPriority[priority] || [];
            if (items.length === 0) return null;
            
            const config = priorityConfig[priority];
            
            return (
              <Card key={priority} className={config.bgColor}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${config.color}`}>
                    {config.label}
                    <Badge variant="outline" className="ml-2">
                      {items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map(({ request, dataTypes, triggers }) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                            {request.title}
                          </Link>
                          {dataTypes.map(dt => (
                            <Badge key={dt} variant="destructive" className="text-xs">
                              {dt}
                            </Badge>
                          ))}
                          <Badge variant={request.vendorId ? 'outline' : 'secondary'}>
                            {request.vendorId ? 'Existing Vendor' : 'New Vendor'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Triggers: {triggers.join(', ')}</p>
                          <p className="mt-1">{request.daysInCurrentStage} days waiting</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Escalate to Legal</Button>
                        <Link to={`/requests/${request.id}`}>
                          <Button size="sm">Review Now</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
          
          {pendingCompliance.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No requests require your compliance review at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Auto-Approved */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Auto-Approved (No Review Needed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These requests use pre-approved vendors for standard purposes. Compliance was notified but approval wasn't required.
              </p>
              <div className="space-y-3">
                {autoApproved.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(request.budgetedAmount)} • {request.department.replace('_', ' ')}
                      </p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pre-Approved Vendors */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pre-Approved Vendor List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preApprovedVendorList.map(vendor => (
                  <div key={vendor.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last review: {vendor.lastReview}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Next review: {vendor.nextReview}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
