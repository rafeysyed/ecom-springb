import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { RatingStars } from '@/components/ui/RatingStars';
import { formatCurrency } from '@/utils/formatCurrency';
import { useProducts } from '@/features/products/hooks/useProducts';
import { CreateProductModal } from '@/features/admin/components/CreateProductModal';

export function AdminProductsPage() {
    const { data: products, isLoading } = useProducts();
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (isLoading) {
        return <LoadingState label="Loading product catalog..." />;
    }

    const filtered = (products || []).filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Filter products by title, brand, or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder:text-text-subtle focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                </div>

                <Button onClick={() => setIsCreateOpen(true)} className="text-xs shrink-0">
                    <Plus size={15} className="mr-1.5" />
                    Add New Product
                </Button>
            </div>

            {/* Inventory List Table */}
            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-surface-muted border-b border-border text-text-muted font-medium">
                            <tr>
                                <th className="p-3.5 pl-4">Product</th>
                                <th className="p-3.5">Brand</th>
                                <th className="p-3.5">Category</th>
                                <th className="p-3.5">Rating</th>
                                <th className="p-3.5">Price</th>
                                <th className="p-3.5 pr-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filtered.slice(0, 50).map((p) => (
                                <tr key={p.id} className="hover:bg-surface-muted/40 transition-colors">
                                    <td className="p-3.5 pl-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border overflow-hidden shrink-0">
                                            <img src={p.mainImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0 max-w-xs">
                                            <p className="font-medium text-text truncate">{p.name}</p>
                                            <span className="text-[10px] font-mono text-text-subtle">ID: {String(p.id).slice(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="p-3.5 font-semibold text-text uppercase tracking-wide text-[11px]">
                                        {p.brand || 'MRKT'}
                                    </td>
                                    <td className="p-3.5 text-text-muted">
                                        <span className="bg-surface-muted border border-border px-2 py-0.5 rounded-md text-[10px]">
                                            {p.rootCategory ? `${p.rootCategory} > ` : ''}{p.category}
                                        </span>
                                    </td>
                                    <td className="p-3.5">
                                        <RatingStars rating={p.rating} reviewsCount={p.reviewsCount} />
                                    </td>
                                    <td className="p-3.5 font-semibold text-text">
                                        {formatCurrency(p.price, p.currency)}
                                    </td>
                                    <td className="p-3.5 pr-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            p.inStock ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                                        }`}>
                                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-3 bg-surface-muted/40 border-t border-border text-[11px] text-text-muted text-center">
                    Showing top {Math.min(50, filtered.length)} of {filtered.length} products
                </div>
            </Card>

            <CreateProductModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </div>
    );
}
