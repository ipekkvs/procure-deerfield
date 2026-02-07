import { 
  RequestType, 
  RequestCategory, 
  Department, 
  SubDepartment, 
  Urgency 
} from "@/lib/mockData";
import { UploadedFile } from "./FileUpload";
import { ContractTerm, RiskFactors } from "@/lib/riskScoring";

export interface RequestFormData {
  // Step 1: Initial Intake
  description: string;
  requestType: RequestType;
  category: RequestCategory | null;
  department: Department | null;
  subDepartment: SubDepartment | null;
  licensesSeatsCount: number | null;
  redundancyCheckConfirmed: boolean;
  
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
  
  // Vendor name (for pre-approved vendor detection)
  vendorName: string;
  
  // Step 2: Requirements Gathering
  title: string;
  documentationUrls: string[];
  uploadedFiles: UploadedFile[];
  targetSignDate: string;
  budgetedAmount: number | null;
  urgency: Urgency;
  businessJustification: string;
  
  // Over-budget handling
  overBudgetJustification: string;
  acknowledgesFinanceException: boolean;
}

export const initialFormData: RequestFormData = {
  description: "",
  requestType: "new_purchase",
  category: null,
  department: null,
  subDepartment: null,
  licensesSeatsCount: null,
  redundancyCheckConfirmed: false,
  
  // AI/ML Detection
  hasAiMlCapabilities: false,
  hasLlmApiAccess: false,
  usesMlForAnalysis: false,
  
  // Portfolio Company Access
  hasPortfolioCompanyAccess: false,
  integratesWithPortfolioNetworks: false,
  usedByPortfolioStaff: false,
  
  // Contract Term
  contractTerm: "1_year",
  
  // Renewal-specific
  useCaseChanged: false,
  useCaseChangeDescription: "",
  
  // Vendor name
  vendorName: "",
  
  title: "",
  documentationUrls: [],
  uploadedFiles: [],
  targetSignDate: "",
  budgetedAmount: null,
  urgency: "medium",
  businessJustification: "",
  
  // Over-budget handling
  overBudgetJustification: "",
  acknowledgesFinanceException: false,
};

export interface StepProps {
  formData: RequestFormData;
  updateFormData: (updates: Partial<RequestFormData>) => void;
}
