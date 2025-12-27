import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Slide {
    id: string;
    image: string;
    title: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
}

interface DashboardCarouselProps {
    slides: Slide[];
    autoPlayInterval?: number;
}

const DashboardCarousel: React.FC<DashboardCarouselProps> = ({
    slides,
    autoPlayInterval = 5000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, autoPlayInterval]);

    if (!slides.length) return null;

    return (
        <div
            className="relative w-full max-w-full overflow-hidden rounded-[2rem] shadow-2xl group h-[250px] sm:h-[300px] md:h-[400px] mb-8 border border-white/10 dark:border-white/5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            <div
                className="flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="min-w-full h-full relative"
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay - Premium Multilayered */}
                        <div className="absolute inset-0 bg-slate-900/40 p-6 sm:p-10 md:p-14 flex flex-col justify-end">
                            <div className={`transform transition-all duration-1000 delay-200 ${currentIndex === slides.findIndex(s => s.id === slide.id) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 text-white tracking-tighter uppercase leading-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-6 md:mb-8 max-w-2xl font-medium leading-relaxed drop-shadow-sm line-clamp-2">
                                    {slide.description}
                                </p>
                                {slide.ctaText && (
                                    <button className="bg-white text-slate-900 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 shadow-xl flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
                                        {slide.ctaText}
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons - More visible and premium */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/20"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/20"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicators - Premium bar indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-500 rounded-full border border-white/10 ${index === currentIndex
                            ? 'w-3 h-3 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-110'
                            : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardCarousel;

