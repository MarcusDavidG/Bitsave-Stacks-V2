'use client';

import { useState } from 'react';
import { Menu, X, Wallet, TrendingUp, Award, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentPath?: string;
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Wallet, label: 'Dashboard', path: '/' },
    { icon: TrendingUp, label: 'Savings', path: '/savings' },
    { icon: Award, label: 'Badges', path: '/badges' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <nav className={cn(
        "md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="pt-16 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
