import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateProduct } from '@/features/admin/hooks/useAdmin';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('Clothing');
    const [rootCategory, setRootCategory] = useState('Women');
    const [price, setPrice] = useState('49.99');
    const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60');
    const [inStock, setInStock] = useState(true);

    const { mutate: createProduct, isPending } = useCreateProduct();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProduct(
            {
                name,
                description,
                brand,
                category,
                rootCategory,
                price: parseFloat(price) || 0,
                mainImage,
                inStock,
            },
            {
                onSuccess: () => {
                    setName('');
                    setDescription('');
                    setBrand('');
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-base font-semibold text-text">Add New Product to Catalog</h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-surface-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    <Input
                        label="Product Title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Classic Organic Cotton Tee"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="e.g. MRKT Studio"
                            required
                        />
                        <Input
                            label="Price ($)"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">Root Category</label>
                            <select
                                value={rootCategory}
                                onChange={(e) => setRootCategory(e.target.value)}
                                className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                            >
                                <option value="Women">Women</option>
                                <option value="Men">Men</option>
                                <option value="Home">Home</option>
                                <option value="Beauty">Beauty</option>
                            </select>
                        </div>
                        <Input
                            label="Subcategory"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Tops & Tees"
                            required
                        />
                    </div>

                    <Input
                        label="Image URL"
                        value={mainImage}
                        onChange={(e) => setMainImage(e.target.value)}
                        placeholder="https://..."
                        required
                    />

                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Enter detailed product description..."
                            className="w-full bg-surface-muted border border-border rounded-lg p-3 text-xs text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="inStock"
                            checked={inStock}
                            onChange={(e) => setInStock(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="inStock" className="text-xs font-medium text-text">
                            Immediately Available in Stock
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                        <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isPending}>
                            Create & Bust Cache
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
