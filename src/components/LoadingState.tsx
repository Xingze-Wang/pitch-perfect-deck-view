
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card className="p-20 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <div className="animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-8 relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-2xl font-light text-gray-900 mb-3">
          Analyzing your pitch...
        </h3>
        <p className="text-gray-500 font-light text-lg">
          Our AI is reviewing your deck for insights
        </p>
      </div>
    </Card>
  );
};

export default LoadingState;
