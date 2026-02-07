import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RenewalCard } from "@/components/RenewalCard";
import { 
  renewals, 
  formatCurrency, 
  formatDate,
  Renewal,
  getCurrentUser 
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Check,
  RotateCcw,
  Replace,
  Trash2,
  Bell,
  CalendarDays,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { NoSearchResults } from "@/components/search/NoSearchResults";
import { searchItems } from "@/hooks/useRoleBasedSearch";

const Renewals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [recommendation, setRecommendation] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Role-based placeholder
  const isEnterpriseRole = ['finance', 'compliance', 'it', 'cio', 'director_operations'].includes(currentUser.role);
  const searchPlaceholder = isEnterpriseRole ? "Search all renewals..." : "Search my renewals...";

  // Sort renewals by days until expiration
  const sortedRenewals = [...renewals].sort((a, b) => 
    a.daysUntilExpiration - b.daysUntilExpiration
  );

  // Apply search filter
  const searchedRenewals = useMemo(() => 
    searchItems(sortedRenewals, searchQuery, ['vendorName']),
    [sortedRenewals, searchQuery]
  );

  // Use searched renewals for filtering
  const filteredRenewals = searchedRenewals;

  // Group by urgency
  const criticalRenewals = filteredRenewals.filter(r => 
    r.daysUntilExpiration <= 30 && r.reviewStatus !== 'completed'
  );
  const urgentRenewals = filteredRenewals.filter(r => 
    r.daysUntilExpiration > 30 && r.daysUntilExpiration <= 90 && r.reviewStatus !== 'completed'
  );
  const upcomingRenewals = filteredRenewals.filter(r => 
    r.daysUntilExpiration > 90 && r.reviewStatus !== 'completed'
  );
  const completedRenewals = filteredRenewals.filter(r => r.reviewStatus === 'completed');

  // Calculate pending alerts (within 90 days)
  const pendingAlerts = filteredRenewals.filter(r => 
    r.daysUntilExpiration <= 90 && r.reviewStatus !== 'completed'
  );

  // Stats
  const totalUpcomingValue = [...criticalRenewals, ...urgentRenewals]
    .reduce((sum, r) => sum + r.amount, 0);
  const avgUsage = Math.round(
    renewals.reduce((sum, r) => sum + r.usageRate, 0) / renewals.length
  );

  const handleOpenReview = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setRecommendation(renewal.recommendation || "");
    setNotes("");
    setShowReviewDialog(true);
  };

  const handleStartRenewalProcess = (renewal: Renewal) => {
    toast({
      title: "Starting Renewal Process",
      description: `Pre-filling renewal request for ${renewal.vendorName}...`,
    });
    // Navigate to new request with pre-filled data
    navigate("/new-request", { 
      state: { 
        prefillRenewal: {
          vendorName: renewal.vendorName,
          vendorId: renewal.vendorId,
          amount: renewal.amount,
          currentLicenses: renewal.currentLicenses,
          requestType: 'renewal'
        }
      }
    });
  };

  const handleSubmitReview = () => {
    toast({
      title: "Review Submitted",
      description: `Renewal review for ${selectedRenewal?.vendorName} has been saved.`,
    });
    setShowReviewDialog(false);
    setSelectedRenewal(null);
  };

  const recommendationOptions = [
    { value: 'renew', label: 'Renew', icon: Check, description: 'Continue with current terms' },
    { value: 'renegotiate', label: 'Renegotiate', icon: RotateCcw, description: 'Request better terms' },
    { value: 'replace', label: 'Replace', icon: Replace, description: 'Find alternative vendor' },
    { value: 'cancel', label: 'Cancel', icon: Trash2, description: 'Terminate contract' },
  ];

  // Group renewals by month for calendar view
  const getMonthlyRenewals = () => {
    const months: { [key: string]: Renewal[] } = {};
    filteredRenewals.forEach(r => {
      const monthKey = new Date(r.renewalDate).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!months[monthKey]) months[monthKey] = [];
      months[monthKey].push(r);
    });
    return months;
  };

  const monthlyRenewals = getMonthlyRenewals();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Renewal Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and review upcoming contract renewals - 90 day advance notice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="w-4 h-4 mr-1" />
            Calendar
          </Button>
        </div>
      </div>

      {/* 90-Day Alert Banner */}
      {pendingAlerts.length > 0 && (
        <div className="rounded-xl border border-status-warning/50 bg-status-warning-bg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-warning/20">
              <Bell className="w-5 h-5 text-status-warning" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-status-warning">
                {pendingAlerts.length} contracts expiring within 90 days
              </p>
              <p className="text-sm text-muted-foreground">
                Start the renewal process early for better negotiation leverage
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1">
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4 text-status-error" />
            Critical (&lt;30 days)
          </div>
          <p className="text-2xl font-bold text-status-error">{criticalRenewals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Bell className="w-4 h-4 text-status-warning" />
            Urgent (30-90 days)
          </div>
          <p className="text-2xl font-bold text-status-warning">{urgentRenewals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            Upcoming (&gt;90 days)
          </div>
          <p className="text-2xl font-bold">{upcomingRenewals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            At-Risk Value
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalUpcomingValue)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            Avg. Usage Rate
          </div>
          <p className="text-2xl font-bold">{avgUsage}%</p>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={searchPlaceholder}
        resultsCount={filteredRenewals.length}
        totalCount={renewals.length}
        showResultsCount={searchQuery.length >= 2}
        syncToUrl={true}
        className="max-w-md"
      />

      {viewMode === 'list' ? (
        <>
          {/* Critical Section (<30 days) */}
          {criticalRenewals.length > 0 && (
            <div className="rounded-xl border border-status-error/30 bg-status-error-bg/30 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-status-error" />
                Critical - Expiring in &lt;30 Days
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalRenewals.map((renewal) => (
                  <RenewalCard 
                    key={renewal.id} 
                    renewal={renewal}
                    onClick={() => handleOpenReview(renewal)}
                    onStartRenewal={() => handleStartRenewalProcess(renewal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Urgent Section (30-90 days) */}
          {urgentRenewals.length > 0 && (
            <div className="rounded-xl border border-status-warning/30 bg-status-warning-bg/30 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-status-warning" />
                Urgent - Expiring in 30-90 Days
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Start renewal process now)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentRenewals.map((renewal) => (
                  <RenewalCard 
                    key={renewal.id} 
                    renewal={renewal}
                    onClick={() => handleOpenReview(renewal)}
                    onStartRenewal={() => handleStartRenewalProcess(renewal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Renewals */}
          {upcomingRenewals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Upcoming Renewals (&gt;90 days)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRenewals.map((renewal) => (
                  <RenewalCard 
                    key={renewal.id} 
                    renewal={renewal}
                    onClick={() => handleOpenReview(renewal)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Reviews */}
          {completedRenewals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Completed Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedRenewals.map((renewal) => (
                  <RenewalCard 
                    key={renewal.id} 
                    renewal={renewal}
                    onClick={() => handleOpenReview(renewal)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Calendar View */
        <div className="space-y-6">
          {Object.entries(monthlyRenewals).map(([month, monthRenewals]) => (
            <div key={month} className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                {month}
                <span className="text-sm font-normal text-muted-foreground">
                  ({monthRenewals.length} renewals, {formatCurrency(monthRenewals.reduce((s, r) => s + r.amount, 0))})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthRenewals.map((renewal) => (
                  <RenewalCard 
                    key={renewal.id} 
                    renewal={renewal}
                    onClick={() => handleOpenReview(renewal)}
                    onStartRenewal={renewal.daysUntilExpiration <= 90 && renewal.reviewStatus === 'pending' 
                      ? () => handleStartRenewalProcess(renewal) 
                      : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Renewal: {selectedRenewal?.vendorName}</DialogTitle>
            <DialogDescription>
              Renewal date: {selectedRenewal && formatDate(selectedRenewal.renewalDate)}
              <br />
              Annual value: {selectedRenewal && formatCurrency(selectedRenewal.amount)}
              {selectedRenewal?.currentLicenses && (
                <>
                  <br />
                  Current licenses: {selectedRenewal.currentLicenses}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Days until expiration warning */}
            {selectedRenewal && selectedRenewal.daysUntilExpiration <= 90 && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                selectedRenewal.daysUntilExpiration <= 30 
                  ? "bg-status-error-bg text-status-error" 
                  : "bg-status-warning-bg text-status-warning"
              )}>
                <strong>{selectedRenewal.daysUntilExpiration} days until expiration</strong>
                <p className="text-xs mt-1 opacity-80">
                  Start the renewal process now for better negotiation leverage
                </p>
              </div>
            )}

            {/* Usage Stats */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Usage</span>
                <span className="text-lg font-bold">{selectedRenewal?.usageRate}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    (selectedRenewal?.usageRate || 0) >= 70 ? "bg-status-success" :
                    (selectedRenewal?.usageRate || 0) >= 40 ? "bg-status-warning" :
                    "bg-status-error"
                  )}
                  style={{ width: `${selectedRenewal?.usageRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {(selectedRenewal?.usageRate || 0) >= 70 
                  ? "Good utilization - consider maintaining or expanding"
                  : (selectedRenewal?.usageRate || 0) >= 40 
                    ? "Moderate utilization - review necessity or consolidate licenses"
                    : "Low utilization - consider reducing or canceling"
                }
              </p>
            </div>

            {/* Recommendation */}
            <div>
              <Label className="text-sm font-medium">Recommendation</Label>
              <RadioGroup
                value={recommendation}
                onValueChange={setRecommendation}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                {recommendationOptions.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                        "hover:bg-muted/50"
                      )}
                    >
                      <option.icon className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this renewal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedRenewal && selectedRenewal.daysUntilExpiration <= 90 && selectedRenewal.reviewStatus === 'pending' && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  setShowReviewDialog(false);
                  handleStartRenewalProcess(selectedRenewal);
                }}
              >
                Start Renewal Process
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={!recommendation}>
                Submit Review
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Renewals;
