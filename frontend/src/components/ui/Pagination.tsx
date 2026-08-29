import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
            {/* Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-sm text-text-muted hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Page X / Y dropdown */}
            <div className="flex items-center gap-1.5">
                <select
                    value={currentPage}
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    aria-label="Select page"
                    className="px-2 py-1 rounded-sm bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
                >
                    {pages.map((page) => (
                        <option key={page} value={page}>
                            {page}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-text-muted">/ {totalPages}</span>
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-sm text-text-muted hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}