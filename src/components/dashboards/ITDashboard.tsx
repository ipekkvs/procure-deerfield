import { StatsCard } from "@/components/StatsCard";
import { 
  requests, 
  formatCurrency,
  vendors
} from "@/lib/mockData";
import { 
  Shield, 
  Plug, 
  Database, 
  Settings2,
  Clock,
  CheckCircle2,
  Eye,
  Plus,
  Server,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { preApprovedVendors } from "@/lib/riskScoring";

interface ITDashboardProps {
  userName: string;
}

type ITCategory = 'new_vendor' | 'integration' | 'data_access' | 'use_case_change';

interface ITRequest {
  request: typeof requests[0];
  category: ITCategory;
  securityRequirements: string[];
  integrationScope: string;
}

const categoryConfig: Record<ITCategory, { label: string; icon: typeof Shield; color: string; bgColor: string }> = {
  new_vendor: { label: '🔴 NEW VENDORS - Security Assessment Needed', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  integration: { label: '🔌 INTEGRATIONS - API & System Access', icon: Plug, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  data_access: { label: '📊 DATA ACCESS - Sensitive Information', icon: Database, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  use_case_change: { label: '⚙️ USE CASE CHANGES - Modified Configurations', icon: Settings2, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
};

export function ITDashboard({ userName }: ITDashboardProps) {
  // Determine IT requirements for each request
  const getITInfo = (request: typeof requests[0]): ITRequest | null => {
    const securityRequirements: string[] = [];
    let category: ITCategory = 'new_vendor';
    let integrationScope = 'Standalone';
    
    // Check if pre-approved vendor
    const isPreApproved = preApprovedVendors.some(v => 
      request.title.toLowerCase().includes(v.toLowerCase())
    );
    
    // New vendor detection
    if (!isPreApproved && !request.vendorId) {
      category = 'new_vendor';
      securityRequirements.push('Security Questionnaire');
      securityRequirements.push('SOC 2 Certification');
      if (request.budgetedAmount > 25000) {
        securityRequirements.push('Penetration Test Results');
      }
    }
    
    // Integration scope detection (mock based on category and description)
    if (request.category === 'saas') {
      securityRequirements.push('SSO Configuration');
      integrationScope = 'SSO Only';
      
      if (request.description.toLowerCase().includes('api') ||
          request.description.toLowerCase().includes('integration')) {
        category = 'integration';
        integrationScope = 'API Integration';
        securityRequirements.push('API Security Review');
      }
    }
    
    // Data access detection
    if (request.description.toLowerCase().includes('patient') ||
        request.description.toLowerCase().includes('investment') ||
        request.department === 'investment') {
      category = 'data_access';
      securityRequirements.push('Data Encryption Standards');
      securityRequirements.push('Access Controls Review');
    }
    
    // Use case change for renewals of pre-approved vendors
    if (isPreApproved && request.requestType === 'renewal') {
      category = 'use_case_change';
      securityRequirements.push('Configuration Review');
    }
    
    // Skip if pre-approved renewal with no apparent changes
    if (isPreApproved && request.requestType === 'renewal' && securityRequirements.length <= 1) {
      return null;
    }
    
    if (securityRequirements.length === 0) return null;
    
    return { request, category, securityRequirements, integrationScope };
  };
  
  // Filter requests needing IT review
  const pendingIT = requests
    .filter(r => r.status === 'pending' && !r.itApproved)
    .map(r => getITInfo(r))
    .filter((item): item is ITRequest => item !== null);
  
  // Group by category
  const groupedByCategory = pendingIT.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ITCategory, ITRequest[]>);
  
  // Auto-approved (pre-approved vendors, standard renewals)
  const autoApproved = requests.filter(r => {
    const info = getITInfo(r);
    return r.status === 'approved' && !info;
  }).slice(0, 5);
  
  // Integration pipeline (approved requests with integrations pending)
  const integrationPipeline = requests
    .filter(r => r.status === 'approved' && r.category === 'saas')
    .slice(0, 5);
  
  // Stats
  const reviewsCompleted = requests.filter(r => r.itApproved).length;
  const avgReviewTime = 3.2; // Mock average
  const preApprovedUsage = requests.filter(r => 
    preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IT Security Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Security assessments and integration management.
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
          title="Security Reviews"
          value={reviewsCompleted}
          subtitle="Completed this month"
          icon={Shield}
        />
        <StatsCard
          title="Avg. Review Time"
          value={`${avgReviewTime}d`}
          subtitle="Your reviews"
          icon={Clock}
        />
        <StatsCard
          title="Pre-Approved Usage"
          value={preApprovedUsage}
          subtitle="Vendor requests"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Pending Reviews"
          value={pendingIT.length}
          subtitle="Requiring attention"
          icon={Lock}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Requires Review
            {pendingIT.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {pendingIT.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="auto">Pre-Approved (FYI)</TabsTrigger>
          <TabsTrigger value="pipeline">Integration Pipeline</TabsTrigger>
        </TabsList>

        {/* Requires My Review */}
        <TabsContent value="pending" className="space-y-6">
          {(['new_vendor', 'integration', 'data_access', 'use_case_change'] as ITCategory[]).map(cat => {
            const items = groupedByCategory[cat] || [];
            if (items.length === 0) return null;
            
            const config = categoryConfig[cat];
            const Icon = config.icon;
            
            return (
              <Card key={cat} className={config.bgColor}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${config.color} flex items-center gap-2`}>
                    <Icon className="w-5 h-5" />
                    {config.label}
                    <Badge variant="outline" className="ml-2">
                      {items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map(({ request, securityRequirements, integrationScope }) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                            {request.title}
                          </Link>
                          <Badge variant="secondary">{integrationScope}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {securityRequirements.map(req => (
                            <Badge key={req} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {request.daysInCurrentStage} days waiting
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Add Compliance</Button>
                        <Button variant="outline" size="sm">Flag for CIO</Button>
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
          
          {pendingIT.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No requests require your IT review at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pre-Approved */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Pre-Approved (No Review Needed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These requests use pre-approved vendors with existing security configurations. IT was notified but review wasn't required.
              </p>
              <div className="space-y-3">
                {autoApproved.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          SSO Configured
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Security Reviewed
                        </Badge>
                      </div>
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

        {/* Integration Pipeline */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Integration Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Approved requests requiring integration planning and implementation.
              </p>
              <div className="space-y-3">
                {integrationPipeline.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Target: {request.targetSignDate || 'TBD'}
                      </p>
                    </div>
                    <Badge variant="outline">Pending Setup</Badge>
                  </div>
                ))}
                {integrationPipeline.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No integrations in pipeline
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
