
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Presentation } from 'lucide-react';

interface PPTPreviewProps {
  slideNumber: number;
  fileName: string;
  slideImageUrl?: string;
  className?: string;
}

const PPTPreview: React.FC<PPTPreviewProps> = ({ 
  slideNumber, 
  fileName, 
  slideImageUrl,
  className = '' 
}) => {
  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
      <div className="aspect-[4/3] relative flex items-center justify-center p-6 sm:p-8">
        {/* Main slide container */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
          {/* PowerPoint header bar */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 flex items-center px-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            </div>
          </div>
          
          {/* Slide content */}
          <div className="p-2">
            {slideImageUrl ? (
              <div className="relative">
                <img 
                  src={slideImageUrl} 
                  alt={`Slide ${slideNumber}`}
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {slideNumber}
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4 min-h-[200px] flex flex-col justify-center">
                {/* Slide number badge */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg mb-2">
                    <span className="text-xl font-bold text-white">{slideNumber}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Slide {slideNumber}
                  </div>
                </div>
                
                {/* Loading state */}
                <div className="text-center text-gray-500 text-sm">
                  Loading slide content...
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* PowerPoint icon indicator */}
        <div className="absolute top-4 right-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 shadow-lg">
          <Presentation className="w-5 h-5 text-white" />
        </div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-6 left-6 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
      </div>
      
      {/* File name display */}
      <div className="px-6 pb-6 text-center">
        <div className="flex items-center justify-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
            {fileName}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PPTPreview;
