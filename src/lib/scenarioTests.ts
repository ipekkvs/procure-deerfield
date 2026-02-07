// Scenario Testing for Approval Routing Logic
// This file documents expected routing for each scenario

import { calculateRiskAssessment, RiskScoringInput, RiskFactors } from './riskScoring';

/*
=== SCENARIO 1: $8K Zoom renewal, no changes ===
Expected: Manager → Auto-approved (Finance notified, IT skipped, Compliance skipped, CIO skipped)

Input:
- Amount: $8,000
- Request Type: renewal
- Vendor: Zoom (pre-approved)
- Use case changed: No
- No sensitive data
- No integrations

Expected Assessment:
- Tier: 0 (Minimal Risk - Auto-Approved)
- financeAutoApproved: true
- itSkipped: true
- complianceSkipped: true
- requiresCio: false


=== SCENARIO 2: $45K new CRM with client data ===
Expected: Manager → IT + Compliance (parallel) → Finance → Done

Input:
- Amount: $45,000
- Request Type: new_purchase
- Vendor: New vendor (not pre-approved)
- Category: SaaS
- Has PII data access: Yes
- New vendor with data storage: Yes

Expected Assessment:
- Tier: 3 (High Risk)
- requiresIt: true (new vendor with data)
- requiresCompliance: true (PII, new vendor with data processing)
- requiresFinance: true (≥$10K)
- requiresCio: false (under $50K, no AI/ML, no portfolio)
- requiresParallelItCompliance: true


=== SCENARIO 3: $35K AI analytics tool with investment data ===
Expected: Manager → IT + Compliance (parallel) → Finance → CIO

Input:
- Amount: $35,000
- Request Type: new_purchase
- Description: "AI-powered investment analytics platform"
- Has AI/ML: Yes
- Accesses investment data: Yes
- New vendor

Expected Assessment:
- Tier: 4 (Critical Risk)
- aiMlDetected: true
- requiresIt: true
- requiresCompliance: true (investment data)
- requiresFinance: true
- requiresCio: true (AI/ML + investment data triggers)


=== SCENARIO 4: $65K Salesforce renewal, same terms ===
Expected: Manager → Finance → CIO (trigger: >$50K threshold)

Input:
- Amount: $65,000
- Request Type: renewal
- Vendor: Salesforce (pre-approved)
- Use case changed: No

Expected Assessment:
- Tier: 4 (Critical Risk)
- itSkipped: true (pre-approved, no changes)
- complianceSkipped: true (pre-approved, no changes)
- requiresFinance: true (≥$10K)
- requiresCio: true (>$50K)


=== SCENARIO 5: $25K over-budget request ===
Expected: Manager → IT (if needed) → Finance (flagged as over-budget exception)

Input:
- Amount: $25,000
- Request Type: new_purchase
- Department budget remaining: $15,000 (over by $10K)
- New vendor with data storage: Yes

Expected Assessment:
- isOverBudget: true
- overBudgetAmount: 10,000
- requiresIt: true (new vendor with data)
- requiresFinance: true (over budget + ≥$10K)
- Finance triggers include "Exceeds department budget"


=== SCENARIO 6: $8K/year × 3 year contract ===
Expected: Manager → Finance (trigger: multi-year commitment, $24K total)

Input:
- Amount: $8,000 (annual)
- Contract term: 3_years
- Total commitment: $24,000
- Request Type: new_purchase
- Standard tool, no sensitive data

Expected Assessment:
- Tier: 2 (Medium Risk)
- requiresFinance: true (multi-year commitment)
- Finance triggers include "Multi-year commitment"
- financeAutoApproved: false (despite annual <$10K)


=== SCENARIO 7: Zoom renewal with NEW AI transcription features ===
Expected: Manager → IT (trigger: use case changed) → Finance

Input:
- Amount: $15,000
- Request Type: renewal
- Vendor: Zoom (pre-approved)
- Use case changed: Yes
- Description: "Enabling AI transcription and meeting summaries"

Expected Assessment:
- Tier: 2-3 (use case change on pre-approved)
- itSkipped: false (use case changed)
- itTriggers include "Use case changed - requires IT re-review"
- May trigger compliance if AI features detected
- requiresFinance: true (≥$10K)
- requiresCio: false (under thresholds unless AI triggers CIO)


=== SCENARIO 8: Portfolio company EHR system with PHI, $120K ===
Expected: Manager → IT + Compliance + Legal (parallel) → Finance → CIO

Input:
- Amount: $120,000
- Request Type: new_purchase
- Description: "EHR system for portfolio biotech with patient data"
- Has PHI: Yes
- Is healthcare related: Yes
- Is patient-facing: Yes
- Has portfolio company access: Yes
- New vendor

Expected Assessment:
- Tier: 4 (Critical Risk)
- requiresIt: true (new vendor, PHI, core system likely)
- requiresCompliance: true (PHI, healthcare, patient-facing, portfolio)
- requiresLegal: true (CIO involvement triggers legal)
- requiresFinance: true
- requiresCio: true (>$50K, PHI, portfolio access, healthcare)
- cioTriggers: ["Amount exceeds $50,000", "PHI/Patient data access", "Portfolio company access"]

*/

// Test function to verify routing (can be run in dev)
export function testScenarioRouting() {
  const scenarios = [
    {
      name: "Scenario 1: $8K Zoom renewal, no changes",
      input: {
        amount: 8000,
        requestType: 'renewal' as const,
        riskFactors: { vendorName: 'Zoom', useCaseChanged: false },
        department: 'business_operations' as const,
        departmentBudgetRemaining: 100000,
        description: 'Annual Zoom renewal',
        vendorName: 'Zoom',
      },
      expected: {
        tier: 0,
        financeAutoApproved: true,
        itSkipped: true,
        complianceSkipped: true,
        requiresCio: false,
      }
    },
    {
      name: "Scenario 4: $65K Salesforce renewal, same terms",
      input: {
        amount: 65000,
        requestType: 'renewal' as const,
        riskFactors: { vendorName: 'Salesforce', useCaseChanged: false },
        department: 'investment' as const,
        departmentBudgetRemaining: 200000,
        description: 'Salesforce CRM renewal',
        vendorName: 'Salesforce',
      },
      expected: {
        tier: 4,
        itSkipped: true,
        complianceSkipped: true,
        requiresCio: true,
      }
    },
  ];

  scenarios.forEach(scenario => {
    const result = calculateRiskAssessment(scenario.input);
    console.log(`\n=== ${scenario.name} ===`);
    console.log('Tier:', result.tier, '- Expected:', scenario.expected.tier);
    console.log('CIO Required:', result.requiresCio, '- Expected:', scenario.expected.requiresCio);
    console.log('Approval Path:', result.approvalPath.join(' → '));
    console.log('Routing Reasons:', result.routingReasons);
  });
}
