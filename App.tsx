
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
// import TestimonialSection from './components/TestimonialSection';
// import PricingSection from './components/PricingSection';
// import EventList from './components/EventList';
// import GymMap from './components/GymMap';
// import ClientDashboard from './components/ClientDashboard';
// import TrainerDashboard from './components/TrainerDashboard';
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
            <div style={{ padding: '50px', color: 'white' }}>
              <p>✅ Hero component loaded successfully!</p>
            </div>
          </>
        ) : (
          <div style={{ padding: '50px', color: 'white' }}>
            <h1>Dashboard View</h1>
            <p>User: {user?.name}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;