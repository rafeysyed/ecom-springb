import { useMemo, useState } from 'react';
import type { Product } from '@/api/types/product.types';
import { useSearch } from '@/context/SearchContext';
import Fuse from 'fuse.js';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating';

interface UseProductFiltersOptions {
    pageSize?: number;
}

export function useProductFilters(products: Product[] | undefined, options: UseProductFiltersOptions = {}) {
    const { pageSize = 12 } = options;

    const {
        search,
        setSearch,
        selectedCategory,
        setSelectedCategory,
        selectedRootCategory,
        setSelectedRootCategory,
        selectedBrand,
        setSelectedBrand,
    } = useSearch();

    const [sort, setSort] = useState<SortOption>('relevance');
    const [page, setPage] = useState(1);

    // List of major root categories
    const rootCategories = useMemo(() => {
        if (!products) return [];
        const set = new Set<string>();
        products.forEach((p) => {
            if (p.rootCategory && p.rootCategory.trim() !== '') {
                set.add(p.rootCategory.trim());
            }
        });
        return Array.from(set).sort();
    }, [products]);

    // Subcategories (filtered by selected root category if selected)
    const subCategories = useMemo(() => {
        if (!products) return [];
        let list = products;
        if (selectedRootCategory) {
            list = list.filter((p) => p.rootCategory === selectedRootCategory);
        }
        const set = new Set<string>();
        list.forEach((p) => {
            if (p.category && p.category.trim() !== '') {
                set.add(p.category.trim());
            }
        });
        return Array.from(set).sort();
    }, [products, selectedRootCategory]);

    // Available brands
    const brands = useMemo(() => {
        if (!products) return [];
        const set = new Set<string>();
        products.forEach((p) => {
            if (p.brand && p.brand.trim() !== '') {
                set.add(p.brand.trim());
            }
        });
        return Array.from(set).sort();
    }, [products]);

    // Fuse.js Index configured with field weighting and typo-tolerance
    const fuse = useMemo(() => {
        if (!products || products.length === 0) return null;
        return new Fuse(products, {
            keys: [
                { name: 'brand', weight: 0.35 },
                { name: 'category', weight: 0.25 },
                { name: 'rootCategory', weight: 0.2 },
                { name: 'name', weight: 0.15 },
                { name: 'description', weight: 0.05 },
            ],
            threshold: 0.35, // Balanced typo tolerance
            ignoreLocation: true,
            useExtendedSearch: true,
            minMatchCharLength: 2,
        });
    }, [products]);

    const filtered = useMemo(() => {
        if (!products) return [];

        let result = products;

        // Apply search query via fuzzy weighted search
        if (search.trim()) {
            if (fuse) {
                const searchResults = fuse.search(search.trim());
                result = searchResults.map((r) => r.item);
            } else {
                const q = search.trim().toLowerCase();
                result = result.filter(
                    (p) =>
                        p.name.toLowerCase().includes(q) ||
                        (p.brand && p.brand.toLowerCase().includes(q)) ||
                        (p.category && p.category.toLowerCase().includes(q)) ||
                        (p.rootCategory && p.rootCategory.toLowerCase().includes(q))
                );
            }
        }

        // Apply root category filter
        if (selectedRootCategory) {
            result = result.filter((p) => p.rootCategory === selectedRootCategory);
        }

        // Apply subcategory filter
        if (selectedCategory) {
            result = result.filter((p) => p.category === selectedCategory);
        }

        // Apply brand filter
        if (selectedBrand) {
            result = result.filter((p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
        }

        // Apply sorting
        switch (sort) {
            case 'price-asc':
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                break;
        }

        return result;
    }, [products, fuse, search, selectedRootCategory, selectedCategory, selectedBrand, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleSetRootCategory = (cat: string | null) => {
        setSelectedRootCategory(cat);
        setSelectedCategory(null);
        setPage(1);
    };

    const handleSetCategory = (cat: string | null) => {
        setSelectedCategory(cat);
        setPage(1);
    };

    const handleSetBrand = (b: string | null) => {
        setSelectedBrand(b);
        setPage(1);
    };

    return {
        rootCategories,
        selectedRootCategory,
        setSelectedRootCategory: handleSetRootCategory,
        categories: subCategories,
        category: selectedCategory,
        setCategory: handleSetCategory,
        brands,
        selectedBrand,
        setSelectedBrand: handleSetBrand,
        search,
        setSearch: (value: string) => { setSearch(value); setPage(1); },
        sort,
        setSort,
        page,
        setPage,
        totalPages,
        results: paginated,
        totalResults: filtered.length,
    };
}