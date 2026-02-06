import { cn } from "@/lib/utils";
import { RequestCategory } from "@/lib/mockData";
import { Cloud, Monitor, Wrench, Package } from "lucide-react";

const categories = [
  { id: 'saas' as RequestCategory, label: 'SaaS / Software', icon: Cloud, description: 'Cloud software and subscriptions' },
  { id: 'hardware' as RequestCategory, label: 'Hardware', icon: Monitor, description: 'Physical equipment and devices' },
  { id: 'services' as RequestCategory, label: 'Professional Services', icon: Wrench, description: 'Consulting, contractors, etc.' },
  { id: 'other' as RequestCategory, label: 'Other', icon: Package, description: 'Anything else' },
];

interface CategorySelectorProps {
  selectedCategory: RequestCategory | null;
  detectedCategory: RequestCategory | null;
  onSelect: (category: RequestCategory) => void;
}

export function CategorySelector({ 
  selectedCategory, 
  detectedCategory, 
  onSelect 
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const isDetected = !selectedCategory && detectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "p-4 rounded-lg border text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : isDetected
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isSelected || isDetected ? "bg-primary/20" : "bg-muted"
              )}>
                <cat.icon className={cn(
                  "w-5 h-5",
                  isSelected || isDetected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
