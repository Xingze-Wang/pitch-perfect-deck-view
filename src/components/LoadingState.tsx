
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card className="p-8">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="w-16 h-16 border-4 border-yc-lightgray border-t-yc-orange rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analyzing your pitch deck...
        </h3>
        <p className="text-yc-gray">
          Our AI is reviewing your presentation using YC methodology
        </p>
        <div className="mt-6 space-y-2">
          <div className="text-sm text-yc-gray">Checking slide structure...</div>
          <div className="text-sm text-yc-gray">Evaluating market analysis...</div>
          <div className="text-sm text-yc-gray">Reviewing financial projections...</div>
        </div>
      </div>
    </Card>
  );
};

export default LoadingState;
