import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
  totalCount?: number;
  showResultsCount?: boolean;
  syncToUrl?: boolean;
  urlParamName?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  resultsCount,
  totalCount,
  showResultsCount = true,
  syncToUrl = false,
  urlParamName = "search",
  className,
  inputClassName,
  ...props
}: SearchInputProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = React.useState(value);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  // Sync from URL on mount
  React.useEffect(() => {
    if (syncToUrl) {
      const urlSearch = searchParams.get(urlParamName);
      if (urlSearch && urlSearch !== value) {
        onChange(urlSearch);
        setLocalValue(urlSearch);
      }
    }
  }, []);

  // Sync to URL when value changes
  React.useEffect(() => {
    if (syncToUrl) {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(urlParamName, value);
      } else {
        newParams.delete(urlParamName);
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [value, syncToUrl, urlParamName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Debounce the actual onChange
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const showClear = localValue.length > 0;
  const showResults = showResultsCount && resultsCount !== undefined && totalCount !== undefined && localValue.length >= 2;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={100}
          aria-label={placeholder.replace("...", "")}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "md:w-[400px]",
            inputClassName
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {showResults && (
        <p 
          className="text-sm text-muted-foreground" 
          aria-live="polite"
        >
          Showing {resultsCount} of {totalCount} results
        </p>
      )}
    </div>
  );
}

// Hook for search with debounce
export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  initialSearch = ""
) {
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);

  const filteredItems = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return items;
    
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearch);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowerSearch);
        }
        return false;
      })
    );
  }, [items, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    resultsCount: filteredItems.length,
    totalCount: items.length,
    hasSearch: searchTerm.length >= 2,
  };
}
