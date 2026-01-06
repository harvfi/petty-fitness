
import React, { useState, useEffect } from 'react';
// import Header from './components/Header';
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
    <div className="min-h-screen flex flex-col" style={{ color: 'white', padding: '50px' }}>
      <h1 style={{ fontSize: '48px' }}>PETTYFITNESS 22</h1>
      <p>✅ App.tsx is loading!</p>
      <p>✅ Types imported successfully</p>
      <p>✅ Services imported successfully</p>
      <p>✅ Constants imported successfully</p>
      <p>User: {user ? user.name : 'Not logged in'}</p>
      <button
        onClick={() => handleLogin(login(UserRole.CLIENT))}
        style={{ marginTop: '20px', padding: '10px 20px', background: '#ff8c37', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Test Login
      </button>
    </div>
  );
};

export default App;