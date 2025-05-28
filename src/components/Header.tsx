
import React from 'react';
import { TrendingUp } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 py-6 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-light text-gray-900 tracking-wide">Pitch Analyzer</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
