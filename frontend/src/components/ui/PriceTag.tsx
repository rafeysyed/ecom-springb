import { formatCurrency } from '@/utils/formatCurrency';
import { isDiscounted, type Product } from '@/api/types/product.types';

interface PriceTagProps {
    product: Pick<Product, 'price' | 'initialPrice' | 'currency'>;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
};

export function PriceTag({ product, size = 'md' }: PriceTagProps) {
    const discounted = isDiscounted(product);

    return (
        <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-text ${SIZE_CLASSES[size]}`}>
                {formatCurrency(product.price, product.currency)}
            </span>
            {discounted && (
                <span className="text-sm text-text-subtle line-through">
                    {formatCurrency(product.initialPrice, product.currency)}
                </span>
            )}
        </div>
    );
}