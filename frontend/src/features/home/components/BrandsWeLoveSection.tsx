import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

interface FeaturedBrand {
    name: string;
    tagline: string;
    discount: string;
    badge: string;
    image: string;
    accentColor: string;
}

const FEATURED_BRANDS: FeaturedBrand[] = [
    {
        name: 'Nike',
        tagline: 'Iconic athletic footwear & sportswear',
        discount: 'UP TO 50% OFF',
        badge: 'TOP SELLER',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60',
    },
    {
        name: 'Asics',
        tagline: 'Precision engineered running & trail shoes',
        discount: 'FLAT 35% OFF',
        badge: 'PRO CHOICE',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60',
    },
    {
        name: 'SHEIN',
        tagline: 'Trend-forward apparel, bags & decor',
        discount: 'MIN. 40% OFF',
        badge: 'TRENDING',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-pink-500/30 bg-pink-500/5 hover:border-pink-500/60',
    },
    {
        name: 'Unbeatablesale',
        tagline: 'Fine stainless jewelry & lifestyle staples',
        discount: 'STARTING $12.99',
        badge: 'EXCLUSIVE',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60',
    },
    {
        name: 'Kariban',
        tagline: 'Structured cotton polos & sporty layers',
        discount: 'NEW ARRIVALS',
        badge: 'PREMIUM',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
    },
    {
        name: 'Nickelodeon',
        tagline: 'Fan-favorite collectables & figurines',
        discount: 'SPECIAL PICKS',
        badge: 'FAN FAVORITE',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop',
        accentColor: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60',
    },
];

export function BrandsWeLoveSection() {
    const navigate = useNavigate();
    const { setSelectedBrand, setSelectedRootCategory, setSearch } = useSearch();

    const handleBrandClick = (brandName: string) => {
        setSearch('');
        setSelectedRootCategory(null);
        setSelectedBrand(brandName);
        navigate('/products');
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                        <Heart size={18} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Brands We Love</h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Official collections and limited-time savings from our most-requested brands
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {FEATURED_BRANDS.map((brand) => (
                    <button
                        key={brand.name}
                        type="button"
                        onClick={() => handleBrandClick(brand.name)}
                        className={`group p-3 sm:p-4 rounded-xl border transition-all text-left flex flex-col justify-between bg-surface hover:shadow-soft-hover ${brand.accentColor}`}
                    >
                        <div>
                            {/* Brand Header */}
                            <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">
                                    {brand.badge}
                                </span>
                                <span className="text-[10px] font-extrabold text-primary">
                                    {brand.discount}
                                </span>
                            </div>

                            {/* Brand Image Preview */}
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-surface-muted mb-3">
                                <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>

                            <h3 className="text-sm font-extrabold text-text group-hover:text-primary transition-colors tracking-tight">
                                {brand.name}
                            </h3>
                            <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">
                                {brand.tagline}
                            </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] font-semibold text-primary">
                            <span>Explore</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
