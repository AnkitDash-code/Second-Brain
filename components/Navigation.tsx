import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, MessageCircle, Brain, BookOpen, Network } from 'lucide-react';
import clsx from 'clsx';

interface NavigationProps {
  variant?: 'mobile' | 'desktop';
}

const Navigation: React.FC<NavigationProps> = ({ variant = 'mobile' }) => {
  const navItems = [
    { to: '/', icon: Home, label: 'Timeline' },
    { to: '/insights', icon: Network, label: 'People' },
    { to: '/stories', icon: BookOpen, label: 'Stories' },
    { to: '/capture', icon: PlusCircle, label: 'Add' },
    { to: '/recall', icon: MessageCircle, label: 'Recall' },
  ];

  if (variant === 'desktop') {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col pt-8 pb-4 px-4 z-50">
        <div className="flex items-center gap-3 px-4 mb-10 text-primary-600">
          <Brain className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Second Brain</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 text-xs text-gray-400 border-t border-gray-100">
          <p>© 2024 Second Brain</p>
        </div>
      </aside>
    );
  }

  // Mobile Bottom Navigation
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-2 h-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:hidden">
      <div className="flex justify-around items-center h-full pb-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
              isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;