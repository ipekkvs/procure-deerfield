import { StatsCard } from "@/components/StatsCard";
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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequesterSummaryProps {
  userName: string;
  user: User;
}

export function RequesterSummary({ userName, user }: RequesterSummaryProps) {
  const myRequests = requests.filter(r => r.requesterId === user.id);
  const activeRequests = myRequests.filter(r => r.status === 'pending' || r.status === 'needs_info');
  const approvedThisMonth = myRequests.filter(r => r.status === 'approved');
  const pendingOthers = myRequests.filter(r => r.status === 'pending');
  const needsAction = myRequests.filter(r => r.status === 'needs_info');
  
  const myRenewals = renewals.filter(r => r.createdBy === user.id).slice(0, 3);
  const inProgressRequests = myRequests.filter(r => r.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
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

      {/* My Requests Status - 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Requests"
          value={activeRequests.length}
          subtitle="Currently in progress"
          icon={FileText}
        />
        <StatsCard
          title="Approved"
          value={approvedThisMonth.length}
          subtitle="This month"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Pending"
          value={pendingOthers.length}
          subtitle="Awaiting others"
          icon={Clock}
        />
        <StatsCard
          title="Action Needed"
          value={needsAction.length}
          subtitle="Awaiting you"
          icon={AlertCircle}
        />
      </div>

      {/* Needs Your Attention */}
      {needsAction.length > 0 ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Needs Your Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAction.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                <div className="flex-1">
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Additional information requested
                  </p>
                </div>
                <Link to={`/requests/${request.id}`}>
                  <Button size="sm">Respond Now</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="py-6 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">Nothing needs your attention</p>
              <p className="text-sm text-muted-foreground">All your requests are progressing normally</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">In Progress</CardTitle>
              <Link to="/approvals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressRequests.length > 0 ? (
              inProgressRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Step {request.approvalStage} of {request.totalStages} • {request.currentStep.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No requests in progress</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
              <Link to="/renewals" className="text-sm text-primary hover:underline flex items-center gap-1">
                Review Renewals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRenewals.length > 0 ? (
              myRenewals.map(renewal => (
                <div key={renewal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{renewal.vendorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {renewal.daysUntilExpiration} days • {formatCurrency(renewal.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No upcoming renewals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
