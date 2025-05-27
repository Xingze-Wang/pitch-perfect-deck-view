
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-yc-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Pitch Deck Analyzer</h1>
            <p className="text-sm text-yc-gray">Analyze your startup pitch with YC insights</p>
          </div>
        </div>
        <div className="text-sm text-yc-gray">
          Powered by Y Combinator methodology
        </div>
      </div>
    </header>
  );
};

export default Header;
