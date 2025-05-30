
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { SlideData } from '@/services/slideParser';

interface SlideCarouselProps {
  slides: SlideData[];
  fileName: string;
  onSlideChange?: (slideNumber: number) => void;
  className?: string;
}

const SlideCarousel: React.FC<SlideCarouselProps> = ({ 
  slides, 
  fileName, 
  onSlideChange,
  className = '' 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    const newSlide = Math.min(currentSlide + 1, slides.length - 1);
    setCurrentSlide(newSlide);
    onSlideChange?.(slides[newSlide].slideNumber);
  };

  const prevSlide = () => {
    const newSlide = Math.max(currentSlide - 1, 0);
    setCurrentSlide(newSlide);
    onSlideChange?.(slides[newSlide].slideNumber);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    onSlideChange?.(slides[index].slideNumber);
  };

  if (!slides || slides.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-500">No slides available</p>
      </Card>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
      <div className="aspect-[4/3] relative flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
          {/* Header bar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 flex items-center px-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            </div>
          </div>
          
          {/* Slide content */}
          <div className="p-2">
            {currentSlideData.imageUrl && (
              <div className="relative">
                <img 
                  src={currentSlideData.imageUrl} 
                  alt={`Slide ${currentSlideData.slideNumber}`}
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {currentSlideData.slideNumber}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation arrows */}
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        {/* File type icon indicator */}
        <div className="absolute top-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
          <FileText className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="px-6 pb-4">
        <div className="flex justify-center space-x-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* File name display */}
      <div className="px-6 pb-6 text-center">
        <div className="flex items-center justify-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
            {fileName} - Slide {currentSlide + 1} of {slides.length}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SlideCarousel;
