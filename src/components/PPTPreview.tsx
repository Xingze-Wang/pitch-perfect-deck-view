
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Presentation } from 'lucide-react';

interface PPTPreviewProps {
  slideNumber: number;
  fileName: string;
  className?: string;
}

const PPTPreview: React.FC<PPTPreviewProps> = ({ slideNumber, fileName, className = '' }) => {
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
          <div className="p-6 space-y-4">
            {/* Slide number badge */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg mb-2">
                <span className="text-xl font-bold text-white">{slideNumber}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Slide {slideNumber}
              </div>
            </div>
            
            {/* Mock slide title */}
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-800 to-gray-600 rounded w-4/5 mx-auto"></div>
              <div className="h-2 bg-gray-300 rounded w-3/5 mx-auto"></div>
            </div>
            
            {/* Mock content area with visual elements */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3">
              {/* Mock chart/graph */}
              <div className="flex items-end justify-center space-x-1 h-12">
                <div className="bg-blue-400 rounded-sm" style={{ width: '8px', height: '60%' }}></div>
                <div className="bg-green-400 rounded-sm" style={{ width: '8px', height: '80%' }}></div>
                <div className="bg-yellow-400 rounded-sm" style={{ width: '8px', height: '40%' }}></div>
                <div className="bg-red-400 rounded-sm" style={{ width: '8px', height: '90%' }}></div>
                <div className="bg-purple-400 rounded-sm" style={{ width: '8px', height: '70%' }}></div>
              </div>
            </div>
            
            {/* Mock bullet points */}
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className={`h-1.5 bg-gray-200 rounded ${i === 1 ? 'w-full' : i === 2 ? 'w-4/5' : 'w-3/5'}`}></div>
                </div>
              ))}
            </div>
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
