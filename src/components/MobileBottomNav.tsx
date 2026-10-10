import React from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Bot, 
  QrCode,
  Menu
} from 'lucide-react';
import { TabType } from '../types';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  pendingReviewsCount: number;
  openMobileMenu: () => void;
  lang: 'en' | 'hi';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingReviewsCount,
  openMobileMenu,
  lang
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors ${
          activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'hi' ? 'डैशबोर्ड' : 'Home'}</span>
      </button>

      <button
        onClick={() => setActiveTab('reviews')}
        className={`flex flex-col items-center py-1.5 px-2 rounded-lg relative transition-colors ${
          activeTab === 'reviews' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'hi' ? 'रिव्यू' : 'Reviews'}</span>
        {pendingReviewsCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('reports')}
        className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors ${
          activeTab === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <TrendingUp className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'hi' ? 'रिपोर्ट्स' : 'Reports'}</span>
      </button>

      <button
        onClick={() => setActiveTab('growth')}
        className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors ${
          activeTab === 'growth' ? 'text-blue-600 font-bold' : 'text-slate-500'
        }`}
      >
        <QrCode className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'hi' ? 'QR & ग्रोथ' : 'Growth'}</span>
      </button>

      <button
        onClick={openMobileMenu}
        className="flex flex-col items-center py-1.5 px-2 rounded-lg text-slate-500 hover:text-slate-800"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'hi' ? 'मेनू' : 'More'}</span>
      </button>
    </nav>
  );
};
