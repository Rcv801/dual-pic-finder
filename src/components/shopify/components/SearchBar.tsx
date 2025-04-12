
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchInputValue: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function SearchBar({ 
  searchInputValue, 
  onSearchInputChange, 
  onSearch, 
  onClear 
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="flex space-x-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products by title..."
          value={searchInputValue}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="pl-9 pr-9"
          autoComplete="off"
        />
        {searchInputValue && (
          <button 
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button 
        type="submit" 
        size="sm"
        title="Search products by name - use partial terms like 'zip' for 'zippo'"
      >
        Search
      </Button>
    </form>
  );
}
