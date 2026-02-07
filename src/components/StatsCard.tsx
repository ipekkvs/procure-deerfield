import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  href?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className, href }: StatsCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={cn(
            "text-sm font-medium mt-2",
            trend.positive ? "text-status-success" : "text-status-error"
          )}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link 
        to={href} 
        className={cn(
          "block p-6 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors cursor-pointer",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("p-6 rounded-xl border bg-card", className)}>
      {content}
    </div>
  );
}