import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Users, 
  FileText, 
  ClipboardCheck, 
  RefreshCw, 
  Building2, 
  BarChart3, 
  Eye,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  Shield,
  DollarSign
} from "lucide-react";

const sections = [
  {
    id: "opening",
    title: "Opening & Context",
    duration: "2 min",
    icon: Play,
    color: "text-primary",
    steps: [
      {
        action: "Start on the Dashboard as the **Requester** role (Alex Johnson)",
        talking_points: [
          "\"Procure is a purpose-built procurement management platform designed for Deerfield's multi-stakeholder approval workflow.\"",
          "\"It gives every role — from the person making the request to the CIO — a tailored view of what matters to them.\"",
          "\"Let me walk you through a typical procurement journey.\""
        ]
      }
    ]
  },
  {
    id: "requester",
    title: "Scene 1: The Requester Experience",
    duration: "4 min",
    icon: FileText,
    color: "text-blue-600",
    steps: [
      {
        action: "Show the **Requester Dashboard** — point out the 4 stat cards at the top",
        talking_points: [
          "\"As a requester, I immediately see my active requests, what's approved, what's pending, and what needs my attention.\"",
          "\"These cards are clickable — they link directly to filtered views so I can drill down instantly.\""
        ]
      },
      {
        action: "Click **'New Request'** in the sidebar to start a new purchase request",
        talking_points: [
          "\"Submitting a request is a guided 3-step process: Intake, Requirements, and Review.\"",
          "\"Step 1 asks for the basics — what category (SaaS, Hardware, Services), which department, and a redundancy check to prevent duplicate purchases.\""
        ]
      },
      {
        action: "Fill in the intake form: select **SaaS**, **Deerfield Intelligence** department, check redundancy",
        talking_points: [
          "\"The form intelligently adapts — SaaS requests ask for license counts, hardware doesn't.\"",
          "\"The redundancy check is mandatory — it ensures we're not buying something we already have.\""
        ]
      },
      {
        action: "Proceed to **Step 2: Requirements** — enter budget amount, target sign date, justification",
        talking_points: [
          "\"Here's where it gets smart. The system checks the department's remaining budget in real-time.\"",
          "\"If the request exceeds the budget, the requester must provide additional justification and acknowledge it will trigger a Finance exception review.\"",
          "\"This prevents surprises downstream.\""
        ]
      },
      {
        action: "Proceed to **Step 3: Review** — show the summary with approval chain preview",
        talking_points: [
          "\"Before submitting, the requester sees exactly who will need to approve and in what order.\"",
          "\"The approval chain is risk-tiered — a $5k SaaS tool has a simpler path than a $125k platform.\""
        ]
      }
    ]
  },
  {
    id: "roles",
    title: "Scene 2: Role-Based Dashboards",
    duration: "5 min",
    icon: Users,
    color: "text-violet-600",
    steps: [
      {
        action: "Switch to **Dept. Head** (Lisa Park) using the Demo Mode role switcher in the header",
        talking_points: [
          "\"Every role sees a completely different dashboard tailored to their responsibilities.\"",
          "\"The Department Head sees their team's requests, budget utilization, and items awaiting their approval.\""
        ]
      },
      {
        action: "Switch to **Finance** (Sarah Chen)",
        talking_points: [
          "\"Finance sees total spend across all departments, budget utilization rates, and requests flagged for financial review.\"",
          "\"Requests under $10k with budget available are auto-approved by Finance — no bottleneck for small purchases.\""
        ]
      },
      {
        action: "Switch to **IT Security** (Emily Brown)",
        talking_points: [
          "\"IT Security reviews software and technology requests for security compliance.\"",
          "\"Pre-approved vendors get a streamlined review path. New vendors require a full security assessment.\""
        ]
      },
      {
        action: "Switch to **Compliance** (David Lee)",
        talking_points: [
          "\"Compliance focuses on tools handling sensitive data — PHI, investment data, or external integrations.\"",
          "\"They run in parallel with IT Security, so neither blocks the other.\""
        ]
      },
      {
        action: "Switch to **CIO** (Robert Martinez)",
        talking_points: [
          "\"The CIO sees the strategic view — high-value requests over $50k, AI/ML tool acquisitions, and cross-department impact.\"",
          "\"CIO approval is only triggered when strategic criteria are met, keeping them focused on what matters.\""
        ]
      }
    ]
  },
  {
    id: "approvals",
    title: "Scene 3: The Approval Workflow",
    duration: "3 min",
    icon: ClipboardCheck,
    color: "text-green-600",
    steps: [
      {
        action: "Navigate to **Approvals** page (as any approver role)",
        talking_points: [
          "\"The approvals view shows items grouped by priority — what's urgent, what's routine, what's been waiting too long.\"",
          "\"Each card shows the request amount, requester, current stage, and days in the queue.\""
        ]
      },
      {
        action: "Click into a specific request to show the **detail view**",
        talking_points: [
          "\"The detail view shows the complete approval chain — who's approved, who's pending, and the current stage.\"",
          "\"Approvers can see the full context: business justification, budget impact, vendor details, and any negotiation savings.\""
        ]
      },
      {
        action: "Highlight the **risk-tiered approval tiers** concept",
        talking_points: [
          "\"Tier 0: Under $1k — near-instant, minimal approvals.\"",
          "\"Tier 1: $1k-$10k — department head + basic review.\"",
          "\"Tier 2: $10k-$25k — adds Finance review.\"",
          "\"Tier 3: $25k-$50k — adds negotiation step with Dir. of Operations.\"",
          "\"Tier 4: Over $50k — full chain including CIO approval.\"",
          "\"This prevents $500 purchases from requiring CIO sign-off.\""
        ]
      }
    ]
  },
  {
    id: "renewals",
    title: "Scene 4: Renewal Management",
    duration: "2 min",
    icon: RefreshCw,
    color: "text-orange-600",
    steps: [
      {
        action: "Navigate to **Renewals** page",
        talking_points: [
          "\"Contracts auto-generate renewal alerts 90 days before expiration.\"",
          "\"Each renewal shows usage rate, spend, and a recommendation: renew, renegotiate, replace, or cancel.\"",
          "\"Low-usage tools are flagged for potential cost savings.\""
        ]
      }
    ]
  },
  {
    id: "vendors",
    title: "Scene 5: Vendor Management",
    duration: "2 min",
    icon: Building2,
    color: "text-teal-600",
    steps: [
      {
        action: "Navigate to **Vendors** page",
        talking_points: [
          "\"The vendor registry shows all active vendors, contract dates, annual spend, and auto-renewal status.\"",
          "\"Pre-approved vendors are flagged — requests for these vendors skip certain review steps, accelerating procurement.\""
        ]
      }
    ]
  },
  {
    id: "views",
    title: "Scene 6: Individual vs. Manager View",
    duration: "2 min",
    icon: Eye,
    color: "text-indigo-600",
    steps: [
      {
        action: "Switch to a role like **Finance** or **IT Security**, then toggle the **View Mode** switcher in the sidebar (Individual ↔ Manager)",
        talking_points: [
          "\"Leadership roles have dual views. In Manager view, they see team-level dashboards and approvals.\"",
          "\"In Individual view, they see their own personal requests — because even a CIO sometimes needs to buy software.\"",
          "\"This eliminates the need for separate accounts or workarounds.\""
        ]
      }
    ]
  },
  {
    id: "reports",
    title: "Scene 7: Reports & Analytics",
    duration: "2 min",
    icon: BarChart3,
    color: "text-rose-600",
    steps: [
      {
        action: "Navigate to **Reports** (available for non-requester roles)",
        talking_points: [
          "\"Reports are role-specific. IT sees security compliance metrics. Compliance sees audit trails. Managers see spend analytics.\"",
          "\"Requesters don't see the Reports tab — it's not relevant to their workflow.\""
        ]
      }
    ]
  },
  {
    id: "closing",
    title: "Closing & Key Differentiators",
    duration: "2 min",
    icon: Target,
    color: "text-primary",
    steps: [
      {
        action: "Return to **Dashboard** and summarize",
        talking_points: [
          "\"To recap, Procure delivers:\"",
          "**Risk-tiered approvals** — right-sized process for every purchase size",
          "**Parallel reviews** — Compliance and IT don't block each other",
          "**Budget guardrails** — real-time budget checks with exception workflows",
          "**Role-tailored views** — every stakeholder sees exactly what they need",
          "**Vendor intelligence** — pre-approved vendors accelerate procurement",
          "**Renewal automation** — 90-day alerts prevent contract lapses",
          "\"Questions?\""
        ]
      }
    ]
  }
];

const DemoScript = () => {
  const totalMinutes = sections.reduce((sum, s) => sum + parseInt(s.duration), 0);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Sparkles className="w-3 h-3" />
            Internal Document
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Clock className="w-3 h-3" />
            ~{totalMinutes} minutes
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">Procure — Demo Script</h1>
        <p className="text-muted-foreground mt-1">
          A step-by-step walkthrough for presenting the Procure procurement platform to stakeholders.
        </p>
      </div>

      {/* Pre-demo checklist */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Pre-Demo Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-muted-foreground">☐</span>
              Open the app and confirm the <strong>Demo Mode</strong> role switcher is visible in the top header
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-muted-foreground">☐</span>
              Start as the <strong>Requester</strong> role (Alex Johnson) on the Dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-muted-foreground">☐</span>
              Ensure sidebar is expanded (not collapsed) for full navigation labels
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-muted-foreground">☐</span>
              Use a large screen or external monitor for audience visibility
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Key themes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Risk-Tiered Approvals</p>
              <p className="text-xs text-muted-foreground mt-0.5">Right-sized process based on amount and risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-start gap-3">
            <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Role-Tailored Views</p>
              <p className="text-xs text-muted-foreground mt-0.5">Every stakeholder sees what matters to them</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Budget Guardrails</p>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time checks with exception workflows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Sections */}
      {sections.map((section, idx) => (
        <Card key={section.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <section.icon className={`w-5 h-5 ${section.color}`} />
                {section.title}
              </CardTitle>
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {section.duration}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.steps.map((step, stepIdx) => (
              <div key={stepIdx} className="space-y-2">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <p className="font-medium text-sm" dangerouslySetInnerHTML={{ 
                    __html: step.action.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
                <div className="ml-6 space-y-1.5">
                  {step.talking_points.map((point, pointIdx) => (
                    <p 
                      key={pointIdx} 
                      className="text-sm text-muted-foreground pl-3 border-l-2 border-muted"
                      dangerouslySetInnerHTML={{ 
                        __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                      }}
                    />
                  ))}
                </div>
                {stepIdx < section.steps.length - 1 && <Separator className="ml-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Tips */}
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Demo Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Don't rush role switching</strong> — pause to let the audience absorb each dashboard's unique layout</li>
            <li>• <strong>Emphasize the "why"</strong> — explain why each role sees different data, not just that they do</li>
            <li>• <strong>Use the Salesforce $125k request</strong> (REQ-003) as the hero example — it triggers CIO review, negotiation, and Finance approval</li>
            <li>• <strong>Show the budget guardrail</strong> by entering an amount that exceeds department budget in the New Request form</li>
            <li>• <strong>Highlight parallel reviews</strong> — Compliance and IT Security review simultaneously, cutting approval time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoScript;
