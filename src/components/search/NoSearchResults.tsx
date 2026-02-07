import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoSearchResultsProps {
  searchTerm: string;
  onClear: () => void;
}

export function NoSearchResults({ searchTerm, onClear }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No results found</h3>
      <p className="text-muted-foreground text-sm mb-4">
        No results found for "{searchTerm}"
      </p>
      <p className="text-muted-foreground text-xs mb-4">
        Try different keywords or clear your search
      </p>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear Search
      </Button>
    </div>
  );
}
