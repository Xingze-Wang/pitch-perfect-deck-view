
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 sm:p-16 lg:p-20 text-center bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl max-w-md mx-auto">
        <div className="animate-fade-in space-y-8">
          {/* Simple loading text */}
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900">
              Analyzing your pitch...
            </h3>
            <p className="text-gray-600 font-light text-base sm:text-lg leading-relaxed">
              Our AI is reviewing your deck for insights
            </p>
            
            {/* Simple dots without circle */}
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
