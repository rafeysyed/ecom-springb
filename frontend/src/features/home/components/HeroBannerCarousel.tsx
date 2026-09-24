import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSearch } from '@/context/SearchContext';

interface BannerSlide {
    id: string;
    tag: string;
    badge: string;
    title: string;
    subtitle: string;
    offer: string;
    ctaText: string;
    brandFilter?: string;
    categoryFilter?: string;
    bgGradient: string;
    accentColor: string;
    image: string;
}

const BANNER_SLIDES: BannerSlide[] = [
    {
        id: 'summer-edit',
        tag: 'THE SUMMER EDIT • 2026',
        badge: '🔥 HOT DROP',
        title: 'Elevate Your Everyday Style',
        subtitle: 'Breezy cuts, premium breathable fabrics, and effortless contemporary silhouettes.',
        offer: 'FLAT 40% - 60% OFF',
        ctaText: 'Explore Collection',
        bgGradient: 'from-violet-950 via-purple-900 to-slate-950',
        accentColor: 'text-purple-300 border-purple-400/30 bg-purple-500/10',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'sneaker-vault',
        tag: 'PERFORMANCE & STREETWEAR',
        badge: '⚡ SNEAKER VAULT',
        title: 'Pace, Power & Street Cred',
        subtitle: 'Engineered kicks and running silhouettes from Nike, Asics, and top athletic brands.',
        offer: 'UP TO 50% OFF',
        ctaText: 'Shop Sneakers',
        brandFilter: 'Nike',
        bgGradient: 'from-sky-950 via-cyan-900 to-slate-950',
        accentColor: 'text-cyan-300 border-cyan-400/30 bg-cyan-500/10',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'luxury-atelier',
        tag: 'TIMELESS LUXURY ATELIER',
        badge: '✨ SIGNATURE PIECES',
        title: 'Statement Jewelry & Modern Accents',
        subtitle: 'Pendant necklaces, stainless steel bracelets, and refined accessories that turn heads.',
        offer: 'MIN. 30% OFF',
        ctaText: 'Discover Jewelry',
        bgGradient: 'from-amber-950 via-stone-900 to-neutral-950',
        accentColor: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'activewear-movement',
        tag: 'URBAN MOVEMENT & ACTIVEWEAR',
        badge: '🌟 NEW ARRIVALS',
        title: 'Active Living, Elevated Everyday',
        subtitle: 'Engineered fleece hoodies, structured polos, travel gear and versatile day-to-night fits.',
        offer: 'NEW SEASON DROP',
        ctaText: 'Shop Activewear',
        brandFilter: 'Kariban',
        bgGradient: 'from-emerald-950 via-teal-900 to-slate-950',
        accentColor: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    },
];

export function HeroBannerCarousel() {
    const navigate = useNavigate();
    const { setSelectedBrand, setSelectedRootCategory, setSearch } = useSearch();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIdx((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIdx((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
    }, []);

    // Automatic rotation every 4.5 seconds (paused on hover)
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(nextSlide, 4500);
        return () => clearInterval(interval);
    }, [isHovered, nextSlide]);

    const handleSlideCta = (slide: BannerSlide) => {
        setSearch('');
        if (slide.brandFilter) {
            setSelectedBrand(slide.brandFilter);
            setSelectedRootCategory(null);
        } else if (slide.categoryFilter) {
            setSelectedRootCategory(slide.categoryFilter);
            setSelectedBrand(null);
        } else {
            setSelectedBrand(null);
            setSelectedRootCategory(null);
        }
        navigate('/products');
    };

    const current = BANNER_SLIDES[currentIdx];

    return (
        <div
            className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-soft group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Banner Container */}
            <div
                className={`relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] bg-gradient-to-br ${current.bgGradient} transition-all duration-700 ease-out flex items-center`}
            >
                {/* Subtle background ambient overlay glow */}
                <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

                <div className="relative z-10 w-full px-6 sm:px-12 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
                    {/* Left content block */}
                    <div
                        key={current.id}
                        className="w-full md:w-3/5 text-left text-white space-y-4 md:space-y-5 animate-in fade-in slide-in-from-left-4 duration-500"
                    >
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border backdrop-blur-md ${current.accentColor}`}>
                                {current.tag}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles size={12} />
                                {current.badge}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                            {current.title}
                        </h1>

                        <p className="text-sm sm:text-base text-gray-300 max-w-xl line-clamp-2 sm:line-clamp-none font-normal leading-relaxed">
                            {current.subtitle}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <span className="text-xs sm:text-sm font-extrabold text-amber-300 bg-black/40 px-3.5 py-1.5 rounded-lg border border-amber-400/20 tracking-wide">
                                {current.offer}
                            </span>
                            <Button
                                variant="white"
                                size="lg"
                                onClick={() => handleSlideCta(current)}
                                className="!text-gray-900 font-bold shadow-lg flex items-center gap-2 group/btn cursor-pointer active:scale-95 transition-transform"
                            >
                                <span className="text-gray-900 font-bold">{current.ctaText}</span>
                                <ArrowRight size={16} className="text-gray-900 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Right visual card showcase */}
                    <div
                        key={`visual-${current.id}`}
                        className="hidden md:block md:w-2/5 animate-in fade-in zoom-in-95 duration-500"
                    >
                        <div className="relative mx-auto w-64 h-80 lg:w-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src={current.image}
                                alt={current.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 block">
                                    {current.tag}
                                </span>
                                <p className="text-sm font-semibold truncate text-white/95">
                                    {current.title}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Chevrons */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                    }}
                    aria-label="Previous banner"
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                    }}
                    aria-label="Next banner"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={24} className="text-white" />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    {BANNER_SLIDES.map((slide, idx) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setCurrentIdx(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`transition-all rounded-full ${
                                currentIdx === idx
                                    ? 'w-7 h-2.5 bg-white shadow-xs'
                                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
