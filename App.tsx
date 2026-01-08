
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Hero from './components/Hero';
import PricingSection from './components/PricingSection';
import TestimonialSection from './components/TestimonialSection';
import EventList from './components/EventList';
// import GymMap from './components/GymMap'; // Temporarily disabled - investigating Vercel crash
import ClientDashboard from './components/ClientDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import { User, UserRole } from './types';
import { getCurrentUser, logout as clearSession, login } from './services/dataService';
import { GYM_LOCATION } from './constants/gymConfig';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'dashboard'>('home');

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        setView={setView}
        currentView={view}
      />

      <main className="flex-grow">
        {view === 'home' ? (
          <>
            <Hero onJoin={() => handleLogin(login(UserRole.CLIENT))} />
            <PricingSection user={user} onLogin={handleLogin} />
            <TestimonialSection />
            <EventList />
            {/* GymMap temporarily disabled - investigating why safety check doesn't prevent Vercel crash */}
          </>
        ) : (
          <div className="container mx-auto px-4 py-12">
            {user?.role === UserRole.CLIENT ? (
              <ClientDashboard user={user} />
            ) : (
              <TrainerDashboard user={user!} />
            )}
          </div>
        )}
      </main>

      <footer className="bg-zinc-950 py-16 border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-bebas text-6xl mb-4 italic tracking-tighter">PETTYFITNESS <span className="text-orange-brand">22</span></h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8 font-medium">
            "Hard work is easy work" — Proudly serving Charlotte and beyond with elite personal training.
          </p>
          <div className="flex justify-center space-x-8 text-zinc-400 font-black uppercase text-[10px] tracking-[0.3em]">
            <a href={GYM_LOCATION.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-brand transition">Instagram</a>
            <a href={`tel:${GYM_LOCATION.phone.replace(/\D/g, '')}`} className="hover:text-orange-brand transition">{GYM_LOCATION.phone}</a>
          </div>
          <p className="mt-12 text-zinc-700 text-[9px] font-black uppercase tracking-widest">© 2024 PETTYFITNESS 22. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <Analytics />
    </div>
  );
};

export default App;