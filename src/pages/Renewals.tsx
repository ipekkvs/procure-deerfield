import { useState } from "react";
import { RenewalCard } from "@/components/RenewalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  renewals, 
  formatCurrency, 
  formatDate,
  getDaysUntilRenewal,
  Renewal 
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  Search, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Check,
  RotateCcw,
  Replace,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Renewals = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [recommendation, setRecommendation] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Sort renewals by date
  const sortedRenewals = [...renewals].sort((a, b) => 
    new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  );

  // Filter renewals
  const filteredRenewals = sortedRenewals.filter(r =>
    r.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const overdueRenewals = filteredRenewals.filter(r => r.reviewStatus === 'overdue');
  const pendingRenewals = filteredRenewals.filter(r => 
    r.reviewStatus === 'pending' || r.reviewStatus === 'in_review'
  );
  const completedRenewals = filteredRenewals.filter(r => r.reviewStatus === 'completed');

  // Stats
  const totalUpcomingValue = pendingRenewals.reduce((sum, r) => sum + r.amount, 0);
  const avgUsage = Math.round(
    renewals.reduce((sum, r) => sum + r.usageRate, 0) / renewals.length
  );

  const handleOpenReview = (renewal: Renewal) => {
    setSelectedRenewal(renewal);
    setRecommendation(renewal.recommendation || "");
    setNotes("");
    setShowReviewDialog(true);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Renewal Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and review upcoming contract renewals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            Upcoming (90 days)
          </div>
          <p className="text-2xl font-bold">{pendingRenewals.length + overdueRenewals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4 text-status-error" />
            Action Required
          </div>
          <p className="text-2xl font-bold text-status-error">{overdueRenewals.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            Upcoming Value
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Action Required Section */}
      {overdueRenewals.length > 0 && (
        <div className="rounded-xl border border-status-error/30 bg-status-error-bg/30 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-status-error" />
            Action Required
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueRenewals.map((renewal) => (
              <RenewalCard 
                key={renewal.id} 
                renewal={renewal}
                onClick={() => handleOpenReview(renewal)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Renewals */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Renewals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRenewals.map((renewal) => (
            <RenewalCard 
              key={renewal.id} 
              renewal={renewal}
              onClick={() => handleOpenReview(renewal)}
            />
          ))}
        </div>
      </div>

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

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Renewal: {selectedRenewal?.vendorName}</DialogTitle>
            <DialogDescription>
              Renewal date: {selectedRenewal && formatDate(selectedRenewal.renewalDate)}
              <br />
              Annual value: {selectedRenewal && formatCurrency(selectedRenewal.amount)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Usage Stats */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Usage</span>
                <span className="text-lg font-bold">{selectedRenewal?.usageRate}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={!recommendation}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Renewals;
