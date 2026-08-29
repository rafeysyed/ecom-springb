import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, Tag, ArrowRight } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useProducts } from '@/features/products/hooks/useProducts';
import { formatCurrency } from '@/utils/formatCurrency';
import Fuse from 'fuse.js';

export function SearchAutocomplete() {
    const navigate = useNavigate();
    const {
        search,
        setSearch,
        setSelectedCategory,
        setSelectedRootCategory,
        setSelectedBrand,
    } = useSearch();

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(search);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: products } = useProducts();

    // Sync input value with context search
    useEffect(() => {
        setInputValue(search);
    }, [search]);

    // Close on outside click or escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Build categories and brands counts
    const { categoryCounts, rootCategoryCounts, brandCounts } = useMemo(() => {
        const catMap = new Map<string, number>();
        const rootCatMap = new Map<string, number>();
        const brandMap = new Map<string, number>();

        if (products) {
            products.forEach((p) => {
                if (p.category) {
                    const c = p.category.trim();
                    catMap.set(c, (catMap.get(c) || 0) + 1);
                }
                if (p.rootCategory) {
                    const rc = p.rootCategory.trim();
                    rootCatMap.set(rc, (rootCatMap.get(rc) || 0) + 1);
                }
                if (p.brand) {
                    const b = p.brand.trim();
                    brandMap.set(b, (brandMap.get(b) || 0) + 1);
                }
            });
        }

        return {
            categoryCounts: Array.from(catMap.entries()).map(([name, count]) => ({ name, count })),
            rootCategoryCounts: Array.from(rootCatMap.entries()).map(([name, count]) => ({ name, count })),
            brandCounts: Array.from(brandMap.entries()).map(([name, count]) => ({ name, count })),
        };
    }, [products]);

    // Build Fuse for products
    const productFuse = useMemo(() => {
        if (!products || products.length === 0) return null;
        return new Fuse(products, {
            keys: [
                { name: 'brand', weight: 0.35 },
                { name: 'category', weight: 0.25 },
                { name: 'rootCategory', weight: 0.2 },
                { name: 'name', weight: 0.15 },
            ],
            threshold: 0.35,
            ignoreLocation: true,
        });
    }, [products]);

    // Live search results
    const suggestions = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) {
            // Default top suggestions when focused with no query
            return {
                matchedCategories: rootCategoryCounts.slice(0, 3).map((rc) => ({ ...rc, isRoot: true })),
                matchedBrands: brandCounts.slice(0, 3),
                matchedProducts: (products || []).slice(0, 4),
                totalMatches: products?.length || 0,
            };
        }

        // Match Root Categories & Categories
        const matchedCats: { name: string; count: number; isRoot: boolean }[] = [];
        rootCategoryCounts.forEach((rc) => {
            if (rc.name.toLowerCase().includes(query)) {
                matchedCats.push({ ...rc, isRoot: true });
            }
        });
        categoryCounts.forEach((c) => {
            if (c.name.toLowerCase().includes(query) && !matchedCats.some((m) => m.name === c.name)) {
                matchedCats.push({ ...c, isRoot: false });
            }
        });

        // Match Brands
        const matchedBrs = brandCounts.filter((b) => b.name.toLowerCase().includes(query));

        // Match Products
        let matchedProds = (products || []);
        if (productFuse) {
            matchedProds = productFuse.search(query).map((r) => r.item);
        } else {
            matchedProds = (products || []).filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query) ||
                    p.category?.toLowerCase().includes(query) ||
                    p.rootCategory?.toLowerCase().includes(query)
            );
        }

        return {
            matchedCategories: matchedCats.slice(0, 4),
            matchedBrands: matchedBrs.slice(0, 4),
            matchedProducts: matchedProds.slice(0, 4),
            totalMatches: matchedProds.length,
        };
    }, [inputValue, products, rootCategoryCounts, categoryCounts, brandCounts, productFuse]);

    const handleSelectCategory = (name: string, isRoot: boolean) => {
        setSearch('');
        if (isRoot) {
            setSelectedRootCategory(name);
            setSelectedCategory(null);
        } else {
            setSelectedCategory(name);
        }
        setSelectedBrand(null);
        setIsOpen(false);
        navigate('/products');
    };

    const handleSelectBrand = (brandName: string) => {
        setSearch('');
        setSelectedBrand(brandName);
        setSelectedRootCategory(null);
        setSelectedCategory(null);
        setIsOpen(false);
        navigate('/products');
    };

    const handleSelectProduct = (productId: string) => {
        setIsOpen(false);
        navigate(`/products/${productId}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(inputValue);
        setSelectedCategory(null);
        setSelectedRootCategory(null);
        setSelectedBrand(null);
        setIsOpen(false);
        navigate('/products');
    };

    const handleClear = () => {
        setInputValue('');
        setSearch('');
        setSelectedCategory(null);
        setSelectedRootCategory(null);
        setSelectedBrand(null);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-text-subtle pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products, brands, categories…"
                    value={inputValue}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    className="w-full pl-9 pr-8 py-2 rounded-full bg-surface-muted/70 text-text placeholder:text-text-subtle text-sm border border-transparent focus:border-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-light transition-all duration-150"
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 text-text-subtle hover:text-text transition-colors p-0.5"
                        aria-label="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </form>

            {/* Autocomplete Overlay */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-border shadow-soft-hover z-50 overflow-hidden text-sm divide-y divide-border animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto">
                    {/* Categories Suggestions */}
                    {suggestions.matchedCategories.length > 0 && (
                        <div className="p-3">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block px-2 mb-1.5">
                                Categories
                            </span>
                            <div className="flex flex-col gap-0.5">
                                {suggestions.matchedCategories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => handleSelectCategory(cat.name, Boolean(cat.isRoot))}
                                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-surface-muted transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-2 text-text font-medium group-hover:text-primary">
                                            <Folder size={14} className="text-text-muted group-hover:text-primary" />
                                            <span>{cat.name}</span>
                                        </div>
                                        <span className="text-xs text-text-muted">
                                            {cat.count} items
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Brand Suggestions */}
                    {suggestions.matchedBrands.length > 0 && (
                        <div className="p-3">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block px-2 mb-1.5">
                                Brands
                            </span>
                            <div className="flex flex-wrap gap-1.5 px-2">
                                {suggestions.matchedBrands.map((b) => (
                                    <button
                                        key={b.name}
                                        type="button"
                                        onClick={() => handleSelectBrand(b.name)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-muted hover:bg-primary-light hover:text-primary transition-colors text-xs font-medium text-text border border-border/50"
                                    >
                                        <Tag size={12} className="text-text-muted" />
                                        <span>{b.name}</span>
                                        <span className="text-[10px] text-text-muted">({b.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Suggestions */}
                    {suggestions.matchedProducts.length > 0 && (
                        <div className="p-3">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block px-2 mb-1.5">
                                Products
                            </span>
                            <div className="flex flex-col gap-1">
                                {suggestions.matchedProducts.map((prod) => (
                                    <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(prod.id)}
                                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-muted shrink-0">
                                            <img
                                                src={prod.mainImage}
                                                alt={prod.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-text group-hover:text-primary line-clamp-1">
                                                {prod.name}
                                            </p>
                                            <span className="text-[11px] text-text-muted uppercase font-semibold">
                                                {prod.brand || prod.category}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-text shrink-0">
                                            {formatCurrency(prod.price, prod.currency)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* View all results CTA footer */}
                    {inputValue.trim() && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary-light/50 flex items-center justify-between transition-colors text-left"
                        >
                            <span>View all results for &ldquo;<strong>{inputValue}</strong>&rdquo;</span>
                            <ArrowRight size={14} />
                        </button>
                    )}

                    {/* Zero results */}
                    {suggestions.matchedCategories.length === 0 &&
                        suggestions.matchedBrands.length === 0 &&
                        suggestions.matchedProducts.length === 0 && (
                            <div className="py-6 px-4 text-center text-xs text-text-muted">
                                No matches found for &ldquo;{inputValue}&rdquo;
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
