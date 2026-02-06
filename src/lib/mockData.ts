// Mock data for Procure - Procurement Management Platform

export type UserRole = 'requester' | 'finance' | 'legal' | 'it' | 'procurement' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_info';
export type RequestCategory = 'saas' | 'hardware' | 'services' | 'other';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  amount: number;
  status: RequestStatus;
  urgency: Urgency;
  businessJustification: string;
  requesterId: string;
  requesterName: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  currentApproverRole: UserRole | null;
  approvalStage: number;
  totalStages: number;
  daysInCurrentStage: number;
}

export interface Approval {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  timestamp: string;
}

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
}

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
}

export interface WorkflowStep {
  id: string;
  role: UserRole;
  slaDays: number;
  escalationDays: number;
}

export interface Workflow {
  id: string;
  name: string;
  category: RequestCategory;
  minAmount: number;
  maxAmount: number | null;
  approvalSteps: WorkflowStep[];
}

// Demo users
export const users: User[] = [
  { id: '1', email: 'requester@demo.com', name: 'Alex Johnson', role: 'requester', department: 'Marketing' },
  { id: '2', email: 'finance@demo.com', name: 'Sarah Chen', role: 'finance', department: 'Finance' },
  { id: '3', email: 'procurement@demo.com', name: 'Mike Wilson', role: 'procurement', department: 'Operations' },
  { id: '4', email: 'it@demo.com', name: 'Emily Brown', role: 'it', department: 'IT' },
  { id: '5', email: 'legal@demo.com', name: 'David Lee', role: 'legal', department: 'Legal' },
  { id: '6', email: 'admin@demo.com', name: 'Chris Taylor', role: 'admin', department: 'Admin' },
];

// Sample requests
export const requests: PurchaseRequest[] = [
  {
    id: 'REQ-001',
    title: 'Figma Enterprise License',
    description: 'Annual enterprise license for Figma design tool for the design team',
    category: 'saas',
    amount: 45000,
    status: 'pending',
    urgency: 'medium',
    businessJustification: 'Current Figma licenses expire next month. Enterprise tier enables SSO and admin controls.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Marketing',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    currentApproverRole: 'finance',
    approvalStage: 3,
    totalStages: 4,
    daysInCurrentStage: 2,
  },
  {
    id: 'REQ-002',
    title: 'MacBook Pro M3 (x10)',
    description: 'New MacBook Pro laptops for engineering team expansion',
    category: 'hardware',
    amount: 35000,
    status: 'pending',
    urgency: 'high',
    businessJustification: 'New engineering hires starting next month need development machines.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    currentApproverRole: 'procurement',
    approvalStage: 2,
    totalStages: 4,
    daysInCurrentStage: 3,
  },
  {
    id: 'REQ-003',
    title: 'Salesforce CRM Expansion',
    description: 'Additional Salesforce licenses and Sales Cloud features',
    category: 'saas',
    amount: 125000,
    status: 'pending',
    urgency: 'medium',
    businessJustification: 'Sales team growing 40% this year, need additional licenses and advanced analytics.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Sales',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    currentApproverRole: 'legal',
    approvalStage: 4,
    totalStages: 5,
    daysInCurrentStage: 5,
  },
  {
    id: 'REQ-004',
    title: 'AWS Reserved Instances',
    description: 'Annual reserved instances for production workloads',
    category: 'services',
    amount: 89000,
    status: 'approved',
    urgency: 'low',
    businessJustification: 'Reserved instances save 35% vs on-demand pricing.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    currentApproverRole: null,
    approvalStage: 5,
    totalStages: 5,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-005',
    title: 'Slack Enterprise Grid',
    description: 'Upgrade to Slack Enterprise Grid for enhanced security',
    category: 'saas',
    amount: 28000,
    status: 'approved',
    urgency: 'medium',
    businessJustification: 'Enterprise Grid provides HIPAA compliance needed for healthcare clients.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-03T08:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    currentApproverRole: null,
    approvalStage: 4,
    totalStages: 4,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-006',
    title: 'Consulting - Security Audit',
    description: 'External security audit and penetration testing',
    category: 'services',
    amount: 55000,
    status: 'needs_info',
    urgency: 'high',
    businessJustification: 'Annual security audit required for SOC 2 compliance.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    currentApproverRole: 'finance',
    approvalStage: 2,
    totalStages: 4,
    daysInCurrentStage: 4,
  },
  {
    id: 'REQ-007',
    title: 'HubSpot Marketing Hub',
    description: 'Marketing automation platform subscription',
    category: 'saas',
    amount: 18000,
    status: 'approved',
    urgency: 'low',
    businessJustification: 'Replace current email marketing tools with integrated solution.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Marketing',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z',
    currentApproverRole: null,
    approvalStage: 4,
    totalStages: 4,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-008',
    title: 'Office Furniture - Standing Desks',
    description: '20 adjustable standing desks for new office space',
    category: 'hardware',
    amount: 15000,
    status: 'pending',
    urgency: 'low',
    businessJustification: 'Ergonomic workstations for employee wellness initiative.',
    requesterId: '3',
    requesterName: 'Mike Wilson',
    department: 'Operations',
    createdAt: '2024-01-17T15:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    currentApproverRole: 'finance',
    approvalStage: 2,
    totalStages: 3,
    daysInCurrentStage: 1,
  },
  {
    id: 'REQ-009',
    title: 'Notion Team Workspace',
    description: 'Notion Team plan for documentation and wikis',
    category: 'saas',
    amount: 4800,
    status: 'approved',
    urgency: 'medium',
    businessJustification: 'Centralize team documentation and reduce tool sprawl.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Marketing',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    currentApproverRole: null,
    approvalStage: 3,
    totalStages: 3,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-010',
    title: 'Legal Review - Vendor Contract',
    description: 'External legal review for major vendor agreement',
    category: 'services',
    amount: 8500,
    status: 'needs_info',
    urgency: 'medium',
    businessJustification: 'Complex multi-year contract needs specialized legal review.',
    requesterId: '5',
    requesterName: 'David Lee',
    department: 'Legal',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    currentApproverRole: 'procurement',
    approvalStage: 1,
    totalStages: 3,
    daysInCurrentStage: 3,
  },
  {
    id: 'REQ-011',
    title: 'Zoom Webinar Add-on',
    description: 'Zoom Webinar for up to 500 attendees',
    category: 'saas',
    amount: 3200,
    status: 'approved',
    urgency: 'high',
    businessJustification: 'Product launch webinar scheduled for next month.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Marketing',
    createdAt: '2024-01-11T08:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    currentApproverRole: null,
    approvalStage: 2,
    totalStages: 2,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-012',
    title: 'DataDog Monitoring',
    description: 'Infrastructure monitoring and APM solution',
    category: 'saas',
    amount: 72000,
    status: 'pending',
    urgency: 'high',
    businessJustification: 'Current monitoring gaps causing extended incident response times.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    currentApproverRole: 'it',
    approvalStage: 1,
    totalStages: 5,
    daysInCurrentStage: 2,
  },
  {
    id: 'REQ-013',
    title: 'Conference Booth - SaaStr',
    description: 'Exhibition booth at SaaStr Annual conference',
    category: 'services',
    amount: 45000,
    status: 'draft',
    urgency: 'medium',
    businessJustification: 'Major lead generation opportunity with 15,000+ attendees.',
    requesterId: '1',
    requesterName: 'Alex Johnson',
    department: 'Marketing',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    currentApproverRole: null,
    approvalStage: 0,
    totalStages: 4,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-014',
    title: 'GitHub Enterprise',
    description: 'GitHub Enterprise Cloud for enhanced security',
    category: 'saas',
    amount: 21000,
    status: 'rejected',
    urgency: 'low',
    businessJustification: 'Advanced security features and SAML SSO.',
    requesterId: '4',
    requesterName: 'Emily Brown',
    department: 'IT',
    createdAt: '2024-01-04T09:00:00Z',
    updatedAt: '2024-01-09T14:00:00Z',
    currentApproverRole: null,
    approvalStage: 2,
    totalStages: 4,
    daysInCurrentStage: 0,
  },
  {
    id: 'REQ-015',
    title: 'Employee Training - Leadership',
    description: 'Executive leadership training program',
    category: 'services',
    amount: 32000,
    status: 'needs_info',
    urgency: 'low',
    businessJustification: 'Develop next generation of managers.',
    requesterId: '6',
    requesterName: 'Chris Taylor',
    department: 'Admin',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    currentApproverRole: 'finance',
    approvalStage: 2,
    totalStages: 3,
    daysInCurrentStage: 4,
  },
];

// Sample vendors
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
  },
  {
    id: 'VEN-002',
    name: 'Amazon Web Services',
    category: 'Cloud Infrastructure',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2023-01-01',
    contractEnd: '2024-12-31',
    annualSpend: 340000,
    autoRenew: true,
    status: 'active',
    website: 'https://aws.amazon.com',
    contactEmail: 'aws-support@amazon.com',
  },
  {
    id: 'VEN-003',
    name: 'Slack Technologies',
    category: 'Communication',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2023-06-01',
    contractEnd: '2024-05-31',
    annualSpend: 28000,
    autoRenew: true,
    status: 'active',
    website: 'https://slack.com',
    contactEmail: 'enterprise@slack.com',
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
  },
  {
    id: 'VEN-005',
    name: 'Zoom Video Communications',
    category: 'Video Conferencing',
    ownerId: '4',
    ownerName: 'Emily Brown',
    contractStart: '2023-04-01',
    contractEnd: '2024-03-31',
    annualSpend: 18500,
    autoRenew: true,
    status: 'active',
    website: 'https://zoom.us',
    contactEmail: 'sales@zoom.us',
  },
  {
    id: 'VEN-006',
    name: 'HubSpot',
    category: 'Marketing Automation',
    ownerId: '1',
    ownerName: 'Alex Johnson',
    contractStart: '2023-07-01',
    contractEnd: '2024-06-30',
    annualSpend: 52000,
    autoRenew: true,
    status: 'active',
    website: 'https://hubspot.com',
    contactEmail: 'enterprise@hubspot.com',
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
  },
  {
    id: 'VEN-008',
    name: 'Notion Labs',
    category: 'Productivity',
    ownerId: '3',
    ownerName: 'Mike Wilson',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    annualSpend: 4800,
    autoRenew: true,
    status: 'active',
    website: 'https://notion.so',
    contactEmail: 'team@notion.so',
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
  },
];

// Sample renewals
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
  },
  {
    id: 'REN-003',
    vendorId: 'VEN-005',
    vendorName: 'Zoom Video Communications',
    renewalDate: '2024-03-31',
    reviewStatus: 'pending',
    usageRate: 88,
    recommendation: null,
    amount: 18500,
    createdBy: '4',
    reviewedBy: null,
    reviewedAt: null,
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
  },
  {
    id: 'REN-005',
    vendorId: 'VEN-003',
    vendorName: 'Slack Technologies',
    renewalDate: '2024-05-31',
    reviewStatus: 'completed',
    usageRate: 95,
    recommendation: 'renew',
    amount: 28000,
    createdBy: '4',
    reviewedBy: '2',
    reviewedAt: '2024-01-10T14:00:00Z',
  },
  {
    id: 'REN-006',
    vendorId: 'VEN-006',
    vendorName: 'HubSpot',
    renewalDate: '2024-06-30',
    reviewStatus: 'pending',
    usageRate: 72,
    recommendation: null,
    amount: 52000,
    createdBy: '1',
    reviewedBy: null,
    reviewedAt: null,
  },
];

// Sample workflows
export const workflows: Workflow[] = [
  {
    id: 'WF-001',
    name: 'SaaS Under $10K',
    category: 'saas',
    minAmount: 0,
    maxAmount: 10000,
    approvalSteps: [
      { id: 'step-1', role: 'procurement', slaDays: 2, escalationDays: 3 },
      { id: 'step-2', role: 'finance', slaDays: 2, escalationDays: 3 },
    ],
  },
  {
    id: 'WF-002',
    name: 'SaaS $10K-$50K',
    category: 'saas',
    minAmount: 10000,
    maxAmount: 50000,
    approvalSteps: [
      { id: 'step-1', role: 'procurement', slaDays: 2, escalationDays: 3 },
      { id: 'step-2', role: 'it', slaDays: 2, escalationDays: 3 },
      { id: 'step-3', role: 'finance', slaDays: 3, escalationDays: 4 },
    ],
  },
  {
    id: 'WF-003',
    name: 'SaaS Over $50K',
    category: 'saas',
    minAmount: 50000,
    maxAmount: null,
    approvalSteps: [
      { id: 'step-1', role: 'procurement', slaDays: 2, escalationDays: 3 },
      { id: 'step-2', role: 'it', slaDays: 2, escalationDays: 3 },
      { id: 'step-3', role: 'legal', slaDays: 3, escalationDays: 4 },
      { id: 'step-4', role: 'finance', slaDays: 3, escalationDays: 4 },
      { id: 'step-5', role: 'admin', slaDays: 2, escalationDays: 3 },
    ],
  },
];

// Helper functions
export const getCurrentUser = (): User => users[0]; // Default to requester for demo

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
