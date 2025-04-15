
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  searchQuery: string;
  isSearchActive?: boolean;
}

export function PaginationControls({
  currentPage,
  hasNextPage,
  onPageChange,
  searchQuery,
  isSearchActive
}: PaginationControlsProps) {
  return (
    <>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          <PaginationItem>
            <PaginationLink isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          
          {hasNextPage && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      
      <p className="text-sm text-gray-500">
        {isSearchActive 
          ? `Showing results for "${searchQuery}" - page ${currentPage}`
          : `Page ${currentPage} - The image will be added to the selected product.`
        }
      </p>
    </>
  );
}
