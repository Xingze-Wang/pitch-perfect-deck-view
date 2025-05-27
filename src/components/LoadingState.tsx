
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card className="p-16 text-center">
      <div className="animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-6 relative">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-brand-blue rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-light text-gray-900 mb-2">
          Analyzing...
        </h3>
        <p className="text-gray-500 font-light">
          This will take just a moment
        </p>
      </div>
    </Card>
  );
};

export default LoadingState;
