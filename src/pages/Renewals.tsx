import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RenewalCard } from "@/components/RenewalCard";
import { 
  renewals, 
  formatCurrency, 
  formatDate,
  Renewal,
  getCurrentUser,
  departments 
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
  List,
  Building2,
  Download,
  Filter,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { NoSearchResults } from "@/components/search/NoSearchResults";
import { searchItems } from "@/hooks/useRoleBasedSearch";
import { RenewalFilters, filterRenewalsByAmount } from "@/components/renewals/RenewalFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [amountFilter, setAmountFilter] = useState<string>("all");
  const [showStrategicOnly, setShowStrategicOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "team">("mine");

  // Role-based configuration
  const roleConfig = useMemo(() => {
    switch (currentUser.role) {
      case 'requester':
        return {
          title: 'My Renewals',
          subtitle: 'Contracts you own or are responsible for',
          showDepartmentFilter: false,
          showAmountFilter: false,
          showExport: false,
          showTabs: false,
          showStrategicToggle: false,
        };
      case 'department_leader':
        return {
          title: `My Department Renewals - ${departments.find(d => d.value === currentUser.department)?.label || ''}`,
          subtitle: 'Your renewals and team renewals',
          showDepartmentFilter: false,
          showAmountFilter: true,
          showExport: false,
          showTabs: true,
          showStrategicToggle: false,
        };
      case 'finance':
        return {
          title: 'All Company Renewals',
          subtitle: 'Enterprise-wide renewal management',
          showDepartmentFilter: true,
          showAmountFilter: true,
          showExport: true,
          showTabs: false,
          showStrategicToggle: false,
        };
      case 'compliance':
        return {
          title: 'Compliance-Relevant Renewals',
          subtitle: 'Renewals with regulatory implications',
          showDepartmentFilter: false,
          showAmountFilter: true,
          showExport: false,
          showTabs: false,
          showStrategicToggle: false,
        };
      case 'it':
        return {
          title: 'IT-Relevant Renewals',
          subtitle: 'Renewals with technical/security implications',
          showDepartmentFilter: false,
          showAmountFilter: true,
          showExport: false,
          showTabs: false,
          showStrategicToggle: false,
        };
      case 'cio':
        return {
          title: 'All Company Renewals',
          subtitle: 'Strategic renewal management',
          showDepartmentFilter: true,
          showAmountFilter: true,
          showExport: true,
          showTabs: false,
          showStrategicToggle: true,
        };
      case 'director_operations':
        return {
          title: 'All Company Renewals',
          subtitle: 'Operational renewal pipeline',
          showDepartmentFilter: true,
          showAmountFilter: true,
          showExport: true,
          showTabs: false,
          showStrategicToggle: false,
        };
      default:
        return {
          title: 'Renewals',
          subtitle: 'Contract renewals',
          showDepartmentFilter: false,
          showAmountFilter: false,
          showExport: false,
          showTabs: false,
          showStrategicToggle: false,
        };
    }
  }, [currentUser.role, currentUser.department]);

  // Role-based filtering
  const roleFilteredRenewals = useMemo(() => {
    let filtered = [...renewals];
    
    switch (currentUser.role) {
      case 'requester':
        // Only renewals they own
        filtered = filtered.filter(r => r.ownerId === currentUser.id);
        break;
      case 'department_leader':
        // Their renewals + department renewals
        if (activeTab === 'mine') {
          filtered = filtered.filter(r => r.ownerId === currentUser.id);
        } else {
          filtered = filtered.filter(r => r.department === currentUser.department);
        }
        break;
      case 'compliance':
        // Only compliance-relevant
        filtered = filtered.filter(r => 
          r.requiresCompliance || r.hasPhi || r.hasInvestmentData
        );
        break;
      case 'it':
        // Only IT-relevant
        filtered = filtered.filter(r => 
          r.requiresIt || r.hasIntegration
        );
        break;
      case 'cio':
        // All, but can filter to strategic only
        if (showStrategicOnly) {
          filtered = filtered.filter(r => 
            r.amount > 50000 || r.hasIntegration || r.hasInvestmentData
          );
        }
        break;
      // Finance and Director see all
      default:
        break;
    }
    
    return filtered;
  }, [currentUser, activeTab, showStrategicOnly]);

  // Apply department filter
  const deptFilteredRenewals = useMemo(() => {
    if (departmentFilter === 'all') return roleFilteredRenewals;
    return roleFilteredRenewals.filter(r => r.department === departmentFilter);
  }, [roleFilteredRenewals, departmentFilter]);

  // Apply amount filter
  const amountFilteredRenewals = useMemo(() => 
    filterRenewalsByAmount(deptFilteredRenewals, amountFilter),
    [deptFilteredRenewals, amountFilter]
  );

  // Sort renewals by days until expiration
  const sortedRenewals = [...amountFilteredRenewals].sort((a, b) => 
    a.daysUntilExpiration - b.daysUntilExpiration
  );

  // Apply search filter
  const searchedRenewals = useMemo(() => 
    searchItems(sortedRenewals, searchQuery, ['vendorName']),
    [sortedRenewals, searchQuery]
  );

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
  const avgUsage = filteredRenewals.length > 0 
    ? Math.round(filteredRenewals.reduce((sum, r) => sum + r.usageRate, 0) / filteredRenewals.length)
    : 0;

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

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Renewal forecast is being generated...",
    });
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

  // Empty state for requester with no renewals
  if (currentUser.role === 'requester' && roleFilteredRenewals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Renewals Found</h2>
        <p className="text-muted-foreground mb-4 max-w-md">
          You don't have any contracts assigned to you yet. Contracts will appear here when you're designated as the owner.
        </p>
        <Button onClick={() => navigate('/approvals')}>
          View My Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{roleConfig.title}</h1>
          <p className="text-muted-foreground mt-1">{roleConfig.subtitle}</p>
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

      {/* Tabs for Manager */}
      {roleConfig.showTabs && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "mine" | "team")}>
          <TabsList>
            <TabsTrigger value="mine">My Renewals</TabsTrigger>
            <TabsTrigger value="team">Team Renewals</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

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
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-status-error/10">
              <AlertTriangle className="w-4 h-4 text-status-error" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-status-error">{criticalRenewals.length}</span>
            <span className="text-xs text-muted-foreground">&lt;30 days</span>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-status-warning/10">
              <Bell className="w-4 h-4 text-status-warning" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Urgent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-status-warning">{urgentRenewals.length}</span>
            <span className="text-xs text-muted-foreground">30-90 days</span>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{upcomingRenewals.length}</span>
            <span className="text-xs text-muted-foreground">&gt;90 days</span>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">At-Risk Value</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold truncate">{formatCurrency(totalUpcomingValue)}</span>
            <span className="text-xs text-muted-foreground">Next 90 days</span>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Avg Usage</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{avgUsage}%</span>
            <span className="text-xs text-muted-foreground">utilization</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${roleConfig.title.toLowerCase()}...`}
          resultsCount={filteredRenewals.length}
          totalCount={roleFilteredRenewals.length}
          showResultsCount={searchQuery.length >= 2}
          syncToUrl={true}
          className="max-w-md"
        />
        
        {roleConfig.showStrategicToggle && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="strategicOnly"
              checked={showStrategicOnly}
              onCheckedChange={(checked) => setShowStrategicOnly(checked === true)}
            />
            <Label htmlFor="strategicOnly" className="text-sm cursor-pointer flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Show Only Strategic (&gt;$50K, AI/ML, Portfolio)
            </Label>
          </div>
        )}
        
        <div className="flex-1" />
        
        <RenewalFilters
          showDepartmentFilter={roleConfig.showDepartmentFilter}
          showAmountFilter={roleConfig.showAmountFilter}
          showExport={roleConfig.showExport}
          departmentFilter={departmentFilter}
          amountFilter={amountFilter}
          onDepartmentChange={setDepartmentFilter}
          onAmountChange={setAmountFilter}
          onExport={handleExport}
        />
      </div>

      {filteredRenewals.length === 0 && searchQuery ? (
        <NoSearchResults 
          searchTerm={searchQuery} 
          onClear={() => setSearchQuery("")} 
        />
      ) : viewMode === 'list' ? (
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
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes & Next Steps
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this renewal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={!recommendation}>
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Renewals;
