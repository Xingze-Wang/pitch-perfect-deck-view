
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100 py-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-medium text-gray-900">Pitch Analyzer</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
