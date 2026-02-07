import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { 
  requests, 
  formatCurrency,
  departments
} from "@/lib/mockData";
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Handshake,
  Plus,
  Filter,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DirectorOpsDashboardProps {
  userName: string;
}

export function DirectorOpsDashboard({ userName }: DirectorOpsDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  
  // Negotiation queue (requests >$50K requiring negotiation)
  const negotiationQueue = requests.filter(r => 
    r.status === 'pending' && 
    r.budgetedAmount > 50000 &&
    r.currentStep === 'negotiation'
  );
  
  // Bottleneck alerts (stuck >5 days)
  const bottlenecks = requests.filter(r => 
    r.status === 'pending' && r.daysInCurrentStage > 5
  );
  
  // All active requests with filters
  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
    return true;
  });
  
  // Stats
  const totalThisMonth = requests.length;
  const avgCycleTime = 6.5; // Mock average
  const savingsAchieved = requests
    .filter(r => r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);
  const mostCommonCategory = 'SaaS'; // Mock

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Director of Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Complete procurement oversight.
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
          title="Total Requests"
          value={totalThisMonth}
          subtitle="This month"
          icon={BarChart3}
        />
        <StatsCard
          title="Avg. Cycle Time"
          value={`${avgCycleTime}d`}
          subtitle="All tiers"
          icon={Clock}
        />
        <StatsCard
          title="Savings Achieved"
          value={formatCurrency(savingsAchieved)}
          subtitle="From negotiations"
          icon={TrendingUp}
          trend={{ value: 23, positive: true }}
        />
        <StatsCard
          title="Most Common"
          value={mostCommonCategory}
          subtitle="Request type"
          icon={Filter}
        />
      </div>

      <Tabs defaultValue="negotiation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="negotiation" className="gap-2">
            Negotiation Queue
            {negotiationQueue.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {negotiationQueue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="bottlenecks" className="gap-2">
            Bottlenecks
            {bottlenecks.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {bottlenecks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Negotiation Queue */}
        <TabsContent value="negotiation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" />
                Negotiation Queue (Requests &gt;$50K)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {negotiationQueue.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <Badge variant="secondary">{request.department.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Original: {formatCurrency(request.originalAmount)}</span>
                      <span>•</span>
                      <span>{request.daysInCurrentStage} days waiting</span>
                    </div>
                  </div>
                  <Link to={`/requests/${request.id}`}>
                    <Button size="sm" className="gap-2">
                      <Handshake className="w-4 h-4" />
                      Start Negotiation
                    </Button>
                  </Link>
                </div>
              ))}
              {negotiationQueue.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No requests in negotiation queue
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Requests */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">All Active Requests</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="needs_info">Needs Info</SelectItem>
                    </SelectContent>
                  </Select>
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRequests.map(request => (
                <RequestCard key={request.id} request={request} compact />
              ))}
              {filteredRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No requests match your filters
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottlenecks */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Bottleneck Alerts (Stuck &gt;5 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bottlenecks.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                        {request.title}
                      </Link>
                      <Badge variant="destructive">
                        {request.daysInCurrentStage} days
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Stuck at: {request.currentStep.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Holding: {getHoldingPerson(request.currentStep)}</span>
                    </div>
                  </div>
                  <Link to={`/requests/${request.id}`}>
                    <Button size="sm" variant="outline">Investigate</Button>
                  </Link>
                </div>
              ))}
              {bottlenecks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No bottlenecks detected. All requests are flowing smoothly.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getHoldingPerson(step: string): string {
  const stepOwners: Record<string, string> = {
    'intake': 'Requester',
    'requirements': 'Requester',
    'department_pre_approval': 'Department Head',
    'compliance_it_review': 'IT/Compliance',
    'negotiation': 'Dir. Operations',
    'finance_final_approval': 'Finance',
    'department_final_approval': 'Department Head',
    'contracting': 'Legal',
  };
  return stepOwners[step] || 'Unknown';
}
