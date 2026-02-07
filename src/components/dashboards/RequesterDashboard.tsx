import { StatsCard } from "@/components/StatsCard";
import { RequestCard } from "@/components/RequestCard";
import { RenewalCard } from "@/components/RenewalCard";
import { 
  requests, 
  renewals,
  formatCurrency,
  User
} from "@/lib/mockData";
import { 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Package,
  Monitor,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RequesterDashboardProps {
  userName: string;
  user: User;
}

export function RequesterDashboard({ userName, user }: RequesterDashboardProps) {
  // My requests only
  const myRequests = requests.filter(r => r.requesterId === user.id);
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');
  const needsActionRequests = myRequests.filter(r => r.status === 'needs_info');
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected');
  
  // Renewals I own (mock: renewals created by this user)
  const myRenewals = renewals.filter(r => r.createdBy === user.id).slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {userName.split(' ')[0]}. Track your requests.
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
          title="My Requests"
          value={myRequests.length}
          subtitle="Total submitted"
          icon={FileText}
        />
        <StatsCard
          title="In Progress"
          value={pendingRequests.length}
          subtitle="Awaiting approval"
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={approvedRequests.length}
          subtitle="This year"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Needs Action"
          value={needsActionRequests.length}
          subtitle="Requires your input"
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All My Requests</TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                In Progress
                {pendingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="action" className="gap-2">
                Needs Action
                {needsActionRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {needsActionRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All My Requests */}
            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myRequests.length > 0 ? (
                    myRequests.map(request => (
                      <RequestCard key={request.id} request={request} compact />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You haven't submitted any requests yet
                      </p>
                      <Link to="/new-request">
                        <Button variant="outline" size="sm">
                          Create your first request
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* In Progress */}
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map(request => (
                      <RequestCard key={request.id} request={request} compact />
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No requests in progress
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Needs Action */}
            <TabsContent value="action" className="space-y-4">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Requires Your Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {needsActionRequests.length > 0 ? (
                    needsActionRequests.map(request => (
                      <div key={request.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <RequestCard request={request} compact />
                        <div className="mt-3 flex justify-end">
                          <Link to={`/requests/${request.id}`}>
                            <Button size="sm">Respond Now</Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No requests need your action
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Link to="/new-request">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="w-4 h-4" />
                  Request SaaS
                </Button>
              </Link>
              <Link to="/new-request">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Monitor className="w-4 h-4" />
                  Request Hardware
                </Button>
              </Link>
              <Link to="/new-request">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Wrench className="w-4 h-4" />
                  Request Service
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* My Renewals */}
          {myRenewals.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
                  <Link to="/renewals" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {myRenewals.map(renewal => (
                  <RenewalCard key={renewal.id} renewal={renewal} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
