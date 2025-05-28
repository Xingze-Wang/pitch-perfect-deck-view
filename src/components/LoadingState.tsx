
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-12 sm:p-16 lg:p-20 text-center bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <div className="animate-fade-in space-y-6">
          <div className="w-16 h-16 mx-auto relative">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900">
              Analyzing your pitch...
            </h3>
            <p className="text-gray-500 font-light text-sm sm:text-base leading-relaxed">
              Our AI is reviewing your deck for insights
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoadingState;
