import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';
import { Eye, Type } from 'lucide-react';

const Layout: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="min-h-screen bg-calm-50 flex">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col justify-between relative z-50">
        <Navigation variant="desktop" />
        
        {/* Accessibility Toggle (Desktop) */}
        <div className="fixed bottom-4 left-4 w-56 p-4">
           <button 
             onClick={() => setHighContrast(!highContrast)}
             className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
           >
             <Eye className="w-4 h-4" />
             {highContrast ? "High Contrast On" : "Accessibility Mode"}
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {/* Mobile Header for Accessibility */}
        <div className="md:hidden absolute top-4 right-4 z-40">
           <button 
             onClick={() => setHighContrast(!highContrast)}
             className="p-2 bg-white rounded-full shadow-md text-gray-600"
           >
             <Eye className="w-5 h-5" />
           </button>
        </div>

        <div className="h-full w-full max-w-7xl mx-auto md:px-8 md:py-8">
           <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav - Hidden on Desktop */}
      <div className="md:hidden">
        <Navigation variant="mobile" />
      </div>
    </div>
  );
};

export default Layout;