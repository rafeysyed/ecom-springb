export function formatCurrency(amount: number | null | undefined, currency?: string | null): string {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    // Normalize and guard currency string against null/empty or invalid codes
    let validCurrency = 'USD';
    if (currency && typeof currency === 'string') {
        const trimmed = currency.trim().toUpperCase();
        // Standard ISO currency codes are 3 uppercase letters (e.g. USD, EUR, GBP, CAD, INR)
        if (/^[A-Z]{3}$/.test(trimmed)) {
            validCurrency = trimmed;
        }
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: validCurrency,
        }).format(validAmount);
    } catch {
        return `$${validAmount.toFixed(2)}`;
    }
}