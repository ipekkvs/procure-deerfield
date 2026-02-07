import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, Building2, RefreshCw, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { requests, vendors, renewals, getCurrentUser } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: 'request' | 'vendor' | 'renewal';
  title: string;
  subtitle: string;
  link: string;
}

export function HeaderSearchPopover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();
  
  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);
  
  // Search logic with role-based scoping
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    
    // Filter requests based on role
    let filteredRequests = requests;
    if (currentUser.role === 'requester') {
      filteredRequests = requests.filter(r => r.requesterId === currentUser.id);
    } else if (currentUser.role === 'department_leader') {
      filteredRequests = requests.filter(r => r.department === currentUser.department);
    }
    // Finance, Compliance, IT, CIO, Director can see all
    
    // Search requests
    filteredRequests
      .filter(r => 
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3)
      .forEach(r => {
        searchResults.push({
          id: r.id,
          type: 'request',
          title: r.title,
          subtitle: `${r.department} • $${r.budgetedAmount.toLocaleString()}`,
          link: `/request/${r.id}`,
        });
      });
    
    // Search vendors (all users can search vendors)
    vendors
      .filter(v => 
        v.name.toLowerCase().includes(lowerQuery) ||
        v.category.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3)
      .forEach(v => {
        searchResults.push({
          id: v.id,
          type: 'vendor',
          title: v.name,
          subtitle: `${v.category} • ${v.status}`,
          link: '/vendors',
        });
      });
    
    // Search renewals (all can search)
    renewals
      .filter(r => 
        r.vendorName.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 2)
      .forEach(r => {
        searchResults.push({
          id: r.id,
          type: 'renewal',
          title: r.vendorName,
          subtitle: `$${r.amount.toLocaleString()} • Renews in ${r.daysUntilExpiration} days`,
          link: '/renewals',
        });
      });
    
    setResults(searchResults);
  }, [query, currentUser.role, currentUser.department, currentUser.id]);
  
  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    setOpen(false);
    setQuery("");
  };
  
  const typeIcons = {
    request: FileText,
    vendor: Building2,
    renewal: RefreshCw,
  };
  
  const typeLabels = {
    request: 'Request',
    vendor: 'Vendor',
    renewal: 'Renewal',
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests, vendors..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 cursor-pointer"
            readOnly
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search requests, vendors, renewals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-8"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[320px] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="divide-y">
              {results.map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {typeLabels[result.type]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {results.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs justify-between"
              onClick={() => {
                navigate('/approvals');
                setOpen(false);
              }}
            >
              View all results
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
