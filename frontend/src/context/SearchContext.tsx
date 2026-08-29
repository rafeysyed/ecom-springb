import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SearchContextType {
    search: string;
    setSearch: (query: string) => void;
    selectedCategory: string | null;
    setSelectedCategory: (cat: string | null) => void;
    selectedRootCategory: string | null;
    setSelectedRootCategory: (rootCat: string | null) => void;
    selectedBrand: string | null;
    setSelectedBrand: (brand: string | null) => void;
    resetFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const STORAGE_KEY = 'mrkt_filter_state';

export function SearchProvider({ children }: { children: ReactNode }) {
    // Initialize filter state from sessionStorage if available
    const [filterState, setFilterState] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    search: parsed.search || '',
                    selectedCategory: parsed.selectedCategory || null,
                    selectedRootCategory: parsed.selectedRootCategory || null,
                    selectedBrand: parsed.selectedBrand || null,
                };
            }
        } catch {
            // Ignore parse errors
        }
        return {
            search: '',
            selectedCategory: null,
            selectedRootCategory: null,
            selectedBrand: null,
        };
    });

    // Save to sessionStorage whenever filter state changes
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filterState));
        } catch {
            // Ignore storage errors
        }
    }, [filterState]);

    const setSearch = (query: string) => {
        setFilterState((prev) => ({ ...prev, search: query }));
    };

    const setSelectedCategory = (cat: string | null) => {
        setFilterState((prev) => ({ ...prev, selectedCategory: cat }));
    };

    const setSelectedRootCategory = (rootCat: string | null) => {
        setFilterState((prev) => ({ ...prev, selectedRootCategory: rootCat }));
    };

    const setSelectedBrand = (brand: string | null) => {
        setFilterState((prev) => ({ ...prev, selectedBrand: brand }));
    };

    const resetFilters = () => {
        setFilterState({
            search: '',
            selectedCategory: null,
            selectedRootCategory: null,
            selectedBrand: null,
        });
    };

    return (
        <SearchContext.Provider
            value={{
                search: filterState.search,
                setSearch,
                selectedCategory: filterState.selectedCategory,
                setSelectedCategory,
                selectedRootCategory: filterState.selectedRootCategory,
                setSelectedRootCategory,
                selectedBrand: filterState.selectedBrand,
                setSelectedBrand,
                resetFilters,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
