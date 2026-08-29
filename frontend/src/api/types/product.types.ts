export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    initialPrice: number;
    currency: string;
    inStock: boolean;
    color: string;
    size: string;
    /** Raw API field is a JSON-encoded string array — parse with parseAllAvailableSizes() */
    allAvailableSizes: string;
    mainImage: string;
    /** Raw API field is a JSON-encoded string array — parse with parseImageUrls() */
    imageUrls: string;
    rating: number;
    reviewsCount: number;
    brand: string;
    category: string;
    rootCategory: string;
    sku: string;
    url: string;
}

/** Safely parses the JSON-string-encoded imageUrls field into a string array. */
export function parseImageUrls(product: Pick<Product, 'imageUrls' | 'mainImage'>): string[] {
    try {
        const parsed = JSON.parse(product.imageUrls);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [product.mainImage];
    } catch {
        return [product.mainImage];
    }
}

/** Safely parses the JSON-string-encoded allAvailableSizes field into a string array. */
export function parseAvailableSizes(product: Pick<Product, 'allAvailableSizes'>): string[] {
    try {
        const parsed = JSON.parse(product.allAvailableSizes);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/** True when the product is discounted relative to its initial price. */
export function isDiscounted(product: Pick<Product, 'price' | 'initialPrice'>): boolean {
    return product.price < product.initialPrice;
}