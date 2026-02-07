// Mock data for Procure - Procurement Management Platform (Deerfield Workflow)

// ============= USER TYPES =============
export type UserRole = 
  | 'requester' 
  | 'department_leader' 
  | 'compliance' 
  | 'it' 
  | 'director_operations' 
  | 'finance' 
  | 'legal'
  | 'cio'
  | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: Department;
  isDepartmentLeader: boolean;
  avatar?: string;
}

// ============= DEPARTMENT TYPES =============
export type Department = 
  | 'investment'
  | '3dc'
  | 'deerfield_intelligence'
  | 'business_operations'
  | 'external_operations'
  | 'deerfield_foundation';

export type SubDepartment = 
  | 'ai_investment_systems_pod'
  | 'portfolio_enablement_pod';

export interface DepartmentBudget {
  department: Department;
  totalBudget: number;
  spentToDate: number;
  remaining: number;
}

// ============= REQUEST TYPES =============
export type RequestType = 'new_purchase' | 'renewal';
export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_info';
export type RequestCategory = 'saas' | 'hardware' | 'services' | 'other';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStep = 
  | 'intake'
  | 'requirements'
  | 'department_pre_approval'
  | 'compliance_it_review'
  | 'negotiation'
  | 'finance_final_approval'
  | 'department_final_approval'
  | 'contracting';

export interface PurchaseRequest {
  id: string;
  // Step 1: Initial Intake
  title: string;
  description: string;
  requestType: RequestType;
  category: RequestCategory;
  department: Department;
  subDepartment?: SubDepartment;
  licensesSeatsCount?: number; // For SaaS only
  redundancyCheckConfirmed: boolean;
  
  // Step 2: Requirements Gathering
  documentationUrls?: string[];
  targetSignDate?: string;
  budgetedAmount: number;
  
  // Request metadata
  status: RequestStatus;
  urgency: Urgency;
  businessJustification: string;
  requesterId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
  
  // Negotiation tracking (Step 5)
  originalAmount: number;
  negotiatedAmount?: number;
  priceChanged: boolean;
  negotiationNotes?: string;
  savingsAchieved?: number;
  
  // Approval workflow
  currentStep: ApprovalStep;
  approvalStage: number;
  totalStages: number;
  daysInCurrentStage: number;
  
  // Parallel approval tracking
  complianceApproved?: boolean;
  itApproved?: boolean;
  financeApproved?: boolean;
  departmentFinalApproved?: boolean;
  
  // Linked entities
  vendorId?: string;
  contractId?: string;
}

// ============= APPROVAL TYPES =============
export interface Approval {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  approvalStep: ApprovalStep;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments: string | null;
  timestamp: string;
  isConditional: boolean;
  conditionsMet: boolean;
}

// ============= CONTRACT TYPES =============
export interface Contract {
  id: string;
  requestId: string;
  vendorId: string;
  vendorName: string;
  contractStartDate: string;
  contractEndDate: string;
  contractTermMonths: number;
  signedDate: string;
  signedByUserId: string;
  signedByUserName: string;
  renewalAlertDate: string; // 90 days before end
  renewalInitiated: boolean;
  contractDocumentUrl?: string;
  annualValue: number;
}

// ============= VENDOR TYPES =============
export type VendorStatus = 'active' | 'inactive' | 'pending';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  ownerId: string;
  ownerName: string;
  contractStart: string;
  contractEnd: string;
  annualSpend: number;
  autoRenew: boolean;
  status: VendorStatus;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isPreApproved: boolean; // Pre-approved vendors get streamlined review
}

// ============= RENEWAL TYPES =============
export type ReviewStatus = 'pending' | 'in_review' | 'completed' | 'overdue';
export type RenewalRecommendation = 'renew' | 'renegotiate' | 'replace' | 'cancel';

export interface Renewal {
  id: string;
  vendorId: string;
  vendorName: string;
  renewalDate: string;
  reviewStatus: ReviewStatus;
  usageRate: number;
  recommendation: RenewalRecommendation | null;
  amount: number;
  createdBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  // Deerfield-specific
  daysUntilExpiration: number;
  alertSent: boolean;
  currentLicenses?: number;
  // Role-based access fields
  ownerId: string;
  department: Department;
  requiresCompliance: boolean;
  requiresIt: boolean;
  hasPhi: boolean;
  hasInvestmentData: boolean;
  hasIntegration: boolean;
}

// ============= WORKFLOW TYPES =============
export interface WorkflowStep {
  id: string;
  stepType: ApprovalStep;
  role: UserRole | UserRole[]; // Can be parallel (array)
  slaDays: number;
  escalationDays: number;
  isConditional: boolean;
  condition?: 'amount_over_25k' | 'new_purchase_only' | 'price_changed';
}

export interface Workflow {
  id: string;
  name: string;
  requestType: RequestType;
  category: RequestCategory;
  minAmount: number;
  maxAmount: number | null;
  approvalSteps: WorkflowStep[];
}

// ============= DEPARTMENT DATA =============
export const departments: { value: Department; label: string }[] = [
  { value: 'investment', label: 'Investment' },
  { value: '3dc', label: '3DC' },
  { value: 'deerfield_intelligence', label: 'Deerfield Intelligence' },
  { value: 'business_operations', label: 'Business Operations' },
  { value: 'external_operations', label: 'External Operations' },
  { value: 'deerfield_foundation', label: 'Deerfield Foundation' },
];

export const subDepartments: { value: SubDepartment; label: string }[] = [
  { value: 'ai_investment_systems_pod', label: 'AI Investment Systems Pod' },
  { value: 'portfolio_enablement_pod', label: 'Portfolio Enablement Pod' },
];

export const departmentBudgets: DepartmentBudget[] = [
  { department: 'investment', totalBudget: 500000, spentToDate: 320000, remaining: 180000 },
  { department: '3dc', totalBudget: 350000, spentToDate: 180000, remaining: 170000 },
  { department: 'deerfield_intelligence', totalBudget: 750000, spentToDate: 420000, remaining: 330000 },
  { department: 'business_operations', totalBudget: 400000, spentToDate: 250000, remaining: 150000 },
  { department: 'external_operations', totalBudget: 200000, spentToDate: 95000, remaining: 105000 },
  { department: 'deerfield_foundation', totalBudget: 150000, spentToDate: 45000, remaining: 105000 },
];

// ============= DEMO USERS =============
// Users can have a primary role but may also act as requesters when acquiring products/services
export const users: User[] = [
  // Pure requesters (3 different requesters for demo)
  { id: '1', email: 'requester1@demo.com', name: 'Alex Johnson', role: 'requester', department: 'business_operations', isDepartmentLeader: false },
  { id: '9', email: 'requester2@demo.com', name: 'Jordan Smith', role: 'requester', department: 'investment', isDepartmentLeader: false },
  { id: '10', email: 'requester3@demo.com', name: 'Casey Williams', role: 'requester', department: 'deerfield_intelligence', isDepartmentLeader: false },
  // Leadership roles (can also act as requesters)
  { id: '2', email: 'finance@demo.com', name: 'Sarah Chen', role: 'finance', department: 'business_operations', isDepartmentLeader: false },
  { id: '3', email: 'ops@demo.com', name: 'Mike Wilson', role: 'director_operations', department: 'business_operations', isDepartmentLeader: false },
  { id: '4', email: 'it@demo.com', name: 'Emily Brown', role: 'it', department: 'deerfield_intelligence', isDepartmentLeader: false },
  { id: '5', email: 'compliance@demo.com', name: 'David Lee', role: 'compliance', department: 'business_operations', isDepartmentLeader: false },
  { id: '6', email: 'admin@demo.com', name: 'Chris Taylor', role: 'admin', department: 'business_operations', isDepartmentLeader: true },
  { id: '7', email: 'dept_leader@demo.com', name: 'Lisa Park', role: 'department_leader', department: 'deerfield_intelligence', isDepartmentLeader: true },
  { id: '8', email: 'cio@demo.com', name: 'Robert Martinez', role: 'cio', department: 'deerfield_intelligence', isDepartmentLeader: false },
];

// Current user state for demo purposes (allows role switching)
let currentUserIndex = 0;

export const setCurrentUserByRole = (role: UserRole): void => {
  const userIndex = users.findIndex(u => u.role === role);
  if (userIndex !== -1) {
    currentUserIndex = userIndex;
  }
};

export const getCurrentUser = (): User => users[currentUserIndex];

// ============= SAMPLE REQUESTS (Updated for Deerfield workflow) =============
export const requests: PurchaseRequest[] = [
  {
    id: 'REQ-001',
    title: 'Figma Enterprise License',
    description: 'Annual enterprise license for Figma design tool for the design team',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'deerfield_intelligence',
    subDepartment: 'ai_investment_systems_pod',
    licensesSeatsCount: 25,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-15',
    budgetedAmount: 45000,
    status: 'pending',
    urgency: 'medium',
    businessJustification: 'Current Figma licenses expire next month. Enterprise tier enables SSO and admin controls.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    originalAmount: 45000,
    priceChanged: false,
    currentStep: 'finance_final_approval',
    approvalStage: 6,
    totalStages: 7,
    daysInCurrentStage: 2,
    complianceApproved: true,
    itApproved: true,
  },
  {
    id: 'REQ-002',
    title: 'MacBook Pro M3 (x10)',
    description: 'New MacBook Pro laptops for engineering team expansion',
    requestType: 'new_purchase',
    category: 'hardware',
    department: 'deerfield_intelligence',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-20',
    budgetedAmount: 35000,
    status: 'pending',
    urgency: 'high',
    businessJustification: 'New engineering hires starting next month need development machines.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    originalAmount: 35000,
    negotiatedAmount: 31500,
    priceChanged: true,
    savingsAchieved: 3500,
    negotiationNotes: 'Negotiated 10% volume discount with Apple Business team.',
    currentStep: 'department_final_approval',
    approvalStage: 6,
    totalStages: 7,
    daysInCurrentStage: 1,
    complianceApproved: true,
    itApproved: true,
    financeApproved: true,
  },
  {
    id: 'REQ-003',
    title: 'Salesforce CRM Expansion',
    description: 'Additional Salesforce licenses and Sales Cloud features',
    requestType: 'renewal',
    category: 'saas',
    department: 'investment',
    licensesSeatsCount: 90,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-28',
    budgetedAmount: 125000,
    status: 'pending',
    urgency: 'medium',
    businessJustification: 'Sales team growing 40% this year, need additional licenses and advanced analytics.',
    requesterId: '9',
    requesterName: 'Jordan Smith',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    originalAmount: 125000,
    priceChanged: false,
    currentStep: 'negotiation',
    approvalStage: 5,
    totalStages: 6, // Renewals skip compliance/IT
    daysInCurrentStage: 5,
    vendorId: 'VEN-001',
  },
  {
    id: 'REQ-004',
    title: 'AWS Reserved Instances',
    description: 'Annual reserved instances for production workloads',
    requestType: 'renewal',
    category: 'services',
    department: 'deerfield_intelligence',
    subDepartment: 'portfolio_enablement_pod',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-31',
    budgetedAmount: 89000,
    status: 'approved',
    urgency: 'low',
    businessJustification: 'Reserved instances save 35% vs on-demand pricing.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    originalAmount: 89000,
    negotiatedAmount: 75650,
    priceChanged: true,
    savingsAchieved: 13350,
    negotiationNotes: 'Locked in 3-year commit for additional 15% savings.',
    currentStep: 'contracting',
    approvalStage: 6,
    totalStages: 6,
    daysInCurrentStage: 0,
    financeApproved: true,
    departmentFinalApproved: true,
    vendorId: 'VEN-002',
    contractId: 'CON-001',
  },
  {
    id: 'REQ-005',
    title: 'Slack Enterprise Grid',
    description: 'Upgrade to Slack Enterprise Grid for enhanced security',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'business_operations',
    licensesSeatsCount: 150,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-15',
    budgetedAmount: 28000,
    status: 'approved',
    urgency: 'medium',
    businessJustification: 'Enterprise Grid provides HIPAA compliance needed for healthcare clients.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    originalAmount: 28000,
    priceChanged: false,
    currentStep: 'contracting',
    approvalStage: 7,
    totalStages: 7,
    daysInCurrentStage: 0,
    complianceApproved: true,
    itApproved: true,
    financeApproved: true,
    contractId: 'CON-002',
  },
  {
    id: 'REQ-006',
    title: 'Consulting - Security Audit',
    description: 'External security audit and penetration testing',
    requestType: 'new_purchase',
    category: 'services',
    department: '3dc',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-01',
    budgetedAmount: 55000,
    status: 'needs_info',
    urgency: 'high',
    businessJustification: 'Annual security audit required for SOC 2 compliance.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    originalAmount: 55000,
    priceChanged: false,
    currentStep: 'compliance_it_review',
    approvalStage: 4,
    totalStages: 7,
    daysInCurrentStage: 4,
    complianceApproved: true,
    itApproved: false,
  },
  {
    id: 'REQ-007',
    title: 'HubSpot Marketing Hub',
    description: 'Marketing automation platform subscription',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'external_operations',
    licensesSeatsCount: 10,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-20',
    budgetedAmount: 18000,
    status: 'approved',
    urgency: 'low',
    businessJustification: 'Replace current email marketing tools with integrated solution.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z',
    originalAmount: 18000,
    priceChanged: false,
    currentStep: 'contracting',
    approvalStage: 7,
    totalStages: 7,
    daysInCurrentStage: 0,
    complianceApproved: true,
    itApproved: true,
    financeApproved: true,
    contractId: 'CON-003',
  },
  {
    id: 'REQ-008',
    title: 'Office Furniture - Standing Desks',
    description: '20 adjustable standing desks for new office space',
    requestType: 'new_purchase',
    category: 'hardware',
    department: 'business_operations',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-28',
    budgetedAmount: 15000,
    status: 'pending',
    urgency: 'low',
    businessJustification: 'Ergonomic workstations for employee wellness initiative.',
    requesterId: '3',
    requesterName: 'Mike Wilson',
    createdAt: '2024-01-17T15:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    originalAmount: 15000,
    priceChanged: false,
    currentStep: 'department_pre_approval',
    approvalStage: 3,
    totalStages: 7,
    daysInCurrentStage: 1,
  },
  {
    id: 'REQ-009',
    title: 'Notion Team Workspace',
    description: 'Notion Team plan for documentation and wikis',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'deerfield_foundation',
    licensesSeatsCount: 20,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-25',
    budgetedAmount: 4800,
    status: 'approved',
    urgency: 'medium',
    businessJustification: 'Centralize team documentation and reduce tool sprawl.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    originalAmount: 4800,
    priceChanged: false,
    currentStep: 'contracting',
    approvalStage: 7,
    totalStages: 7,
    daysInCurrentStage: 0,
    complianceApproved: true,
    itApproved: true,
    financeApproved: true,
    contractId: 'CON-004',
  },
  {
    id: 'REQ-010',
    title: 'Legal Review - Vendor Contract',
    description: 'External legal review for major vendor agreement',
    requestType: 'new_purchase',
    category: 'services',
    department: 'business_operations',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-15',
    budgetedAmount: 8500,
    status: 'needs_info',
    urgency: 'medium',
    businessJustification: 'Complex multi-year contract needs specialized legal review.',
    requesterId: '5',
    requesterName: 'David Lee',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    originalAmount: 8500,
    priceChanged: false,
    currentStep: 'requirements',
    approvalStage: 2,
    totalStages: 7,
    daysInCurrentStage: 3,
  },
  {
    id: 'REQ-011',
    title: 'Zoom Webinar Add-on',
    description: 'Zoom Webinar for up to 500 attendees',
    requestType: 'renewal',
    category: 'saas',
    department: 'deerfield_intelligence',
    licensesSeatsCount: 5,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-30',
    budgetedAmount: 3200,
    status: 'approved',
    urgency: 'high',
    businessJustification: 'Product launch webinar scheduled for next month.',
    requesterId: '10',
    requesterName: 'Casey Williams',
    createdAt: '2024-01-11T08:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    originalAmount: 3200,
    priceChanged: false,
    currentStep: 'contracting',
    approvalStage: 6,
    totalStages: 6,
    daysInCurrentStage: 0,
    financeApproved: true,
    vendorId: 'VEN-005',
    contractId: 'CON-005',
  },
  {
    id: 'REQ-012',
    title: 'DataDog Monitoring',
    description: 'Infrastructure monitoring and APM solution',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'deerfield_intelligence',
    subDepartment: 'ai_investment_systems_pod',
    licensesSeatsCount: 50,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-02-10',
    budgetedAmount: 72000,
    status: 'pending',
    urgency: 'high',
    businessJustification: 'Current monitoring gaps causing extended incident response times.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    originalAmount: 72000,
    priceChanged: false,
    currentStep: 'compliance_it_review',
    approvalStage: 4,
    totalStages: 7,
    daysInCurrentStage: 2,
    complianceApproved: false,
    itApproved: false,
  },
  {
    id: 'REQ-013',
    title: 'Conference Booth - SaaStr',
    description: 'Exhibition booth at SaaStr Annual conference',
    requestType: 'new_purchase',
    category: 'services',
    department: 'external_operations',
    redundancyCheckConfirmed: false,
    budgetedAmount: 45000,
    status: 'draft',
    urgency: 'medium',
    businessJustification: 'Major lead generation opportunity with 15,000+ attendees.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    originalAmount: 45000,
    priceChanged: false,
    currentStep: 'intake',
    approvalStage: 1,
    totalStages: 7,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-014',
    title: 'GitHub Enterprise',
    description: 'GitHub Enterprise Cloud for enhanced security',
    requestType: 'new_purchase',
    category: 'saas',
    department: 'deerfield_intelligence',
    subDepartment: 'portfolio_enablement_pod',
    licensesSeatsCount: 40,
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-01-30',
    budgetedAmount: 21000,
    status: 'rejected',
    urgency: 'low',
    businessJustification: 'Advanced security features and SAML SSO.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    createdAt: '2024-01-04T09:00:00Z',
    updatedAt: '2024-01-09T14:00:00Z',
    originalAmount: 21000,
    priceChanged: false,
    currentStep: 'compliance_it_review',
    approvalStage: 4,
    totalStages: 7,
    daysInCurrentStage: 0,
    complianceApproved: false,
    itApproved: false,
  },
  {
    id: 'REQ-015',
    title: 'Employee Training - Leadership',
    description: 'Executive leadership training program',
    requestType: 'new_purchase',
    category: 'services',
    department: 'business_operations',
    redundancyCheckConfirmed: true,
    targetSignDate: '2024-03-01',
    budgetedAmount: 32000,
    status: 'needs_info',
    urgency: 'low',
    businessJustification: 'Develop next generation of managers.',
    requesterId: '6',
    requesterName: 'Chris Taylor',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    originalAmount: 32000,
    priceChanged: false,
    currentStep: 'negotiation',
    approvalStage: 5,
    totalStages: 7,
    daysInCurrentStage: 4,
    complianceApproved: true,
    itApproved: true,
  },
];

// ============= SAMPLE CONTRACTS =============
export const contracts: Contract[] = [
  {
    id: 'CON-001',
    requestId: 'REQ-004',
    vendorId: 'VEN-002',
    vendorName: 'Amazon Web Services',
    contractStartDate: '2024-01-15',
    contractEndDate: '2027-01-14',
    contractTermMonths: 36,
    signedDate: '2024-01-12',
    signedByUserId: '2',
    signedByUserName: 'Sarah Chen',
    renewalAlertDate: '2026-10-16',
    renewalInitiated: false,
    annualValue: 75650,
  },
  {
    id: 'CON-002',
    requestId: 'REQ-005',
    vendorId: 'VEN-003',
    vendorName: 'Slack Technologies',
    contractStartDate: '2024-01-15',
    contractEndDate: '2025-01-14',
    contractTermMonths: 12,
    signedDate: '2024-01-10',
    signedByUserId: '2',
    signedByUserName: 'Sarah Chen',
    renewalAlertDate: '2024-10-16',
    renewalInitiated: false,
    annualValue: 28000,
  },
  {
    id: 'CON-003',
    requestId: 'REQ-007',
    vendorId: 'VEN-006',
    vendorName: 'HubSpot',
    contractStartDate: '2024-01-20',
    contractEndDate: '2025-01-19',
    contractTermMonths: 12,
    signedDate: '2024-01-08',
    signedByUserId: '2',
    signedByUserName: 'Sarah Chen',
    renewalAlertDate: '2024-10-21',
    renewalInitiated: false,
    annualValue: 18000,
  },
  {
    id: 'CON-004',
    requestId: 'REQ-009',
    vendorId: 'VEN-008',
    vendorName: 'Notion Labs',
    contractStartDate: '2024-01-25',
    contractEndDate: '2025-01-24',
    contractTermMonths: 12,
    signedDate: '2024-01-10',
    signedByUserId: '2',
    signedByUserName: 'Sarah Chen',
    renewalAlertDate: '2024-10-26',
    renewalInitiated: false,
    annualValue: 4800,
  },
  {
    id: 'CON-005',
    requestId: 'REQ-011',
    vendorId: 'VEN-005',
    vendorName: 'Zoom Video Communications',
    contractStartDate: '2024-01-30',
    contractEndDate: '2025-01-29',
    contractTermMonths: 12,
    signedDate: '2024-01-12',
    signedByUserId: '2',
    signedByUserName: 'Sarah Chen',
    renewalAlertDate: '2024-10-31',
    renewalInitiated: false,
    annualValue: 3200,
  },
];

// ============= SAMPLE VENDORS =============
export const vendors: Vendor[] = [
  {
    id: 'VEN-001',
    name: 'Salesforce',
    category: 'CRM',
    ownerId: '1',
    ownerName: 'Alex Johnson',
    contractStart: '2023-03-01',
    contractEnd: '2024-02-28',
    annualSpend: 125000,
    autoRenew: true,
    status: 'active',
    website: 'https://salesforce.com',
    contactEmail: 'enterprise@salesforce.com',
    isPreApproved: true,
  },
  {
    id: 'VEN-002',
    name: 'Amazon Web Services',
    category: 'Cloud Infrastructure',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2024-01-15',
    contractEnd: '2027-01-14',
    annualSpend: 75650,
    autoRenew: true,
    status: 'active',
    website: 'https://aws.amazon.com',
    contactEmail: 'aws-support@amazon.com',
    isPreApproved: true,
  },
  {
    id: 'VEN-003',
    name: 'Slack Technologies',
    category: 'Communication',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2024-01-15',
    contractEnd: '2025-01-14',
    annualSpend: 28000,
    autoRenew: true,
    status: 'active',
    website: 'https://slack.com',
    contactEmail: 'enterprise@slack.com',
    isPreApproved: true,
  },
  {
    id: 'VEN-004',
    name: 'Figma Inc',
    category: 'Design Tools',
    ownerId: '1',
    ownerName: 'Alex Johnson',
    contractStart: '2023-02-15',
    contractEnd: '2024-02-14',
    annualSpend: 45000,
    autoRenew: false,
    status: 'active',
    website: 'https://figma.com',
    contactEmail: 'sales@figma.com',
    isPreApproved: false,
  },
  {
    id: 'VEN-005',
    name: 'Zoom Video Communications',
    category: 'Video Conferencing',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2024-01-30',
    contractEnd: '2025-01-29',
    annualSpend: 3200,
    autoRenew: true,
    status: 'active',
    website: 'https://zoom.us',
    contactEmail: 'sales@zoom.us',
    isPreApproved: true,
  },
  {
    id: 'VEN-006',
    name: 'HubSpot',
    category: 'Marketing Automation',
    ownerId: '1',
    ownerName: 'Alex Johnson',
    contractStart: '2024-01-20',
    contractEnd: '2025-01-19',
    annualSpend: 18000,
    autoRenew: true,
    status: 'active',
    website: 'https://hubspot.com',
    contactEmail: 'enterprise@hubspot.com',
    isPreApproved: false,
  },
  {
    id: 'VEN-007',
    name: 'Okta',
    category: 'Identity & Access',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2023-09-01',
    contractEnd: '2024-08-31',
    annualSpend: 36000,
    autoRenew: true,
    status: 'active',
    website: 'https://okta.com',
    contactEmail: 'sales@okta.com',
    isPreApproved: false,
  },
  {
    id: 'VEN-008',
    name: 'Notion Labs',
    category: 'Productivity',
    ownerId: '3',
    ownerName: 'Mike Wilson',
    contractStart: '2024-01-25',
    contractEnd: '2025-01-24',
    annualSpend: 4800,
    autoRenew: true,
    status: 'active',
    website: 'https://notion.so',
    contactEmail: 'team@notion.so',
    isPreApproved: false,
  },
  {
    id: 'VEN-009',
    name: 'Workday',
    category: 'HR Software',
    ownerId: '6',
    ownerName: 'Chris Taylor',
    contractStart: '2023-01-01',
    contractEnd: '2024-12-31',
    annualSpend: 95000,
    autoRenew: false,
    status: 'active',
    website: 'https://workday.com',
    contactEmail: 'sales@workday.com',
    isPreApproved: false,
  },
  {
    id: 'VEN-010',
    name: 'Intercom',
    category: 'Customer Support',
    ownerId: '1',
    ownerName: 'Alex Johnson',
    contractStart: '2023-05-01',
    contractEnd: '2024-04-30',
    annualSpend: 24000,
    autoRenew: true,
    status: 'active',
    website: 'https://intercom.com',
    contactEmail: 'sales@intercom.io',
    isPreApproved: false,
  },
];

// ============= SAMPLE RENEWALS =============
export const renewals: Renewal[] = [
  {
    id: 'REN-001',
    vendorId: 'VEN-004',
    vendorName: 'Figma Inc',
    renewalDate: '2024-02-14',
    reviewStatus: 'overdue',
    usageRate: 92,
    recommendation: null,
    amount: 45000,
    createdBy: '1',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: -5,
    alertSent: true,
    currentLicenses: 25,
    ownerId: '1',
    department: 'business_operations',
    requiresCompliance: false,
    requiresIt: true,
    hasPhi: false,
    hasInvestmentData: false,
    hasIntegration: true,
  },
  {
    id: 'REN-002',
    vendorId: 'VEN-001',
    vendorName: 'Salesforce',
    renewalDate: '2024-02-28',
    reviewStatus: 'in_review',
    usageRate: 78,
    recommendation: 'renegotiate',
    amount: 125000,
    createdBy: '1',
    reviewedBy: '2',
    reviewedAt: null,
    daysUntilExpiration: 10,
    alertSent: true,
    currentLicenses: 90,
    ownerId: '1',
    department: 'business_operations',
    requiresCompliance: true,
    requiresIt: true,
    hasPhi: false,
    hasInvestmentData: true,
    hasIntegration: true,
  },
  {
    id: 'REN-003',
    vendorId: 'VEN-005',
    vendorName: 'Zoom Video Communications',
    renewalDate: '2025-01-29',
    reviewStatus: 'pending',
    usageRate: 88,
    recommendation: null,
    amount: 3200,
    createdBy: '4',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: 345,
    alertSent: false,
    currentLicenses: 5,
    ownerId: '4',
    department: 'deerfield_intelligence',
    requiresCompliance: false,
    requiresIt: false,
    hasPhi: false,
    hasInvestmentData: false,
    hasIntegration: false,
  },
  {
    id: 'REN-004',
    vendorId: 'VEN-010',
    vendorName: 'Intercom',
    renewalDate: '2024-04-30',
    reviewStatus: 'pending',
    usageRate: 65,
    recommendation: null,
    amount: 24000,
    createdBy: '1',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: 72,
    alertSent: true,
    currentLicenses: 15,
    ownerId: '1',
    department: 'business_operations',
    requiresCompliance: false,
    requiresIt: true,
    hasPhi: false,
    hasInvestmentData: false,
    hasIntegration: true,
  },
  {
    id: 'REN-005',
    vendorId: 'VEN-003',
    vendorName: 'Slack Technologies',
    renewalDate: '2025-01-14',
    reviewStatus: 'completed',
    usageRate: 95,
    recommendation: 'renew',
    amount: 28000,
    createdBy: '4',
    reviewedBy: '2',
    reviewedAt: '2024-01-10T14:00:00Z',
    daysUntilExpiration: 330,
    alertSent: false,
    currentLicenses: 150,
    ownerId: '4',
    department: 'deerfield_intelligence',
    requiresCompliance: false,
    requiresIt: true,
    hasPhi: false,
    hasInvestmentData: false,
    hasIntegration: true,
  },
  {
    id: 'REN-006',
    vendorId: 'VEN-006',
    vendorName: 'HubSpot',
    renewalDate: '2025-01-19',
    reviewStatus: 'pending',
    usageRate: 72,
    recommendation: null,
    amount: 18000,
    createdBy: '1',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: 335,
    alertSent: false,
    currentLicenses: 10,
    ownerId: '7',
    department: 'investment',
    requiresCompliance: true,
    requiresIt: false,
    hasPhi: false,
    hasInvestmentData: true,
    hasIntegration: false,
  },
  {
    id: 'REN-007',
    vendorId: 'VEN-007',
    vendorName: 'Okta',
    renewalDate: '2024-08-31',
    reviewStatus: 'pending',
    usageRate: 100,
    recommendation: null,
    amount: 36000,
    createdBy: '4',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: 195,
    alertSent: false,
    currentLicenses: 200,
    ownerId: '4',
    department: 'deerfield_intelligence',
    requiresCompliance: true,
    requiresIt: true,
    hasPhi: true,
    hasInvestmentData: false,
    hasIntegration: true,
  },
  {
    id: 'REN-008',
    vendorId: 'VEN-011',
    vendorName: 'Epic Systems',
    renewalDate: '2024-06-15',
    reviewStatus: 'pending',
    usageRate: 85,
    recommendation: null,
    amount: 250000,
    createdBy: '7',
    reviewedBy: null,
    reviewedAt: null,
    daysUntilExpiration: 120,
    alertSent: true,
    currentLicenses: 50,
    ownerId: '7',
    department: 'investment',
    requiresCompliance: true,
    requiresIt: true,
    hasPhi: true,
    hasInvestmentData: true,
    hasIntegration: true,
  },
];

// ============= DEERFIELD WORKFLOWS =============
export const workflows: Workflow[] = [
  {
    id: 'WF-001',
    name: 'New Purchase - Standard',
    requestType: 'new_purchase',
    category: 'saas',
    minAmount: 0,
    maxAmount: 25000,
    approvalSteps: [
      { id: 'step-1', stepType: 'intake', role: 'requester', slaDays: 1, escalationDays: 2, isConditional: false },
      { id: 'step-2', stepType: 'requirements', role: 'requester', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-3', stepType: 'department_pre_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-4', stepType: 'compliance_it_review', role: ['compliance', 'it'], slaDays: 3, escalationDays: 5, isConditional: true, condition: 'new_purchase_only' },
      { id: 'step-5', stepType: 'finance_final_approval', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-6', stepType: 'contracting', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
    ],
  },
  {
    id: 'WF-002',
    name: 'New Purchase - High Value (>$25K)',
    requestType: 'new_purchase',
    category: 'saas',
    minAmount: 25001,
    maxAmount: null,
    approvalSteps: [
      { id: 'step-1', stepType: 'intake', role: 'requester', slaDays: 1, escalationDays: 2, isConditional: false },
      { id: 'step-2', stepType: 'requirements', role: 'requester', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-3', stepType: 'department_pre_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-4', stepType: 'compliance_it_review', role: ['compliance', 'it'], slaDays: 3, escalationDays: 5, isConditional: true, condition: 'new_purchase_only' },
      { id: 'step-5', stepType: 'negotiation', role: 'director_operations', slaDays: 5, escalationDays: 7, isConditional: true, condition: 'amount_over_25k' },
      { id: 'step-6', stepType: 'finance_final_approval', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-7', stepType: 'department_final_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: true, condition: 'price_changed' },
      { id: 'step-8', stepType: 'contracting', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
    ],
  },
  {
    id: 'WF-003',
    name: 'Contract Renewal - Standard',
    requestType: 'renewal',
    category: 'saas',
    minAmount: 0,
    maxAmount: 25000,
    approvalSteps: [
      { id: 'step-1', stepType: 'intake', role: 'requester', slaDays: 1, escalationDays: 2, isConditional: false },
      { id: 'step-2', stepType: 'requirements', role: 'requester', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-3', stepType: 'department_pre_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: false },
      // Compliance & IT Review SKIPPED for renewals
      { id: 'step-4', stepType: 'finance_final_approval', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-5', stepType: 'contracting', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
    ],
  },
  {
    id: 'WF-004',
    name: 'Contract Renewal - High Value (>$25K)',
    requestType: 'renewal',
    category: 'saas',
    minAmount: 25001,
    maxAmount: null,
    approvalSteps: [
      { id: 'step-1', stepType: 'intake', role: 'requester', slaDays: 1, escalationDays: 2, isConditional: false },
      { id: 'step-2', stepType: 'requirements', role: 'requester', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-3', stepType: 'department_pre_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: false },
      // Compliance & IT Review SKIPPED for renewals
      { id: 'step-4', stepType: 'negotiation', role: 'director_operations', slaDays: 5, escalationDays: 7, isConditional: true, condition: 'amount_over_25k' },
      { id: 'step-5', stepType: 'finance_final_approval', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
      { id: 'step-6', stepType: 'department_final_approval', role: 'department_leader', slaDays: 2, escalationDays: 3, isConditional: true, condition: 'price_changed' },
      { id: 'step-7', stepType: 'contracting', role: 'finance', slaDays: 2, escalationDays: 3, isConditional: false },
    ],
  },
];

// ============= SAMPLE APPROVALS =============
export const approvals: Approval[] = [
  {
    id: 'APR-001',
    requestId: 'REQ-001',
    approverId: '7',
    approverName: 'Lisa Park',
    approverRole: 'department_leader',
    approvalStep: 'department_pre_approval',
    status: 'approved',
    comments: 'Essential for team productivity.',
    timestamp: '2024-01-16T10:00:00Z',
    isConditional: false,
    conditionsMet: true,
  },
  {
    id: 'APR-002',
    requestId: 'REQ-001',
    approverId: '5',
    approverName: 'David Lee',
    approverRole: 'compliance',
    approvalStep: 'compliance_it_review',
    status: 'approved',
    comments: 'Compliance requirements met. No data privacy concerns.',
    timestamp: '2024-01-17T09:00:00Z',
    isConditional: true,
    conditionsMet: true,
  },
  {
    id: 'APR-003',
    requestId: 'REQ-001',
    approverId: '4',
    approverName: 'Emily Brown',
    approverRole: 'it',
    approvalStep: 'compliance_it_review',
    status: 'approved',
    comments: 'IT review complete. SSO integration verified.',
    timestamp: '2024-01-17T14:00:00Z',
    isConditional: true,
    conditionsMet: true,
  },
  {
    id: 'APR-004',
    requestId: 'REQ-002',
    approverId: '7',
    approverName: 'Lisa Park',
    approverRole: 'department_leader',
    approvalStep: 'department_pre_approval',
    status: 'approved',
    comments: 'Approved - critical for new hires.',
    timestamp: '2024-01-17T08:00:00Z',
    isConditional: false,
    conditionsMet: true,
  },
  {
    id: 'APR-005',
    requestId: 'REQ-002',
    approverId: '3',
    approverName: 'Mike Wilson',
    approverRole: 'director_operations',
    approvalStep: 'negotiation',
    status: 'approved',
    comments: 'Negotiated 10% volume discount.',
    timestamp: '2024-01-18T11:00:00Z',
    isConditional: true,
    conditionsMet: true,
  },
  {
    id: 'APR-006',
    requestId: 'REQ-002',
    approverId: '2',
    approverName: 'Sarah Chen',
    approverRole: 'finance',
    approvalStep: 'finance_final_approval',
    status: 'approved',
    comments: 'Within budget, approved at negotiated price.',
    timestamp: '2024-01-18T15:00:00Z',
    isConditional: false,
    conditionsMet: true,
  },
];

// ============= HELPER FUNCTIONS =============

export const getDepartmentBudget = (department: Department): DepartmentBudget | undefined => {
  return departmentBudgets.find(b => b.department === department);
};

export const getDepartmentLabel = (department: Department): string => {
  return departments.find(d => d.value === department)?.label || department;
};

export const getSubDepartmentLabel = (subDepartment: SubDepartment): string => {
  return subDepartments.find(d => d.value === subDepartment)?.label || subDepartment;
};

export const getStatusColor = (status: RequestStatus): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'needs_info': return 'error';
    case 'rejected': return 'error';
    case 'draft': return 'neutral';
    default: return 'neutral';
  }
};

export const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'pending': return 'In Progress';
    case 'needs_info': return 'Needs Info';
    case 'rejected': return 'Rejected';
    case 'draft': return 'Draft';
    default: return status;
  }
};

export const getUrgencyColor = (urgency: Urgency): 'success' | 'warning' | 'error' | 'info' => {
  switch (urgency) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'info';
  }
};

export const getStepLabel = (step: ApprovalStep): string => {
  switch (step) {
    case 'intake': return 'Intake';
    case 'requirements': return 'Requirements';
    case 'department_pre_approval': return 'Dept. Approval';
    case 'compliance_it_review': return 'Compliance & IT';
    case 'negotiation': return 'Negotiation';
    case 'finance_final_approval': return 'Finance';
    case 'department_final_approval': return 'Dept. Re-Approval';
    case 'contracting': return 'Contracting';
    default: return step;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysUntilRenewal = (renewalDate: string): number => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCategoryIcon = (category: RequestCategory): string => {
  switch (category) {
    case 'saas': return '☁️';
    case 'hardware': return '💻';
    case 'services': return '🛠️';
    case 'other': return '📦';
    default: return '📦';
  }
};

// Get workflow steps for a request
export const getWorkflowSteps = (request: PurchaseRequest): ApprovalStep[] => {
  const baseSteps: ApprovalStep[] = ['intake', 'requirements', 'department_pre_approval'];
  
  // For new purchases, include Compliance & IT review
  if (request.requestType === 'new_purchase') {
    baseSteps.push('compliance_it_review');
  }
  
  // Add negotiation if amount > $25K
  if (request.budgetedAmount > 25000) {
    baseSteps.push('negotiation');
  }
  
  // Finance final approval
  baseSteps.push('finance_final_approval');
  
  // Department re-approval if price changed (after negotiation)
  if (request.priceChanged) {
    baseSteps.push('department_final_approval');
  }
  
  // Contracting
  baseSteps.push('contracting');
  
  return baseSteps;
};

// Check if step should be skipped
export const isStepSkipped = (step: ApprovalStep, request: PurchaseRequest): boolean => {
  if (step === 'compliance_it_review' && request.requestType === 'renewal') {
    return true;
  }
  if (step === 'negotiation' && request.budgetedAmount <= 25000) {
    return true;
  }
  if (step === 'department_final_approval' && !request.priceChanged) {
    return true;
  }
  return false;
};
