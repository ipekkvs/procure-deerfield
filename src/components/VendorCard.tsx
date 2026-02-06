import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Vendor, formatCurrency, formatDate } from "@/lib/mockData";
import { Building2, Calendar, DollarSign } from "lucide-react";

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
  className?: string;
}

export function VendorCard({ vendor, onClick, className }: VendorCardProps) {
  const getStatusVariant = () => {
    switch (vendor.status) {
      case 'active': return 'success';
      case 'inactive': return 'neutral';
      case 'pending': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border bg-card card-hover cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{vendor.name}</h3>
            <p className="text-sm text-muted-foreground">{vendor.category}</p>
          </div>
        </div>
        <StatusBadge variant={getStatusVariant()} dot={false}>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </StatusBadge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(vendor.annualSpend)}/yr</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Ends {formatDate(vendor.contractEnd)}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        Owner: {vendor.ownerName}
      </div>
    </div>
  );
}
