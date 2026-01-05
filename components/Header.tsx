
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { login } from '../services/dataService';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';

interface HeaderProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  setView: (view: 'home' | 'dashboard') => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, setView, currentView }) => {
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    setNotifStatus(getNotificationStatus());
  }, []);

  const handleToggleNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) setNotifStatus('granted');
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-900">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          className="font-bebas text-4xl italic tracking-tighter cursor-pointer hover:text-orange-brand transition-all flex items-center"
          onClick={() => setView('home')}
        >
          PETTYFITNESS<span className="text-orange-brand ml-1">22</span>
        </div>

        <nav className="hidden md:flex items-center space-x-10 font-bold text-[10px] uppercase tracking-[0.2em]">
          <button onClick={() => setView('home')} className={`hover:text-orange-brand transition ${currentView === 'home' ? 'text-orange-brand' : 'text-zinc-500'}`}>Portal</button>
          <button onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({behavior:'smooth'})} className="text-zinc-500 hover:text-orange-brand transition">Rates</button>
          {user && (
            <button onClick={() => setView('dashboard')} className={`hover:text-orange-brand transition ${currentView === 'dashboard' ? 'text-orange-brand' : 'text-zinc-500'}`}>
              {user.role === UserRole.TRAINER ? 'Coach View' : 'My Progress'}
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-6">
          <button 
            onClick={handleToggleNotifications}
            className={`transition-all duration-300 ${notifStatus === 'granted' ? 'text-orange-brand drop-shadow-[0_0_8px_rgba(255,140,55,0.5)]' : 'text-zinc-600 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {!user ? (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onLogin(login(UserRole.CLIENT))}
                className="bg-orange-brand text-black px-6 py-2.5 rounded-xl uppercase font-black text-xs orange-glow hover:scale-105 transition active:scale-95"
              >
                Join Now
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-zinc-600 text-[10px] font-black uppercase hidden lg:inline">Athlete: {user.name}</span>
              <button 
                onClick={onLogout}
                className="text-zinc-500 hover:text-white transition text-[10px] uppercase font-black"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;