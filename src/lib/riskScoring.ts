// Risk Scoring and Auto-Routing System for Deerfield Procurement

import { RequestType, RequestCategory, Department } from './mockData';

// ============= TYPES =============

export type ContractTerm = '1_year' | '2_years' | '3_years' | '4_plus_years' | 'month_to_month';

export type RiskTier = 0 | 1 | 2 | 3 | 4;

export interface RiskFactors {
  // AI/ML Detection
  hasAiMlCapabilities: boolean;
  hasLlmApiAccess: boolean;
  usesMlForAnalysis: boolean;
  
  // Portfolio Company Access
  hasPortfolioCompanyAccess: boolean;
  integratesWithPortfolioNetworks: boolean;
  usedByPortfolioStaff: boolean;
  
  // Contract Term
  contractTerm: ContractTerm;
  
  // Renewal-specific: Use Case Changes
  useCaseChanged: boolean;
  useCaseChangeDescription: string;
  
  // Data sensitivity (from existing fields)
  accessesPhi: boolean;
  accessesInvestmentData: boolean;
  accessesProprietaryData: boolean;
  
  // Integration complexity
  requiresApiIntegration: boolean;
  requiresCoreSystemAccess: boolean;
  isEnterpriseWide: boolean;
  requiresSsoSetup: boolean;
  
  // Vendor info
  vendorName: string;
  isNewVendor: boolean;
  hasDataStorage: boolean;
  isInternationalWithDataStorage: boolean;
  
  // Healthcare/Compliance
  isHealthcareRelated: boolean;
  isFdaRegulated: boolean;
  isClinicalTrials: boolean;
  isPatientFacing: boolean;
}

export interface RiskAssessment {
  tier: RiskTier;
  tierLabel: string;
  riskScore: number;
  
  // Required approvers
  requiresCio: boolean;
  requiresFinance: boolean;
  requiresCompliance: boolean;
  requiresIt: boolean;
  requiresLegal: boolean;
  
  // Auto-approval flags
  financeAutoApproved: boolean;
  
  // Detected flags
  aiMlDetected: boolean;
  portfolioAccessDetected: boolean;
  isPreApprovedVendor: boolean;
  isOverBudget: boolean;
  overBudgetAmount: number;
  
  // CIO-specific triggers (for display)
  cioTriggers: string[];
  
  // Routing explanation
  routingReasons: string[];
  approvalPath: string[];
}

// ============= PRE-APPROVED VENDORS =============

export const preApprovedVendors: string[] = [
  'microsoft',
  'google',
  'aws',
  'amazon web services',
  'zoom',
  'zoom video communications',
  'slack',
  'salesforce',
  'adobe',
  'docusign',
];

export function isPreApprovedVendor(vendorName: string): boolean {
  const normalized = vendorName.toLowerCase().trim();
  return preApprovedVendors.some(v => 
    normalized.includes(v) || v.includes(normalized)
  );
}

// ============= KEYWORD DETECTION =============

const AI_ML_KEYWORDS = [
  'openai', 'anthropic', 'claude', 'gpt', 'chatgpt', 'llm', 
  'machine learning', 'artificial intelligence', 'ai-powered', 
  'neural network', 'deep learning', 'generative ai', 'cohere', 
  'hugging face', 'huggingface', 'gemini', 'copilot', 'ai assistant',
  'natural language processing', 'nlp', 'computer vision', 'ml model'
];

const PORTFOLIO_COMPANY_KEYWORDS = [
  'portfolio company', 'biotech', 'portfolio integration', 
  'patient-facing', 'clinical', 'their network', 'their system', 
  'plug into', 'connect to portfolio', 'portfolio access',
  'portfolio companies', 'portfolio co', 'portco'
];

const HEALTHCARE_KEYWORDS = [
  'phi', 'patient data', 'hipaa', 'healthcare', 'medical device',
  'clinical trial', 'fda', 'patient-facing', 'medical records',
  'ehr', 'emr', 'health information'
];

const INVESTMENT_DATA_KEYWORDS = [
  'investment research', 'proprietary data', 'trading', 'portfolio analytics',
  'investment data', 'fund data', 'market data', 'alpha generation'
];

export interface KeywordDetectionResult {
  aiMlDetected: boolean;
  aiMlKeywordsFound: string[];
  portfolioAccessDetected: boolean;
  portfolioKeywordsFound: string[];
  healthcareDetected: boolean;
  investmentDataDetected: boolean;
}

export function detectKeywords(text: string): KeywordDetectionResult {
  const lower = text.toLowerCase();
  
  const aiMlKeywordsFound = AI_ML_KEYWORDS.filter(kw => lower.includes(kw));
  const portfolioKeywordsFound = PORTFOLIO_COMPANY_KEYWORDS.filter(kw => lower.includes(kw));
  const healthcareFound = HEALTHCARE_KEYWORDS.some(kw => lower.includes(kw));
  const investmentFound = INVESTMENT_DATA_KEYWORDS.some(kw => lower.includes(kw));
  
  return {
    aiMlDetected: aiMlKeywordsFound.length > 0,
    aiMlKeywordsFound,
    portfolioAccessDetected: portfolioKeywordsFound.length > 0,
    portfolioKeywordsFound,
    healthcareDetected: healthcareFound,
    investmentDataDetected: investmentFound,
  };
}

// ============= RISK SCORING =============

export interface RiskScoringInput {
  amount: number;
  requestType: RequestType;
  riskFactors: Partial<RiskFactors>;
  department: Department | null;
  departmentBudgetRemaining: number;
  description: string;
  vendorName: string;
}

export function calculateRiskAssessment(input: RiskScoringInput): RiskAssessment {
  const {
    amount,
    requestType,
    riskFactors,
    departmentBudgetRemaining,
    description,
    vendorName,
  } = input;
  
  const factors = riskFactors || {};
  
  // Keyword detection
  const keywordResults = detectKeywords(`${description} ${vendorName}`);
  
  // Pre-approved vendor check
  const isPreApproved = isPreApprovedVendor(vendorName);
  
  // Determine AI/ML flags (from checkboxes OR auto-detection)
  const hasAnyAiMl = 
    factors.hasAiMlCapabilities || 
    factors.hasLlmApiAccess || 
    factors.usesMlForAnalysis ||
    keywordResults.aiMlDetected;
  
  // Determine portfolio access (from checkboxes OR auto-detection)
  const hasAnyPortfolioAccess =
    factors.hasPortfolioCompanyAccess ||
    factors.integratesWithPortfolioNetworks ||
    factors.usedByPortfolioStaff ||
    keywordResults.portfolioAccessDetected;
  
  // Determine healthcare/compliance flags
  const hasHealthcareRisk =
    factors.accessesPhi ||
    factors.isHealthcareRelated ||
    factors.isFdaRegulated ||
    factors.isClinicalTrials ||
    factors.isPatientFacing ||
    keywordResults.healthcareDetected;
  
  // Determine investment data flags
  const hasInvestmentDataRisk =
    factors.accessesInvestmentData ||
    factors.accessesProprietaryData ||
    keywordResults.investmentDataDetected;
  
  // Multi-year commitment
  const isMultiYear = 
    factors.contractTerm === '2_years' || 
    factors.contractTerm === '3_years' ||
    factors.contractTerm === '4_plus_years';
  
  // Over budget check
  const isOverBudget = amount > departmentBudgetRemaining;
  
  // Use case changed (for renewals)
  const useCaseChanged = requestType === 'renewal' && factors.useCaseChanged;
  
  // ============= CIO TRIGGERS =============
  const cioTriggers: string[] = [];
  
  if (amount > 50000) {
    cioTriggers.push('Amount exceeds $50,000');
  }
  if (hasAnyAiMl) {
    cioTriggers.push('AI/ML tool detected - platform consistency review');
  }
  if (hasAnyPortfolioAccess) {
    cioTriggers.push('Portfolio company access - reputational risk review');
  }
  if (factors.accessesPhi) {
    cioTriggers.push('PHI/Patient data access');
  }
  if (hasInvestmentDataRisk) {
    cioTriggers.push('Investment research/proprietary data');
  }
  if (factors.requiresCoreSystemAccess) {
    cioTriggers.push('Core system integration');
  }
  if (factors.isEnterpriseWide) {
    cioTriggers.push('Enterprise-wide tool');
  }
  
  const requiresCio = cioTriggers.length > 0;
  
  // ============= FINANCE TRIGGERS =============
  const financeTriggers: string[] = [];
  let financeAutoApproved = false;
  
  if (amount >= 10000) {
    financeTriggers.push('Amount ≥ $10,000');
  }
  if (isOverBudget) {
    financeTriggers.push('Exceeds department budget');
  }
  if (isMultiYear) {
    financeTriggers.push('Multi-year commitment');
  }
  
  // Auto-approve conditions
  if (
    amount < 10000 && 
    !isOverBudget && 
    !isMultiYear
  ) {
    financeAutoApproved = true;
  }
  
  const requiresFinance = financeTriggers.length > 0 || !financeAutoApproved;
  
  // ============= COMPLIANCE TRIGGERS =============
  const complianceTriggers: string[] = [];
  
  if (factors.accessesPhi) {
    complianceTriggers.push('PHI/Patient data access');
  }
  if (factors.isPatientFacing) {
    complianceTriggers.push('Patient-facing tool');
  }
  if (hasInvestmentDataRisk) {
    complianceTriggers.push('Investment research/proprietary data');
  }
  if (hasHealthcareRisk) {
    complianceTriggers.push('Healthcare/medical device related');
  }
  if (factors.isNewVendor && factors.hasDataStorage) {
    complianceTriggers.push('New vendor with data processing');
  }
  if (factors.isInternationalWithDataStorage) {
    complianceTriggers.push('International vendor with data storage');
  }
  if (factors.isFdaRegulated || factors.isClinicalTrials) {
    complianceTriggers.push('FDA-regulated or clinical trials');
  }
  
  // Skip compliance for renewals with no changes from pre-approved vendors
  const skipCompliance = 
    requestType === 'renewal' && 
    !useCaseChanged && 
    isPreApproved;
  
  const requiresCompliance = complianceTriggers.length > 0 && !skipCompliance;
  
  // ============= IT TRIGGERS =============
  const itTriggers: string[] = [];
  
  if (factors.isNewVendor && factors.hasDataStorage) {
    itTriggers.push('New vendor with data storage');
  }
  if (factors.requiresApiIntegration) {
    itTriggers.push('API integration required');
  }
  if (factors.requiresCoreSystemAccess) {
    itTriggers.push('System/network access needed');
  }
  if (factors.requiresSsoSetup && factors.isNewVendor) {
    itTriggers.push('SSO setup for new vendor');
  }
  if (factors.accessesPhi || factors.accessesInvestmentData || factors.accessesProprietaryData) {
    itTriggers.push('Sensitive data access');
  }
  if (useCaseChanged) {
    itTriggers.push('Use case changed - requires IT re-review');
  }
  
  // Skip IT for renewals with no changes from pre-approved vendors
  const skipIt = 
    requestType === 'renewal' && 
    !useCaseChanged && 
    isPreApproved;
  
  const requiresIt = itTriggers.length > 0 && !skipIt;
  
  // ============= LEGAL TRIGGERS (for Tier 4) =============
  const requiresLegal = requiresCio; // Legal added when CIO is involved
  
  // ============= DETERMINE TIER =============
  let tier: RiskTier = 1;
  let tierLabel = 'Low Risk';
  
  // Tier 0: Auto-Approved
  if (
    isPreApproved &&
    requestType === 'renewal' &&
    !useCaseChanged &&
    amount < 10000 &&
    !isOverBudget &&
    !hasHealthcareRisk &&
    !hasInvestmentDataRisk
  ) {
    tier = 0;
    tierLabel = 'Minimal Risk - Auto-Approved';
  }
  // Tier 4: Critical Risk (CIO required)
  else if (requiresCio) {
    tier = 4;
    tierLabel = 'Critical Risk';
  }
  // Tier 3: High Risk
  else if (
    hasInvestmentDataRisk ||
    hasHealthcareRisk ||
    (factors.isNewVendor && (factors.accessesPhi || factors.accessesInvestmentData)) ||
    (requiresIt && requiresCompliance)
  ) {
    tier = 3;
    tierLabel = 'High Risk';
  }
  // Tier 2: Medium Risk
  else if (
    (factors.isNewVendor && factors.hasDataStorage) ||
    (amount >= 10000 && amount < 50000) ||
    factors.requiresApiIntegration
  ) {
    tier = 2;
    tierLabel = 'Medium Risk';
  }
  // Tier 1: Low Risk (default)
  else {
    tier = 1;
    tierLabel = 'Low Risk';
  }
  
  // ============= BUILD APPROVAL PATH =============
  const approvalPath: string[] = ['Manager'];
  const routingReasons: string[] = [];
  
  if (tier === 0) {
    approvalPath.push('Auto-Approved');
    routingReasons.push('Pre-approved vendor renewal with no changes under $10K');
  } else {
    if (requiresIt && requiresCompliance && requiresLegal) {
      approvalPath.push('IT + Compliance + Legal (parallel)');
    } else if (requiresIt && requiresCompliance) {
      approvalPath.push('IT + Compliance (parallel)');
    } else if (requiresIt) {
      approvalPath.push('IT');
    } else if (requiresCompliance) {
      approvalPath.push('Compliance');
    }
    
    if (requiresFinance && !financeAutoApproved) {
      approvalPath.push('Finance');
    }
    
    if (requiresCio) {
      approvalPath.push('CIO');
    }
    
    approvalPath.push('Done');
    
    // Add routing reasons
    routingReasons.push(...cioTriggers.map(t => `CIO: ${t}`));
    routingReasons.push(...financeTriggers.map(t => `Finance: ${t}`));
    routingReasons.push(...complianceTriggers.map(t => `Compliance: ${t}`));
    routingReasons.push(...itTriggers.map(t => `IT: ${t}`));
  }
  
  // ============= CALCULATE RISK SCORE =============
  let riskScore = 0;
  
  if (amount >= 50000) riskScore += 30;
  else if (amount >= 25000) riskScore += 20;
  else if (amount >= 10000) riskScore += 10;
  
  if (hasAnyAiMl) riskScore += 25;
  if (hasAnyPortfolioAccess) riskScore += 25;
  if (factors.accessesPhi) riskScore += 30;
  if (hasInvestmentDataRisk) riskScore += 20;
  if (factors.isNewVendor) riskScore += 10;
  if (factors.hasDataStorage) riskScore += 5;
  if (factors.requiresApiIntegration) riskScore += 10;
  if (factors.requiresCoreSystemAccess) riskScore += 15;
  if (isMultiYear) riskScore += 10;
  if (isOverBudget) riskScore += 15;
  if (useCaseChanged) riskScore += 10;
  
  // Reduce score for pre-approved vendors
  if (isPreApproved) riskScore = Math.max(0, riskScore - 20);
  
  return {
    tier,
    tierLabel,
    riskScore: Math.min(100, riskScore),
    requiresCio,
    requiresFinance,
    requiresCompliance,
    requiresIt,
    requiresLegal,
    financeAutoApproved,
    aiMlDetected: hasAnyAiMl,
    portfolioAccessDetected: hasAnyPortfolioAccess,
    isPreApprovedVendor: isPreApproved,
    isOverBudget,
    overBudgetAmount: isOverBudget ? amount - departmentBudgetRemaining : 0,
    cioTriggers,
    routingReasons,
    approvalPath,
  };
}

// ============= TIER DESCRIPTIONS =============

export const tierDescriptions: Record<RiskTier, { label: string; description: string; color: string }> = {
  0: {
    label: 'Tier 0 - Minimal Risk',
    description: 'Pre-approved vendor renewal with no changes. Auto-approved with Finance notification.',
    color: 'text-green-600',
  },
  1: {
    label: 'Tier 1 - Low Risk',
    description: 'Standard business tool under $50K with no sensitive data. Manager → Finance → Done.',
    color: 'text-blue-600',
  },
  2: {
    label: 'Tier 2 - Medium Risk',
    description: 'New vendor with data or $10K-$50K spend. Manager → IT → Finance → Done.',
    color: 'text-yellow-600',
  },
  3: {
    label: 'Tier 3 - High Risk',
    description: 'Investment data, healthcare-related, or new vendor with sensitive data. Manager → IT + Compliance → Finance → Done.',
    color: 'text-orange-600',
  },
  4: {
    label: 'Tier 4 - Critical Risk',
    description: 'Over $50K, AI/ML, portfolio access, or core systems. Manager → IT + Compliance + Legal → Finance → CIO → Done.',
    color: 'text-red-600',
  },
};
