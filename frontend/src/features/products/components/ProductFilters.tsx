import type { SortOption } from '@/features/products/hooks/useProductFilters';
import { Tag } from 'lucide-react';

interface ProductFiltersProps {
    rootCategories: string[];
    selectedRootCategory: string | null;
    onRootCategoryChange: (category: string | null) => void;
    categories: string[];
    category: string | null;
    onCategoryChange: (category: string | null) => void;
    brands: string[];
    selectedBrand: string | null;
    onBrandChange: (brand: string | null) => void;
    sort: SortOption;
    onSortChange: (sort: SortOption) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
    relevance: 'Relevance',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    rating: 'Top Rated',
};

export function ProductFilters({
    rootCategories,
    selectedRootCategory,
    onRootCategoryChange,
    categories,
    category,
    onCategoryChange,
    brands,
    selectedBrand,
    onBrandChange,
    sort,
    onSortChange,
}: ProductFiltersProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Sort */}
            <div>
                <label htmlFor="sort" className="text-[11px] font-semibold text-text-muted tracking-wider uppercase block mb-1.5">
                    Sort by
                </label>
                <div className="relative">
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="w-full appearance-none px-3 py-1.5 pr-8 rounded-md bg-surface text-text border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-medium cursor-pointer transition-colors shadow-soft"
                    >
                        {Object.entries(SORT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Major Categories */}
            <div>
                <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase block mb-2">
                    Categories
                </span>
                <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto pr-2 pb-1">
                    <button
                        onClick={() => onRootCategoryChange(null)}
                        className={`text-left text-xs uppercase tracking-wider py-1.5 px-2.5 rounded-md transition-colors leading-relaxed block w-full whitespace-normal break-words ${
                            selectedRootCategory === null
                                ? 'bg-primary-light text-primary font-semibold'
                                : 'text-text-muted hover:text-text hover:bg-surface-muted font-normal'
                        }`}
                    >
                        All Categories
                    </button>
                    {rootCategories.map((rc) => (
                        <button
                            key={rc}
                            onClick={() => onRootCategoryChange(rc)}
                            className={`text-left text-xs uppercase tracking-wider py-1.5 px-2.5 rounded-md transition-colors leading-relaxed block w-full whitespace-normal break-words ${
                                selectedRootCategory === rc
                                    ? 'bg-primary-light text-primary font-semibold'
                                    : 'text-text-muted hover:text-text hover:bg-surface-muted font-normal'
                            }`}
                        >
                            {rc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subcategories */}
            {categories.length > 0 && selectedRootCategory && (
                <div className="border-t border-border pt-4">
                    <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase block mb-2">
                        Subcategory
                    </span>
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-2 pb-1">
                        <button
                            onClick={() => onCategoryChange(null)}
                            className={`text-left text-xs py-1.5 px-2 rounded transition-colors whitespace-normal break-words ${
                                category === null
                                    ? 'text-primary font-semibold bg-primary-light/50'
                                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                            }`}
                        >
                            All {selectedRootCategory}
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => onCategoryChange(c)}
                                className={`text-left text-xs py-1.5 px-2 rounded transition-colors whitespace-normal break-words ${
                                    category === c
                                        ? 'text-primary font-semibold bg-primary-light/50'
                                        : 'text-text-muted hover:text-text hover:bg-surface-muted'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Brand Filter */}
            {brands.length > 0 && (
                <div className="border-t border-border pt-4">
                    <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase block mb-2">
                        Brand
                    </span>
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-2 pb-1">
                        <button
                            onClick={() => onBrandChange(null)}
                            className={`text-left text-xs py-1.5 px-2 rounded transition-colors whitespace-normal break-words ${
                                selectedBrand === null
                                    ? 'text-primary font-semibold bg-primary-light/50'
                                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                            }`}
                        >
                            All Brands
                        </button>
                        {brands.map((b) => (
                            <button
                                key={b}
                                onClick={() => onBrandChange(b)}
                                className={`flex items-center gap-1.5 text-left text-xs py-1.5 px-2 rounded transition-colors whitespace-normal break-words ${
                                    selectedBrand === b
                                        ? 'text-primary font-semibold bg-primary-light/50'
                                        : 'text-text-muted hover:text-text hover:bg-surface-muted'
                                }`}
                            >
                                <Tag size={10} className="shrink-0 text-text-subtle" />
                                <span>{b}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}