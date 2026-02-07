import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { 
  requests, 
  formatCurrency,
  departments
} from "@/lib/mockData";
import { 
  DollarSign, 
  Bot, 
  Building2, 
  Shield,
  Cpu,
  Eye,
  Plus,
  TrendingUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CIODashboardProps {
  userName: string;
}

// CIO approval triggers
type CIOTrigger = 'large_purchase' | 'ai_ml' | 'portfolio_access' | 'sensitive_data' | 'core_systems';

interface CIOPendingRequest {
  request: typeof requests[0];
  triggers: CIOTrigger[];
}

const triggerConfig: Record<CIOTrigger, { label: string; icon: typeof DollarSign; color: string }> = {
  large_purchase: { label: 'Large Purchase (>$50K)', icon: DollarSign, color: 'text-amber-600' },
  ai_ml: { label: 'AI/ML Tools', icon: Bot, color: 'text-purple-600' },
  portfolio_access: { label: 'Portfolio Company Access', icon: Building2, color: 'text-blue-600' },
  sensitive_data: { label: 'Sensitive Data (PHI, Investment)', icon: Shield, color: 'text-red-600' },
  core_systems: { label: 'Core Systems', icon: Cpu, color: 'text-orange-600' },
};

export function CIODashboard({ userName }: CIODashboardProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [amountFilter, setAmountFilter] = useState<string>("all");
  
  // Determine CIO triggers for each request
  const getCIOTriggers = (request: typeof requests[0]): CIOTrigger[] => {
    const triggers: CIOTrigger[] = [];
    
    if (request.budgetedAmount > 50000) triggers.push('large_purchase');
    // Mock AI/ML detection based on title/description
    if (request.title.toLowerCase().includes('ai') || 
        request.description.toLowerCase().includes('machine learning') ||
        request.description.toLowerCase().includes('artificial intelligence')) {
      triggers.push('ai_ml');
    }
    // Mock portfolio access detection
    if (request.department === 'investment' || 
        request.description.toLowerCase().includes('portfolio')) {
      triggers.push('portfolio_access');
    }
    // Sensitive data detection
    if (request.description.toLowerCase().includes('hipaa') ||
        request.description.toLowerCase().includes('patient') ||
        request.description.toLowerCase().includes('investment data')) {
      triggers.push('sensitive_data');
    }
    // Core systems
    if (request.category === 'services' && request.budgetedAmount > 30000) {
      triggers.push('core_systems');
    }
    
    return triggers;
  };
  
  // Filter requests that need CIO approval
  const pendingCIOApprovals: CIOPendingRequest[] = requests
    .filter(r => r.status === 'pending')
    .map(r => ({ request: r, triggers: getCIOTriggers(r) }))
    .filter(item => item.triggers.length > 0);
  
  // Group by trigger
  const groupedByTrigger = pendingCIOApprovals.reduce((acc, item) => {
    item.triggers.forEach(trigger => {
      if (!acc[trigger]) acc[trigger] = [];
      acc[trigger].push(item);
    });
    return acc;
  }, {} as Record<CIOTrigger, CIOPendingRequest[]>);
  
  // Recently approved by CIO (mock - last 7 days)
  const approvedThisWeek = requests.filter(r => r.status === 'approved').slice(0, 5);
  
  // All requests with filters
  const filteredRequests = requests.filter(r => {
    if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
    if (amountFilter === 'under10k' && r.budgetedAmount >= 10000) return false;
    if (amountFilter === '10k-50k' && (r.budgetedAmount < 10000 || r.budgetedAmount > 50000)) return false;
    if (amountFilter === 'over50k' && r.budgetedAmount <= 50000) return false;
    return true;
  });
  
  // Stats calculations
  const purchasesOver50K = requests.filter(r => r.budgetedAmount > 50000).length;
  const aiMlRequests = requests.filter(r => 
    r.title.toLowerCase().includes('ai') || 
    r.description.toLowerCase().includes('machine learning')
  ).length;
  const portfolioIntegrations = requests.filter(r => r.department === 'investment').length;
  const avgApprovalTime = 4.2; // Mock average

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
        <Link to="/new-request">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Purchases >$50K"
          value={purchasesOver50K}
          subtitle="This month"
          icon={DollarSign}
        />
        <StatsCard
          title="AI/ML Requests"
          value={aiMlRequests}
          subtitle="This month"
          icon={Bot}
        />
        <StatsCard
          title="Portfolio Integrations"
          value={portfolioIntegrations}
          subtitle="This month"
          icon={Building2}
        />
        <StatsCard
          title="Avg. Approval Time"
          value={`${avgApprovalTime}d`}
          subtitle="Your reviews"
          icon={Clock}
        />
        <StatsCard
          title="Your Reviews"
          value={`${pendingCIOApprovals.length}/${requests.length}`}
          subtitle="Pending vs. total"
          icon={Eye}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Requires Approval
            {pendingCIOApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {pendingCIOApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved This Week</TabsTrigger>
          <TabsTrigger value="all">All Purchases</TabsTrigger>
        </TabsList>

        {/* Requires Your Approval */}
        <TabsContent value="pending" className="space-y-6">
          {Object.entries(groupedByTrigger).map(([trigger, items]) => {
            const config = triggerConfig[trigger as CIOTrigger];
            const Icon = config.icon;
            
            return (
              <Card key={trigger}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    {config.label}
                    <Badge variant="outline" className="ml-2">
                      {items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map(({ request }) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                            {request.title}
                          </Link>
                          <Badge variant="secondary">{request.department.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{formatCurrency(request.budgetedAmount)}</span>
                          <span>•</span>
                          <span>{request.daysInCurrentStage} days waiting</span>
                          <span>•</span>
                          <span>Risk: Stage {request.approvalStage}/{request.totalStages}</span>
                        </div>
                      </div>
                      <Link to={`/requests/${request.id}`}>
                        <Button size="sm">Review Now</Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
          
          {pendingCIOApprovals.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests require your approval at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved This Week */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approved by You (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvedThisWeek.map(request => (
                <RequestCard key={request.id} request={request} compact />
              ))}
              {approvedThisWeek.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No approvals in the last 7 days
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Purchases View */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">All Purchases (Organization-Wide)</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={amountFilter} onValueChange={setAmountFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Amounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="under10k">Under $10K</SelectItem>
                      <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                      <SelectItem value="over50k">Over $50K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{request.department.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatCurrency(request.budgetedAmount)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Jump In
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
