
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { History, X } from "lucide-react";

interface SearchHistoryProps {
  history: string[][];
  onSelectHistory: (terms: string[]) => void;
  onClearHistory: () => void;
}

const SearchHistory = ({ history, onSelectHistory, onClearHistory }: SearchHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Search History</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Recent Searches</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-8 px-2 text-muted-foreground"
          >
            Clear All
          </Button>
        </div>
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {history.map((terms, i) => (
            <div
              key={i}
              className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md"
            >
              <div className="flex gap-1 flex-wrap flex-1">
                {terms.map((term, j) => (
                  <span
                    key={j}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {term}
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSelectHistory(terms)}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchHistory;
