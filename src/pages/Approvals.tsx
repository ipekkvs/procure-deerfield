import { useState } from "react";
import { RequestCard } from "@/components/RequestCard";
import { BudgetWidget } from "@/components/BudgetWidget";
import { 
  requests, 
  formatCurrency, 
  getStepLabel,
  getDepartmentLabel,
  getDepartmentBudget,
  ApprovalStep
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter,
  ArrowUpDown,
  Shield,
  Monitor,
  DollarSign,
  Briefcase,
  FileText,
  Building2,
  AlertTriangle,
  TrendingDown,
  Users,
  RefreshCcw,
  XCircle,
  CheckCircle2,
  Eye,
  Plus,
  ShieldAlert,
  Bot,
  HeartPulse,
  TrendingUp,
  Settings,
  Scale,
  Globe,
  FlaskConical,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

type ApprovalView = 'all' | 'department' | 'compliance' | 'compliance-auto' | 'it' | 'negotiation' | 'finance' | 'finance-auto' | 'overbudget' | 'multiyear' | 'contracting' | 'cio';

// Mock over-budget requests for demonstration
const overBudgetRequests = [
  {
    id: 'OB-001',
    title: 'Advanced Analytics Platform',
    requesterName: 'Alex Johnson',
    department: 'deerfield_intelligence' as const,
    budgetedAmount: 85000,
    shortfall: 25000,
    justification: 'Critical for Q4 reporting cycle. Budget overrun due to unexpected compliance tools earlier this quarter. This platform will improve our portfolio analysis capabilities by 40% and is essential for the upcoming investor meeting.',
    urgency: 'high' as const,
    daysInQueue: 2,
    budgetSpentPercentage: 115,
  },
  {
    id: 'OB-002',
    title: 'Security Audit Services',
    requesterName: 'Emily Brown',
    department: 'business_operations' as const,
    budgetedAmount: 55000,
    shortfall: 15000,
    justification: 'Annual SOC 2 compliance audit is mandatory and cannot be deferred. Previous vendor became unavailable, requiring engagement with new firm at higher cost. Failure to complete audit will impact client contracts.',
    urgency: 'critical' as const,
    daysInQueue: 1,
    budgetSpentPercentage: 108,
  },
];

// Mock auto-approved requests (Finance FYI only)
const autoApprovedRequests: Array<{
  id: string;
  title: string;
  requesterName: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  amount: number;
  approvedAt: string;
  jumpedIn: boolean;
}> = [
  {
    id: 'AA-001',
    title: 'Team Productivity App',
    requesterName: 'Mike Wilson',
    department: 'business_operations',
    amount: 4500,
    approvedAt: '2 hours ago',
    jumpedIn: false,
  },
  {
    id: 'AA-002',
    title: 'Design Asset License',
    requesterName: 'Sarah Chen',
    department: 'deerfield_intelligence',
    amount: 2800,
    approvedAt: '1 day ago',
    jumpedIn: false,
  },
  {
    id: 'AA-003',
    title: 'Cloud Storage Upgrade',
    requesterName: 'Alex Johnson',
    department: 'investment',
    amount: 7200,
    approvedAt: '3 days ago',
    jumpedIn: false,
  },
];

// Mock multi-year commitment requests
const multiYearRequests: Array<{
  id: string;
  title: string;
  requesterName: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  annualCost: number;
  contractYears: number;
  totalCommitment: number;
  isLowAnnual: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  daysInQueue: number;
}> = [
  {
    id: 'MY-001',
    title: 'CRM System',
    requesterName: 'Alex Johnson',
    department: 'investment',
    annualCost: 8000,
    contractYears: 3,
    totalCommitment: 24000,
    isLowAnnual: true,
    urgency: 'medium',
    daysInQueue: 1,
  },
  {
    id: 'MY-002',
    title: 'Document Management System',
    requesterName: 'Mike Wilson',
    department: 'business_operations',
    annualCost: 15000,
    contractYears: 2,
    totalCommitment: 30000,
    isLowAnnual: false,
    urgency: 'high',
    daysInQueue: 3,
  },
  {
    id: 'MY-003',
    title: 'Team Collaboration Tool',
    requesterName: 'Emily Brown',
    department: 'deerfield_intelligence',
    annualCost: 6500,
    contractYears: 4,
    totalCommitment: 26000,
    isLowAnnual: true,
    urgency: 'critical',
    daysInQueue: 2,
  },
];

// Mock CIO pending requests (grouped by trigger type)
type CioTriggerType = 'large_purchase' | 'ai_ml' | 'portfolio' | 'sensitive_data' | 'core_systems';

interface CioRequest {
  id: string;
  title: string;
  requesterName: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  amount: number;
  triggerType: CioTriggerType;
  triggerReason: string;
  daysInQueue: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const cioRequests: CioRequest[] = [
  {
    id: 'CIO-001',
    title: 'Enterprise Data Platform',
    requesterName: 'Alex Johnson',
    department: 'deerfield_intelligence',
    amount: 75000,
    triggerType: 'large_purchase',
    triggerReason: 'Amount exceeds $50,000',
    daysInQueue: 2,
    urgency: 'high',
  },
  {
    id: 'CIO-002',
    title: 'OpenAI API Integration',
    requesterName: 'Mike Wilson',
    department: 'investment',
    amount: 35000,
    triggerType: 'ai_ml',
    triggerReason: 'AI/ML tool detected - platform consistency review',
    daysInQueue: 1,
    urgency: 'critical',
  },
  {
    id: 'CIO-003',
    title: 'Portfolio Analytics Dashboard',
    requesterName: 'Sarah Chen',
    department: 'investment',
    amount: 28000,
    triggerType: 'portfolio',
    triggerReason: 'Portfolio company access - reputational risk review',
    daysInQueue: 3,
    urgency: 'medium',
  },
  {
    id: 'CIO-004',
    title: 'Patient Data Management System',
    requesterName: 'Emily Brown',
    department: '3dc',
    amount: 42000,
    triggerType: 'sensitive_data',
    triggerReason: 'PHI/Patient data access',
    daysInQueue: 1,
    urgency: 'high',
  },
  {
    id: 'CIO-005',
    title: 'Core ERP Integration',
    requesterName: 'David Lee',
    department: 'business_operations',
    amount: 55000,
    triggerType: 'core_systems',
    triggerReason: 'Core system integration',
    daysInQueue: 4,
    urgency: 'medium',
  },
];

const cioApprovedThisWeek = [
  { id: 'CA-001', title: 'ML Research Platform', amount: 45000, approvedAt: '2 days ago' },
  { id: 'CA-002', title: 'Compliance Monitoring Tool', amount: 62000, approvedAt: '4 days ago' },
];

const cioTriggerLabels: Record<CioTriggerType, { label: string; icon: React.ReactNode; color: string }> = {
  large_purchase: { label: 'Large Purchases (>$50K)', icon: <DollarSign className="w-4 h-4" />, color: 'text-primary' },
  ai_ml: { label: 'AI/ML Tools & APIs', icon: <Bot className="w-4 h-4" />, color: 'text-purple-600' },
  portfolio: { label: 'Portfolio Company Integrations', icon: <Building2 className="w-4 h-4" />, color: 'text-blue-600' },
  sensitive_data: { label: 'Sensitive Data Access', icon: <HeartPulse className="w-4 h-4" />, color: 'text-status-error' },
  core_systems: { label: 'Core Systems & Enterprise', icon: <Settings className="w-4 h-4" />, color: 'text-orange-600' },
};

// Mock Compliance pending requests
type CompliancePriority = 'high' | 'standard' | 'use_case_change';

interface ComplianceRequest {
  id: string;
  title: string;
  requesterName: string;
  department: 'investment' | '3dc' | 'deerfield_intelligence' | 'business_operations' | 'external_operations' | 'deerfield_foundation';
  priority: CompliancePriority;
  triggers: string[];
  dataTypes: string[];
  isNewVendor: boolean;
  vendorName: string;
  daysInQueue: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const complianceRequests: ComplianceRequest[] = [
  {
    id: 'COMP-001',
    title: 'Patient Data Analytics Tool',
    requesterName: 'Emily Brown',
    department: '3dc',
    priority: 'high',
    triggers: ['PHI/Patient data access', 'New vendor requiring data processing agreement'],
    dataTypes: ['PHI', 'Patient Records'],
    isNewVendor: true,
    vendorName: 'HealthData Corp',
    daysInQueue: 2,
    urgency: 'high',
  },
  {
    id: 'COMP-002',
    title: 'International CRM Platform',
    requesterName: 'Mike Wilson',
    department: 'business_operations',
    priority: 'standard',
    triggers: ['International vendor with data storage (cross-border transfer)'],
    dataTypes: ['PII', 'Contact Information'],
    isNewVendor: true,
    vendorName: 'GlobalCRM EU',
    daysInQueue: 3,
    urgency: 'medium',
  },
  {
    id: 'COMP-003',
    title: 'Zoom AI Features Upgrade',
    requesterName: 'Sarah Chen',
    department: 'investment',
    priority: 'use_case_change',
    triggers: ['Use case changed on pre-approved vendor - security re-review needed'],
    dataTypes: ['Meeting Transcripts', 'AI-Generated Summaries'],
    isNewVendor: false,
    vendorName: 'Zoom',
    daysInQueue: 1,
    urgency: 'medium',
  },
];

const complianceAutoApproved = [
  { id: 'CAA-001', title: 'Salesforce Renewal', vendorName: 'Salesforce', reason: 'Pre-approved vendor, standard use', approvedAt: '1 day ago' },
  { id: 'CAA-002', title: 'Microsoft 365 Renewal', vendorName: 'Microsoft', reason: 'Pre-approved vendor, no changes', approvedAt: '3 days ago' },
];

const compliancePriorityLabels: Record<CompliancePriority, { label: string; color: string; bgColor: string }> = {
  high: { label: '🔴 HIGH PRIORITY - New Vendors with Sensitive Data', color: 'text-status-error', bgColor: 'bg-status-error-bg' },
  standard: { label: '🟡 STANDARD - Data Processing Agreements', color: 'text-status-warning', bgColor: 'bg-status-warning-bg' },
  use_case_change: { label: '⚠️ USE CASE CHANGES - Pre-Approved Vendors', color: 'text-primary', bgColor: 'bg-primary/10' },
};

const Approvals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("urgency");
  const [currentView, setCurrentView] = useState<ApprovalView>("all");

  // Get pending requests (for approval queue)
  const pendingRequests = requests.filter(r => 
    r.status === 'pending' || r.status === 'needs_info'
  );

  // Filter by approval step/role view
  const getRequestsForView = (view: ApprovalView) => {
    switch (view) {
      case 'department':
        return pendingRequests.filter(r => 
          r.currentStep === 'department_pre_approval' || 
          r.currentStep === 'department_final_approval'
        );
      case 'compliance':
        return pendingRequests.filter(r => 
          r.currentStep === 'compliance_it_review' && 
          r.requestType === 'new_purchase'
        );
      case 'it':
        return pendingRequests.filter(r => 
          r.currentStep === 'compliance_it_review' && 
          r.requestType === 'new_purchase'
        );
      case 'negotiation':
        return pendingRequests.filter(r => 
          r.currentStep === 'negotiation' && 
          r.budgetedAmount > 25000
        );
      case 'finance':
        return pendingRequests.filter(r => 
          r.currentStep === 'finance_final_approval'
        );
      case 'finance-auto':
        return []; // Handled separately with autoApprovedRequests
      case 'compliance-auto':
        return []; // Handled separately with complianceAutoApproved
      case 'overbudget':
        return []; // Handled separately with overBudgetRequests
      case 'multiyear':
        return []; // Handled separately with multiYearRequests
      case 'cio':
        return []; // Handled separately with cioRequests
      case 'contracting':
        return pendingRequests.filter(r => 
          r.currentStep === 'contracting'
        );
      default:
        return pendingRequests;
    }
  };

  const viewRequests = getRequestsForView(currentView);

  // Filter and sort
  const filteredRequests = viewRequests
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'amount-high':
          return b.budgetedAmount - a.budgetedAmount;
        case 'amount-low':
          return a.budgetedAmount - b.budgetedAmount;
        case 'days':
          return b.daysInCurrentStage - a.daysInCurrentStage;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalPendingAmount = pendingRequests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.budgetedAmount, 0);

  const avgDaysInQueue = Math.round(
    pendingRequests.reduce((sum, r) => sum + r.daysInCurrentStage, 0) / 
    (pendingRequests.length || 1)
  );

  // Calculate total savings
  const totalSavings = requests
    .filter(r => r.priceChanged && r.savingsAchieved)
    .reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);

  const viewTabs: { value: ApprovalView; label: string; icon: React.ElementType; count: number; highlight?: boolean; badge?: string }[] = [
    { value: 'all', label: 'All', icon: Filter, count: pendingRequests.length },
    { value: 'cio', label: 'CIO Review', icon: ShieldAlert, count: cioRequests.length, highlight: cioRequests.length > 0 },
    { value: 'department', label: 'Dept. Approval', icon: Building2, count: getRequestsForView('department').length },
    { value: 'compliance', label: 'Compliance', icon: Shield, count: complianceRequests.length },
    { value: 'compliance-auto', label: 'Compliance Auto', icon: ShieldCheck, count: complianceAutoApproved.length, badge: 'FYI' },
    { value: 'it', label: 'IT Review', icon: Monitor, count: getRequestsForView('it').length },
    { value: 'negotiation', label: 'Negotiation', icon: Briefcase, count: getRequestsForView('negotiation').length },
    { value: 'finance', label: 'Requires Approval', icon: DollarSign, count: getRequestsForView('finance').length + overBudgetRequests.length + multiYearRequests.length },
    { value: 'finance-auto', label: 'Finance Auto', icon: CheckCircle2, count: autoApprovedRequests.length, badge: 'FYI' },
    { value: 'overbudget', label: 'Over-Budget', icon: AlertTriangle, count: overBudgetRequests.length, highlight: true },
    { value: 'multiyear', label: 'Multi-Year', icon: RefreshCcw, count: multiYearRequests.length, highlight: multiYearRequests.some(r => r.isLowAnnual) },
    { value: 'contracting', label: 'Contracting', icon: FileText, count: getRequestsForView('contracting').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Approval Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve purchase requests based on your role
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold mt-1">
            {pendingRequests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Needs Information</p>
          <p className="text-2xl font-bold mt-1">
            {pendingRequests.filter(r => r.status === 'needs_info').length}
          </p>
        </div>
        <div className={cn(
          "rounded-xl border p-4",
          overBudgetRequests.length > 0 ? "bg-status-error-bg border-status-error/30" : "bg-card"
        )}>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Over-Budget Exceptions
          </p>
          <p className={cn(
            "text-2xl font-bold mt-1",
            overBudgetRequests.length > 0 && "text-status-error"
          )}>
            {overBudgetRequests.length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPendingAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg. Days in Queue</p>
          <p className="text-2xl font-bold mt-1">{avgDaysInQueue || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">YTD Savings</p>
          <p className="text-2xl font-bold text-status-success mt-1">{formatCurrency(totalSavings)}</p>
        </div>
      </div>

      {/* Role-based Tabs */}
      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ApprovalView)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {viewTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className={cn(
                "gap-2",
                tab.highlight && tab.count > 0 && "text-status-error data-[state=active]:text-status-error"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                  tab.highlight && tab.count > 0 
                    ? "bg-status-error/20 text-status-error" 
                    : tab.badge === 'FYI'
                    ? "bg-status-success/20 text-status-success"
                    : "bg-muted"
                )}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-status-success/20 text-status-success uppercase font-medium">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {/* CIO Dashboard View */}
          {currentView === 'cio' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-4 rounded-lg bg-status-error-bg border border-status-error/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-status-error mt-0.5" />
                <div>
                  <p className="font-semibold text-status-error">🚨 CIO Review Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Strategic purchases requiring executive approval for platform consistency, security, and enterprise impact.
                  </p>
                </div>
              </div>

              {/* Grouped by trigger type */}
              {Object.entries(cioTriggerLabels).map(([type, { label, icon, color }]) => {
                const requestsOfType = cioRequests.filter(r => r.triggerType === type);
                if (requestsOfType.length === 0) return null;
                
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={color}>{icon}</span>
                      <h3 className="font-semibold">{label}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{requestsOfType.length}</span>
                    </div>
                    
                    {requestsOfType.map((request) => (
                      <div key={request.id} className="rounded-xl border bg-card overflow-hidden">
                        <div className="p-4 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{request.title}</h4>
                              <span className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                                request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {request.urgency}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.requesterName} • {getDepartmentLabel(request.department)} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} waiting
                            </p>
                            <div className="mt-2 px-2 py-1 rounded bg-muted/50 text-xs text-muted-foreground inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {request.triggerReason}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(request.amount)}</p>
                            <Button size="sm" className="mt-2">Review</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Approved This Week */}
              {cioApprovedThisWeek.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <h3 className="font-semibold text-status-success">✅ Approved This Week</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cioApprovedThisWeek.map((req) => (
                      <div key={req.id} className="rounded-lg border border-status-success/30 bg-status-success-bg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{req.title}</p>
                          <p className="text-xs text-muted-foreground">{req.approvedAt}</p>
                        </div>
                        <p className="font-semibold text-status-success">{formatCurrency(req.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Purchases View-Only */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">📊 All Purchases (View Only)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pendingRequests.length} total in pipeline
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  View all purchases even if CIO approval isn't required. Use "Jump In" to add yourself to any request if concerned.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentView('all')}>
                    View All Requests
                  </Button>
                </div>
              </div>
            </div>
          ) : currentView === 'compliance' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-primary">🚨 Requires Your Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requests with regulatory risk requiring Compliance assessment for data privacy, security, and vendor due diligence.
                  </p>
                </div>
              </div>

              {/* Grouped by priority */}
              {Object.entries(compliancePriorityLabels).map(([priority, { label, color, bgColor }]) => {
                const requestsOfPriority = complianceRequests.filter(r => r.priority === priority);
                if (requestsOfPriority.length === 0) return null;
                
                return (
                  <div key={priority} className="space-y-3">
                    <h3 className={cn("font-semibold", color)}>{label}</h3>
                    
                    {requestsOfPriority.map((request) => (
                      <div key={request.id} className={cn("rounded-xl border bg-card overflow-hidden", 
                        request.priority === 'high' ? "border-status-error/30" : "border-border"
                      )}>
                        <div className={cn("p-4", request.priority === 'high' && "bg-status-error-bg/50")}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{request.title}</h4>
                                {request.isNewVendor && (
                                  <span className="text-xs bg-status-warning/20 text-status-warning px-2 py-0.5 rounded-full">
                                    New Vendor
                                  </span>
                                )}
                                <span className={cn(
                                  "px-2 py-0.5 text-xs font-medium rounded-full",
                                  request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                                  request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                                  "bg-muted text-muted-foreground"
                                )}>
                                  {request.urgency}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {request.requesterName} • {getDepartmentLabel(request.department)} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} waiting
                              </p>
                              
                              {/* Data Types */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {request.dataTypes.map((type, idx) => (
                                  <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                                    {type}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Triggers */}
                              <div className="mt-2 space-y-1">
                                {request.triggers.map((trigger, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {trigger}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button size="sm">Review Now</Button>
                              <Button size="sm" variant="outline">Request Info</Button>
                              <Button size="sm" variant="outline" className="text-primary">
                                <Scale className="w-3 h-3 mr-1" />
                                Escalate to Legal
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {complianceRequests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No requests pending Compliance review
                </div>
              )}
            </div>
          ) : currentView === 'compliance-auto' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-success-bg border border-status-success/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-status-success mt-0.5" />
                <div>
                  <p className="font-semibold text-status-success">✅ Auto-Approved (FYI Only)</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pre-approved vendor renewals with no use case changes. Compliance skipped for standard use.
                  </p>
                </div>
              </div>

              {complianceAutoApproved.length > 0 ? (
                <div className="space-y-3">
                  {complianceAutoApproved.map((req) => (
                    <div key={req.id} className="rounded-xl border border-status-success/30 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-status-success" />
                            <h4 className="font-semibold">{req.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {req.vendorName} • {req.reason}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{req.approvedAt}</p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No auto-approved requests this week
                </div>
              )}
            </div>
          ) : currentView === 'overbudget' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-error-bg border border-status-error/30 flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-status-error mt-0.5" />
                <div>
                  <p className="font-semibold text-status-error">Over-Budget Exceptions Requiring Finance Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These requests exceed department budgets and require exception approval. 
                    Review with Department Head before approving.
                  </p>
                </div>
              </div>

              {overBudgetRequests.length > 0 ? (
                <div className="space-y-4">
                  {overBudgetRequests.map((request) => {
                    const budget = getDepartmentBudget(request.department);
                    return (
                      <div key={request.id} className="rounded-xl border border-status-error/30 bg-card overflow-hidden">
                        {/* Header */}
                        <div className="p-4 bg-status-error-bg border-b border-status-error/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-status-error" />
                                <span className="text-xs font-medium text-status-error uppercase">Over-Budget Exception</span>
                              </div>
                              <h3 className="text-lg font-semibold mt-1">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Requested by {request.requesterName} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} ago
                              </p>
                            </div>
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                              request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                            </span>
                          </div>
                        </div>

                        {/* Budget Details */}
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-muted-foreground">Department</span>
                              <p className="font-medium">{getDepartmentLabel(request.department)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Amount Requested</span>
                              <p className="font-semibold">{formatCurrency(request.budgetedAmount)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Budget Shortfall</span>
                              <p className="font-semibold text-status-error">-{formatCurrency(request.shortfall)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Budget Status</span>
                              <p className="font-semibold text-status-error">{request.budgetSpentPercentage}% spent</p>
                            </div>
                          </div>

                          {/* Department Budget Summary */}
                          {budget && (
                            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                              <p className="text-sm font-medium">Department Budget Status</p>
                              <div className="grid grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground">Annual Budget</span>
                                  <p className="font-medium">{formatCurrency(budget.totalBudget)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Spent to Date</span>
                                  <p className="font-medium">{formatCurrency(budget.spentToDate)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Remaining</span>
                                  <p className="font-medium text-status-success">{formatCurrency(budget.remaining)}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">After Approval</span>
                                  <p className="font-medium text-status-error">{formatCurrency(budget.remaining - request.budgetedAmount)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Requester Justification */}
                          <div className="p-3 rounded-lg bg-muted/30 border">
                            <p className="text-sm font-medium mb-2">Requester Justification</p>
                            <p className="text-sm text-muted-foreground">{request.justification}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <Button variant="outline" className="gap-2">
                              <Users className="w-4 h-4" />
                              Contact Dept Head
                            </Button>
                            <Button variant="default" className="gap-2 bg-status-success hover:bg-status-success/90">
                              Approve Exception
                            </Button>
                            <Button variant="outline" className="gap-2">
                              <RefreshCcw className="w-4 h-4" />
                              Request Reallocation
                            </Button>
                            <Button variant="outline" className="gap-2 text-status-error hover:text-status-error">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No over-budget exceptions pending review
                </div>
              )}
            </div>
          ) : currentView === 'multiyear' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-warning-bg border border-status-warning/30 flex items-start gap-3">
                <RefreshCcw className="w-5 h-5 text-status-warning mt-0.5" />
                <div>
                  <p className="font-semibold text-status-warning">🔄 Multi-Year Commitments Requiring Finance Review</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These requests involve multi-year contract terms and require Finance approval regardless of annual cost.
                  </p>
                </div>
              </div>

              {multiYearRequests.length > 0 ? (
                <div className="space-y-4">
                  {multiYearRequests.map((request) => (
                    <div key={request.id} className={cn(
                      "rounded-xl border bg-card overflow-hidden",
                      request.isLowAnnual ? "border-status-warning/50" : "border-border"
                    )}>
                      {/* Header */}
                      <div className={cn(
                        "p-4 border-b",
                        request.isLowAnnual ? "bg-status-warning-bg border-status-warning/20" : "bg-muted/30"
                      )}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <RefreshCcw className="w-4 h-4 text-status-warning" />
                              <span className="text-xs font-medium text-status-warning uppercase">
                                {request.contractYears}-Year Commitment
                              </span>
                              {request.isLowAnnual && (
                                <span className="text-xs bg-status-warning/20 text-status-warning px-2 py-0.5 rounded-full">
                                  Annual &lt;$10K
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mt-1">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {request.requesterName} • {request.daysInQueue} day{request.daysInQueue !== 1 ? 's' : ''} ago
                            </p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            request.urgency === 'critical' ? "bg-status-error/20 text-status-error" :
                            request.urgency === 'high' ? "bg-status-warning/20 text-status-warning" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Department</span>
                            <p className="font-medium">{getDepartmentLabel(request.department)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Annual Cost</span>
                            <p className="font-semibold">{formatCurrency(request.annualCost)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Contract Term</span>
                            <p className="font-semibold">{request.contractYears} years</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">TOTAL COMMITMENT</span>
                            <p className="font-bold text-lg text-status-warning">{formatCurrency(request.totalCommitment)}</p>
                          </div>
                        </div>

                        {/* Special Note for Low Annual */}
                        {request.isLowAnnual && (
                          <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-sm">
                            <p className="text-muted-foreground">
                              <strong className="text-status-warning">⚠️ Low annual but multi-year:</strong> {formatCurrency(request.annualCost)}/year × {request.contractYears} years = {formatCurrency(request.totalCommitment)} total commitment.
                              Requires Finance review due to multi-year term even though annual cost is under $10K.
                            </p>
                          </div>
                        )}

                        {/* Commitment Breakdown */}
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-sm font-medium mb-2">Commitment Breakdown</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatCurrency(request.annualCost)}</span>
                            <span>×</span>
                            <span>{request.contractYears} years</span>
                            <span>=</span>
                            <span className="font-bold text-foreground">{formatCurrency(request.totalCommitment)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button variant="outline" className="gap-2">
                            <Users className="w-4 h-4" />
                            Contact Dept Head
                          </Button>
                          <Button variant="default" className="gap-2 bg-status-success hover:bg-status-success/90">
                            Approve Commitment
                          </Button>
                          <Button variant="outline" className="gap-2">
                            Request Shorter Term
                          </Button>
                          <Button variant="outline" className="gap-2 text-status-error hover:text-status-error">
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No multi-year commitments pending review
                </div>
              )}
            </div>
          ) : currentView === 'finance-auto' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-status-success-bg border border-status-success/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-success mt-0.5" />
                <div>
                  <p className="font-semibold text-status-success">✅ Auto-Approved This Week (FYI Only)</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    These requests met auto-approval criteria (&lt;$10K, within budget, single-year). 
                    No action needed, but you can "Jump In" to add review if concerned.
                  </p>
                </div>
              </div>

              {autoApprovedRequests.length > 0 ? (
                <div className="space-y-4">
                  {autoApprovedRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-status-success/30 bg-card overflow-hidden">
                      {/* Header */}
                      <div className="p-4 bg-status-success-bg/50 border-b border-status-success/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-status-success" />
                              <span className="text-xs font-medium text-status-success uppercase">Auto-Approved</span>
                              <span className="text-xs text-muted-foreground">
                                {request.approvedAt}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold mt-1">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {request.requesterName}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-status-success">
                            {formatCurrency(request.amount)}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Department</span>
                            <p className="font-medium">{getDepartmentLabel(request.department)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Amount</span>
                            <p className="font-semibold">{formatCurrency(request.amount)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Status</span>
                            <p className="text-sm text-status-success font-medium">Within budget, &lt;$10K</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Term</span>
                            <p className="font-medium">Single-year</p>
                          </div>
                        </div>

                        {/* Auto-approval criteria */}
                        <div className="p-3 rounded-lg bg-status-success/5 border border-status-success/20 text-sm">
                          <p className="font-medium text-status-success mb-2">Auto-Approval Criteria Met:</p>
                          <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                              <span>&lt;$10K</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                              <span>Within budget</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                              <span>Single-year</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                            <Plus className="w-4 h-4" />
                            Add Finance Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No auto-approved requests this week
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request list */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="needs_info">Needs Info</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgency">Urgency</SelectItem>
                      <SelectItem value="amount-high">Amount (High)</SelectItem>
                      <SelectItem value="amount-low">Amount (Low)</SelectItem>
                      <SelectItem value="days">Days Waiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Context message for filtered views */}
                {(currentView === 'it' || currentView === 'negotiation' || currentView === 'department' || currentView === 'finance' || currentView === 'contracting') && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {currentView === 'it' && (
                      <>Showing new purchase requests requiring IT review. Renewals skip this step.</>
                    )}
                    {currentView === 'negotiation' && (
                      <>Showing requests over $25,000 requiring Director of Operations negotiation review.</>
                    )}
                    {currentView === 'department' && (
                      <>Showing requests pending department pre-approval or re-approval after negotiation.</>
                    )}
                    {currentView === 'finance' && (
                      <>Showing requests pending final finance approval.</>
                    )}
                    {currentView === 'contracting' && (
                      <>Showing approved requests awaiting contract signature.</>
                    )}
                  </div>
                )}

                {/* Request cards */}
                <div className="space-y-3">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <div key={request.id} className="relative">
                        <RequestCard request={request} />
                        <div className="absolute top-3 right-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">
                            {getStepLabel(request.currentStep)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {currentView === 'all' 
                        ? "No requests match your filters"
                        : `No requests pending ${viewTabs.find(t => t.value === currentView)?.label.toLowerCase()}`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* CIO Alert */}
                {cioRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-error/30 bg-status-error-bg p-4 cursor-pointer hover:bg-status-error/10 transition-colors"
                    onClick={() => setCurrentView('cio')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-error/20">
                        <ShieldAlert className="w-5 h-5 text-status-error" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-error">
                          🚨 {cioRequests.length} CIO Review{cioRequests.length !== 1 ? 's' : ''} Required
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Strategic purchases: {formatCurrency(cioRequests.reduce((sum, r) => sum + r.amount, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Over-Budget Alert */}
                {overBudgetRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-error/30 bg-status-error-bg p-4 cursor-pointer hover:bg-status-error/10 transition-colors"
                    onClick={() => setCurrentView('overbudget')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-error/20">
                        <AlertTriangle className="w-5 h-5 text-status-error" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-error">
                          💰 {overBudgetRequests.length} Over-Budget Exception{overBudgetRequests.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total shortfall: {formatCurrency(overBudgetRequests.reduce((sum, r) => sum + r.shortfall, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Year Commitments Alert */}
                {multiYearRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-4 cursor-pointer hover:bg-status-warning/10 transition-colors"
                    onClick={() => setCurrentView('multiyear')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-warning/20">
                        <RefreshCcw className="w-5 h-5 text-status-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-warning">
                          🔄 {multiYearRequests.length} Multi-Year Commitment{multiYearRequests.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(multiYearRequests.reduce((sum, r) => sum + r.totalCommitment, 0))}
                          {multiYearRequests.some(r => r.isLowAnnual) && (
                            <span className="ml-1 text-status-warning">
                              • {multiYearRequests.filter(r => r.isLowAnnual).length} with annual &lt;$10K
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Approved This Week */}
                {autoApprovedRequests.length > 0 && (
                  <div 
                    className="rounded-xl border border-status-success/30 bg-status-success-bg p-4 cursor-pointer hover:bg-status-success/10 transition-colors"
                    onClick={() => setCurrentView('finance-auto')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-status-success/20">
                        <CheckCircle2 className="w-5 h-5 text-status-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-status-success">
                          ✅ {autoApprovedRequests.length} Auto-Approved
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(autoApprovedRequests.reduce((sum, r) => sum + r.amount, 0))} this week
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spend Pipeline */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Spend Pipeline</h3>
                  <div className="space-y-4">
                    <BudgetWidget 
                      label="Q1 Approved" 
                      spent={412000} 
                      total={800000} 
                    />
                    <BudgetWidget 
                      label="Q1 Pipeline" 
                      spent={totalPendingAmount} 
                      total={800000 - 412000} 
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>YTD Savings</span>
                      <span className="font-semibold text-status-success">{formatCurrency(totalSavings)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats by Step */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">By Approval Step</h3>
                  <div className="space-y-3">
                    {viewTabs.slice(1).map((tab) => (
                      <div 
                        key={tab.value} 
                        className={cn(
                          "flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded",
                          tab.highlight && tab.count > 0 && "text-status-error"
                        )}
                        onClick={() => setCurrentView(tab.value)}
                      >
                        <span className="flex items-center gap-2">
                          <tab.icon className="w-4 h-4 text-muted-foreground" />
                          {tab.label}
                        </span>
                        <span className="font-semibold">{tab.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats by Category */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">By Category</h3>
                  <div className="space-y-3">
                    {['saas', 'hardware', 'services'].map((cat) => {
                      const catRequests = pendingRequests.filter(r => r.category === cat);
                      const catAmount = catRequests.reduce((sum, r) => sum + r.budgetedAmount, 0);
                      return (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{cat}</span>
                          <div className="text-right">
                            <span className="font-semibold">{catRequests.length}</span>
                            <span className="text-muted-foreground ml-2">
                              ({formatCurrency(catAmount)})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Approvals;
