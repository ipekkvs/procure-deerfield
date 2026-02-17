import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize,
  FileText,
  Shield,
  Users,
  DollarSign,
  RefreshCw,
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
  Building2,
  BarChart3,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============= SLIDE DATA =============

interface Slide {
  id: string;
  render: () => React.ReactNode;
}

function SlideShell({ children, bg = "bg-background" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className={cn("w-[1920px] h-[1080px] relative overflow-hidden", bg)}>
      {children}
    </div>
  );
}

// -- Slide 1: Title --
function TitleSlide() {
  return (
    <SlideShell>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5" />
      <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-primary/3" />
      
      <div className="relative z-10 flex flex-col justify-center h-full px-[160px]">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-4xl">P</span>
          </div>
          <span className="text-5xl font-bold tracking-tight text-foreground">Procure</span>
        </div>
        <h1 className="text-7xl font-bold leading-tight text-foreground max-w-[1200px]">
          Intelligent Procurement<br />
          <span className="text-primary">for Modern Organizations</span>
        </h1>
        <p className="text-3xl text-muted-foreground mt-8 max-w-[900px] leading-relaxed">
          A risk-tiered, role-aware procurement platform that eliminates bottlenecks 
          and gives every stakeholder exactly what they need.
        </p>
        <div className="mt-16 flex items-center gap-4">
          <div className="px-6 py-3 rounded-full bg-primary/10 text-primary text-xl font-medium">
            Built for Deerfield
          </div>
          <div className="px-6 py-3 rounded-full bg-muted text-muted-foreground text-xl">
            6 Departments · 8 Roles · Tiered Approvals
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 2: The Problem --
function ProblemSlide() {
  const problems = [
    { icon: FileText, title: "Manual Routing", desc: "Requests emailed around, lost in inboxes, no visibility into status" },
    { icon: DollarSign, title: "No Budget Guardrails", desc: "Overspending discovered after the fact, no real-time budget checks" },
    { icon: Users, title: "One-Size-Fits-All", desc: "$500 purchases require the same approval chain as $125k platforms" },
    { icon: RefreshCw, title: "Renewal Surprises", desc: "Contracts auto-renew with no review, locking in unused or overpriced tools" },
  ];

  return (
    <SlideShell>
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/3 via-background to-background" />
      <div className="relative z-10 flex flex-col h-full px-[160px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">The Challenge</p>
        <h2 className="text-6xl font-bold text-foreground mb-4">
          Procurement shouldn't be<br />a bottleneck
        </h2>
        <p className="text-2xl text-muted-foreground mb-16 max-w-[800px]">
          Traditional procurement processes create friction, waste budget, and frustrate everyone involved.
        </p>
        <div className="grid grid-cols-2 gap-8 flex-1">
          {problems.map((p, i) => (
            <div key={i} className="flex items-start gap-6 p-8 rounded-2xl border bg-card">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 3: Solution Overview --
function SolutionSlide() {
  const pillars = [
    { icon: Shield, label: "Risk-Tiered Approvals", desc: "5 tiers from $0 to $50k+ — right-sized process for every purchase" },
    { icon: Users, label: "Role-Tailored Views", desc: "8 distinct dashboards — each stakeholder sees only what matters to them" },
    { icon: DollarSign, label: "Budget Guardrails", desc: "Real-time department budget checks with automatic exception workflows" },
    { icon: Zap, label: "Parallel Reviews", desc: "Compliance and IT Security review simultaneously, cutting approval time" },
    { icon: RefreshCw, label: "Renewal Automation", desc: "90-day alerts, usage tracking, and renew/renegotiate/cancel recommendations" },
    { icon: Building2, label: "Vendor Intelligence", desc: "Pre-approved vendors get streamlined review — new vendors get full assessment" },
  ];

  return (
    <SlideShell>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="relative z-10 flex flex-col h-full px-[160px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">The Solution</p>
        <h2 className="text-6xl font-bold text-foreground mb-16">
          Procure — Built for how<br />your team actually works
        </h2>
        <div className="grid grid-cols-3 gap-6 flex-1">
          {pillars.map((p, i) => (
            <div key={i} className="flex flex-col p-8 rounded-2xl border bg-card hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <p.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">{p.label}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 4: Approval Tiers --
function TiersSlide() {
  const tiers = [
    { tier: "0", range: "Under $1k", steps: "Auto-route", color: "bg-emerald-500", approvers: "Dept. Head only" },
    { tier: "1", range: "$1k – $10k", steps: "3 steps", color: "bg-blue-400", approvers: "Dept. Head + Basic Review" },
    { tier: "2", range: "$10k – $25k", steps: "5 steps", color: "bg-primary", approvers: "+ Finance Review" },
    { tier: "3", range: "$25k – $50k", steps: "6 steps", color: "bg-violet-500", approvers: "+ Dir. Ops Negotiation" },
    { tier: "4", range: "Over $50k", steps: "7 steps", color: "bg-rose-500", approvers: "+ CIO Strategic Approval" },
  ];

  return (
    <SlideShell>
      <div className="relative z-10 flex flex-col h-full px-[160px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">Approval Architecture</p>
        <h2 className="text-6xl font-bold text-foreground mb-6">
          Risk-tiered approval chains
        </h2>
        <p className="text-2xl text-muted-foreground mb-14 max-w-[900px]">
          Every purchase gets the right level of scrutiny — no more, no less.
        </p>
        <div className="flex-1 flex flex-col gap-5">
          {tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border bg-card">
              <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl", t.color)}>
                T{t.tier}
              </div>
              <div className="w-[200px]">
                <p className="text-2xl font-semibold text-foreground">{t.range}</p>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">{t.approvers}</p>
              </div>
              <div className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-lg font-medium">
                {t.steps}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 5: Role-Based Views --
function RolesSlide() {
  const roles = [
    { role: "Requester", sees: "My requests, status tracking, action items", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { role: "Dept. Head", sees: "Team requests, budget utilization, pre-approvals", color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" },
    { role: "Finance", sees: "Cross-dept spend, budget alerts, financial reviews", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
    { role: "IT Security", sees: "Software assessments, vendor risk, integration reviews", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    { role: "Compliance", sees: "PHI/data flags, regulatory checks, audit trails", color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
    { role: "Dir. Operations", sees: "Negotiations, vendor management, SLA tracking", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
    { role: "CIO", sees: "Strategic requests, AI/ML tools, portfolio impact", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
  ];

  return (
    <SlideShell>
      <div className="relative z-10 flex flex-col h-full px-[160px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">Personalized Experience</p>
        <h2 className="text-6xl font-bold text-foreground mb-6">
          One platform, seven perspectives
        </h2>
        <p className="text-2xl text-muted-foreground mb-14 max-w-[900px]">
          Every role gets a tailored dashboard, approval queue, and notification set.
        </p>
        <div className="grid grid-cols-2 gap-5 flex-1">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center gap-5 p-5 rounded-xl border bg-card">
              <div className={cn("px-5 py-2.5 rounded-lg font-semibold text-lg whitespace-nowrap", r.color)}>
                {r.role}
              </div>
              <p className="text-lg text-muted-foreground">{r.sees}</p>
            </div>
          ))}
          {/* Individual/Manager toggle */}
          <div className="flex items-center gap-5 p-5 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold text-lg">
              <Eye className="w-5 h-5" />
              Dual View
            </div>
            <p className="text-lg text-muted-foreground">Leadership can toggle between Manager view and Individual (requester) view</p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 6: Workflow Diagram --
function WorkflowSlide() {
  const steps = [
    { label: "Intake", sub: "Requester submits", color: "bg-blue-500" },
    { label: "Requirements", sub: "Budget & details", color: "bg-blue-500" },
    { label: "Dept. Approval", sub: "Manager review", color: "bg-violet-500" },
    { label: "Compliance + IT", sub: "Parallel review", color: "bg-amber-500", parallel: true },
    { label: "Negotiation", sub: "Dir. Ops (>$25k)", color: "bg-teal-500", conditional: true },
    { label: "Finance", sub: "Budget approval", color: "bg-emerald-500" },
    { label: "Final Sign-off", sub: "Dept. Head", color: "bg-violet-500" },
    { label: "Contracting", sub: "Execute & file", color: "bg-primary" },
  ];

  return (
    <SlideShell>
      <div className="relative z-10 flex flex-col h-full px-[120px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">End-to-End Workflow</p>
        <h2 className="text-6xl font-bold text-foreground mb-16">
          From request to contract
        </h2>
        <div className="flex-1 flex items-center">
          <div className="flex items-start gap-3 w-full">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md", s.color)}>
                    {i + 1}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-foreground">{s.label}</p>
                    <p className="text-base text-muted-foreground mt-1">{s.sub}</p>
                    {s.parallel && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium dark:bg-amber-900 dark:text-amber-300">
                        Parallel
                      </span>
                    )}
                    {s.conditional && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                        Conditional
                      </span>
                    )}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex items-center h-16 flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex gap-6">
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <span className="w-4 h-4 rounded bg-amber-500" /> Parallel — runs simultaneously
          </div>
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <span className="w-4 h-4 rounded bg-muted border" /> Conditional — only when triggered
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 7: Key Metrics --
function MetricsSlide() {
  const metrics = [
    { value: "6", label: "Departments", sub: "Managed centrally" },
    { value: "5", label: "Approval Tiers", sub: "Risk-based routing" },
    { value: "90-day", label: "Renewal Alerts", sub: "Before expiration" },
    { value: "35%", label: "Avg. Savings", sub: "Through negotiation" },
  ];

  return (
    <SlideShell>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
      <div className="relative z-10 flex flex-col h-full px-[160px] py-[100px]">
        <p className="text-xl font-semibold text-primary uppercase tracking-widest mb-4">Impact</p>
        <h2 className="text-6xl font-bold text-foreground mb-20">
          Measurable results,<br />immediate impact
        </h2>
        <div className="grid grid-cols-4 gap-8 flex-1">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-card text-center">
              <p className="text-7xl font-bold text-primary mb-4">{m.value}</p>
              <p className="text-2xl font-semibold text-foreground">{m.label}</p>
              <p className="text-lg text-muted-foreground mt-2">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// -- Slide 8: Closing --
function ClosingSlide() {
  return (
    <SlideShell>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-[200px]">
        <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-10">
          <span className="text-primary-foreground font-bold text-5xl">P</span>
        </div>
        <h2 className="text-7xl font-bold text-foreground mb-6">
          Ready to streamline<br />procurement?
        </h2>
        <p className="text-3xl text-muted-foreground max-w-[800px] leading-relaxed mb-12">
          From intake to contract — transparent, compliant, and fast.
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-xl text-muted-foreground">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Risk-tiered approvals
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-3 text-xl text-muted-foreground">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Role-based dashboards
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-3 text-xl text-muted-foreground">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Budget guardrails
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ============= SLIDE DECK =============

const slides: Slide[] = [
  { id: "title", render: () => <TitleSlide /> },
  { id: "problem", render: () => <ProblemSlide /> },
  { id: "solution", render: () => <SolutionSlide /> },
  { id: "tiers", render: () => <TiersSlide /> },
  { id: "roles", render: () => <RolesSlide /> },
  { id: "workflow", render: () => <WorkflowSlide /> },
  { id: "metrics", render: () => <MetricsSlide /> },
  { id: "closing", render: () => <ClosingSlide /> },
];

// ============= PRESENTATION COMPONENT =============

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current;
    const scaleX = parent.clientWidth / 1920;
    const scaleY = parent.clientHeight / 1080;
    setScale(Math.min(scaleX, scaleY));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(updateScale, 100);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [updateScale]);

  const goTo = useCallback((idx: number) => {
    setCurrentSlide(Math.max(0, Math.min(slides.length - 1, idx)));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(currentSlide + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(currentSlide - 1); }
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
      if (e.key === "f" || e.key === "F5") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, goTo, isFullscreen]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={cn(
      "flex flex-col",
      isFullscreen ? "fixed inset-0 z-[9999] bg-black" : "h-[calc(100vh-5rem)]"
    )}>
      {/* Toolbar */}
      {!isFullscreen && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Presentation</h1>
            <span className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === slides.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm" className="gap-2 ml-2" onClick={toggleFullscreen}>
              <Maximize className="w-4 h-4" />
              Present
            </Button>
          </div>
        </div>
      )}

      {/* Slide canvas */}
      <div 
        ref={containerRef} 
        className={cn(
          "flex-1 relative overflow-hidden",
          isFullscreen ? "bg-black cursor-none" : "bg-muted/50"
        )}
        onClick={(e) => {
          if (!isFullscreen) return;
          const x = e.clientX / window.innerWidth;
          if (x > 0.5) goTo(currentSlide + 1);
          else goTo(currentSlide - 1);
        }}
      >
        <div
          className="absolute"
          style={{
            width: 1920,
            height: 1080,
            left: "50%",
            top: "50%",
            marginLeft: -960,
            marginTop: -540,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {slides[currentSlide].render()}
        </div>
      </div>

      {/* Fullscreen controls overlay */}
      {isFullscreen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20" onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm">{currentSlide + 1} / {slides.length}</span>
          <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20" onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === slides.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20 ml-2" onClick={() => document.exitFullscreen()}>
            <Minimize className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Thumbnail strip */}
      {!isFullscreen && (
        <div className="border-t bg-card px-4 py-3 flex gap-3 overflow-x-auto">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goTo(i)}
              className={cn(
                "flex-shrink-0 w-[160px] h-[90px] rounded-lg overflow-hidden border-2 transition-all relative",
                i === currentSlide ? "border-primary shadow-md" : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <div className="absolute inset-0" style={{ transform: `scale(${160 / 1920})`, transformOrigin: "top left" }}>
                {slide.render()}
              </div>
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium">
                {i + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Presentation;
