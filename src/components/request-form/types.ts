import { 
  RequestType, 
  RequestCategory, 
  Department, 
  SubDepartment, 
  Urgency 
} from "@/lib/mockData";
import { UploadedFile } from "./FileUpload";

export interface RequestFormData {
  // Step 1: Initial Intake
  description: string;
  requestType: RequestType;
  category: RequestCategory | null;
  department: Department | null;
  subDepartment: SubDepartment | null;
  licensesSeatsCount: number | null;
  redundancyCheckConfirmed: boolean;
  
  // Step 2: Requirements Gathering
  title: string;
  documentationUrls: string[];
  uploadedFiles: UploadedFile[];
  targetSignDate: string;
  budgetedAmount: number | null;
  urgency: Urgency;
  businessJustification: string;
}

export const initialFormData: RequestFormData = {
  description: "",
  requestType: "new_purchase",
  category: null,
  department: null,
  subDepartment: null,
  licensesSeatsCount: null,
  redundancyCheckConfirmed: false,
  title: "",
  documentationUrls: [],
  uploadedFiles: [],
  targetSignDate: "",
  budgetedAmount: null,
  urgency: "medium",
  businessJustification: "",
};

export interface StepProps {
  formData: RequestFormData;
  updateFormData: (updates: Partial<RequestFormData>) => void;
}
