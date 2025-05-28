
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 sm:p-16 lg:p-20 text-center bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl max-w-md mx-auto">
        <div className="animate-fade-in space-y-8">
          {/* Enhanced spinner */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 w-20 h-20 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900">
              Analyzing your pitch...
            </h3>
            <p className="text-gray-600 font-light text-base sm:text-lg leading-relaxed">
              Our AI is reviewing your deck for insights
            </p>
            
            {/* Progress indicator dots */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoadingState;
