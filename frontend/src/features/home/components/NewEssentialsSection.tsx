import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Flame } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

interface EssentialCategory {
    id: string;
    title: string;
    subtitle: string;
    offer: string;
    badge: string;
    rootCategory?: string;
    brandFilter?: string;
    image: string;
    tagColor: string;
}

const ESSENTIALS: EssentialCategory[] = [
    {
        id: 'footwear',
        title: 'Sneakers & Running Footwear',
        subtitle: 'Engineered kicks for gym, track & streets',
        offer: 'UP TO 50% OFF',
        badge: 'MUST HAVE',
        rootCategory: 'Sports & Outdoor',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    {
        id: 'activewear',
        title: 'Sportswear & Sweatshirts',
        subtitle: 'Breathable layers, hoodies & teamwear',
        offer: 'STARTING AT $19',
        badge: 'TRENDING',
        rootCategory: 'Sports & Outdoor',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    {
        id: 'jewelry',
        title: 'Jewelry & Pendant Necklaces',
        subtitle: 'Stainless steel & rose gold statements',
        offer: 'FLAT 40% OFF',
        badge: 'BESTSELLER',
        rootCategory: 'Jewelry & Watches',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    {
        id: 'bags',
        title: 'Bags & Travel Gear',
        subtitle: 'Tote bags, organizers & backpacks',
        offer: 'MIN. 30% OFF',
        badge: 'POPULAR',
        rootCategory: 'Bags & Luggage',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    },
    {
        id: 'home-living',
        title: 'Home & Living Accents',
        subtitle: 'Vase fillers, decor & ambient accessories',
        offer: 'UNDER $25',
        badge: 'NEW DROP',
        rootCategory: 'Home & Living',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    },
    {
        id: 'accessories',
        title: 'Glasses & Everyday Accents',
        subtitle: 'Sunglasses, clips & finishing touches',
        offer: 'FROM $4.99',
        badge: 'HOT DEAL',
        rootCategory: 'Apparel Accessories',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
        tagColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
];

export function NewEssentialsSection() {
    const navigate = useNavigate();
    const { setSelectedRootCategory, setSelectedBrand, setSearch } = useSearch();

    const handleCategoryClick = (cat: EssentialCategory) => {
        setSearch('');
        if (cat.rootCategory) {
            setSelectedRootCategory(cat.rootCategory);
            setSelectedBrand(null);
        } else if (cat.brandFilter) {
            setSelectedBrand(cat.brandFilter);
            setSelectedRootCategory(null);
        }
        navigate('/products');
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                        <Flame size={18} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">The New Essentials</h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Handpicked everyday staples and seasonal wardrobe anchors
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {ESSENTIALS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleCategoryClick(item)}
                        className="group relative flex flex-col rounded-xl overflow-hidden border border-border bg-surface hover:border-primary/40 hover:shadow-soft-hover transition-all text-left"
                    >
                        {/* Image Preview Container */}
                        <div className="relative aspect-4/5 overflow-hidden bg-surface-muted">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            {/* Badge */}
                            <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs tracking-wider border border-white/20">
                                {item.badge}
                            </span>

                            {/* Bottom Offer on Image */}
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                <span className="text-[11px] font-black text-amber-300 block drop-shadow-xs">
                                    {item.offer}
                                </span>
                            </div>
                        </div>

                        {/* Title & Details */}
                        <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                    {item.subtitle}
                                </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[11px] font-semibold text-primary">
                                <span>Shop Now</span>
                                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
