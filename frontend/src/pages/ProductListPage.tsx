import { PageContainer } from '@/components/layout/PageContainer';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useProductFilters } from '@/features/products/hooks/useProductFilters';
import { X } from 'lucide-react';

export function ProductListPage() {
    const { data: products, isLoading, isError, refetch } = useProducts();

    const {
        rootCategories,
        selectedRootCategory,
        setSelectedRootCategory,
        categories,
        category,
        setCategory,
        brands,
        selectedBrand,
        setSelectedBrand,
        search,
        setSearch,
        sort,
        setSort,
        page,
        setPage,
        totalPages,
        results,
        totalResults,
    } = useProductFilters(products);

    const activeFilterCount =
        (search ? 1 : 0) +
        (selectedRootCategory ? 1 : 0) +
        (category ? 1 : 0) +
        (selectedBrand ? 1 : 0);

    const handleClearAll = () => {
        setSearch('');
        setSelectedRootCategory(null);
        setCategory(null);
        setSelectedBrand(null);
    };

    return (
        <PageContainer>
            <div className="flex flex-col md:flex-row gap-12 min-h-0">
                {/* Sidebar is sticky and styled with clean boundaries */}
                <div className="md:w-64 shrink-0 md:sticky md:top-20 md:self-start">
                    <Sidebar title="Browse">
                        <ProductFilters
                            rootCategories={rootCategories}
                            selectedRootCategory={selectedRootCategory}
                            onRootCategoryChange={setSelectedRootCategory}
                            categories={categories}
                            category={category}
                            onCategoryChange={setCategory}
                            brands={brands}
                            selectedBrand={selectedBrand}
                            onBrandChange={setSelectedBrand}
                            sort={sort}
                            onSortChange={setSort}
                        />
                    </Sidebar>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header with Title & Active Filter Tags */}
                    <div className="flex flex-col gap-2 mb-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-text">
                                    {selectedBrand
                                        ? `Brand: ${selectedBrand}`
                                        : selectedRootCategory ?? (search ? `Search: "${search}"` : 'All Products')}
                                </h1>
                                {category && (
                                    <p className="text-xs text-text-muted mt-0.5">
                                        in <span className="font-medium text-text">{category}</span>
                                    </p>
                                )}
                            </div>
                            {!isLoading && (
                                <span className="text-xs text-text-muted font-medium">
                                    {totalResults} {totalResults === 1 ? 'item' : 'items'}
                                </span>
                            )}
                        </div>

                        {/* Active Filter Badges */}
                        {activeFilterCount > 0 && (
                            <div className="flex items-center flex-wrap gap-1.5 pt-1">
                                {search && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary-light text-primary font-medium">
                                        Query: {search}
                                        <button onClick={() => setSearch('')} aria-label="Remove search filter">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedRootCategory && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-muted text-text font-medium border border-border">
                                        Category: {selectedRootCategory}
                                        <button onClick={() => setSelectedRootCategory(null)} aria-label="Remove category filter">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {category && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-muted text-text font-medium border border-border">
                                        Subcategory: {category}
                                        <button onClick={() => setCategory(null)} aria-label="Remove subcategory filter">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedBrand && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-muted text-text font-medium border border-border">
                                        Brand: {selectedBrand}
                                        <button onClick={() => setSelectedBrand(null)} aria-label="Remove brand filter">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {activeFilterCount > 1 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-text-muted hover:text-danger ml-1 underline transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {isError ? (
                        <ErrorState onRetry={() => refetch()} />
                    ) : (
                        <>
                            <ProductGrid products={results} isLoading={isLoading} />

                            {!isLoading && (
                                <div className="mt-10 pb-4">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}