import { useState } from 'react';

interface ProductGalleryProps {
    images: string[];
    alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = images[activeIndex] ?? images[0];

    return (
        <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-lg overflow-hidden bg-surface-muted shadow-soft">
                <img src={activeImage} alt={alt} className="w-full h-full object-cover" />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={img + i}
                            onClick={() => setActiveIndex(i)}
                            className={`
                shrink-0 w-16 h-16 rounded-md overflow-hidden
                border-2 transition-colors
                ${i === activeIndex ? 'border-primary' : 'border-transparent hover:border-border'}
              `}
                            aria-label={`View image ${i + 1}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}