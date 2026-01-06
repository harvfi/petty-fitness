
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
// import Hero from './components/Hero';
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

      <main className="flex-grow" style={{ padding: '50px', color: 'white' }}>
        <h1 style={{ fontSize: '48px' }}>Testing Components</h1>
        <p>✅ Header component loaded successfully!</p>
        <p>User: {user ? user.name : 'Not logged in'}</p>
      </main>
    </div>
  );
};

export default App;