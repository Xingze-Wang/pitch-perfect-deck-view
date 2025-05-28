
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Play } from 'lucide-react';

interface PPTPreviewProps {
  slideNumber: number;
  fileName: string;
  className?: string;
}

const PPTPreview: React.FC<PPTPreviewProps> = ({ slideNumber, fileName, className = '' }) => {
  return (
    <Card className={`bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl rounded-xl overflow-hidden ${className}`}>
      <div className="aspect-[4/3] relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* PowerPoint-style slide mockup */}
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border-2 border-gray-200 relative overflow-hidden">
          {/* Slide header */}
          <div className="bg-blue-600 h-2"></div>
          
          {/* Slide content area */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Slide number indicator */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">{slideNumber}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                第 {slideNumber} 页
              </div>
            </div>
            
            {/* Mock content lines */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-4/5 mx-auto"></div>
              <div className="h-2 bg-gray-200 rounded w-3/5 mx-auto"></div>
            </div>
            
            {/* Mock chart/image area */}
            <div className="bg-gray-100 rounded-lg h-16 sm:h-20 flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-400" />
            </div>
            
            {/* Mock bullet points */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="h-1.5 bg-gray-200 rounded flex-1"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* PowerPoint icon overlay */}
        <div className="absolute top-4 right-4 bg-orange-500 rounded-lg p-2 shadow-lg">
          <FileText className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* File name */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600 truncate">
          {fileName}
        </p>
      </div>
    </Card>
  );
};

export default PPTPreview;
