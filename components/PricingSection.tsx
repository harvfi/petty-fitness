
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { selectPlan, getTrainer, login } from '../services/dataService';
import { notifyTrainerPlanSelection } from '../services/notificationService';

interface PricingSectionProps {
  user: User | null;
  onLogin: (user: User) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ user, onLogin }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState<string>('');

  const services = [
    "Personal Training",
    "Group Fitness",
    "Weight Lifting",
    "Cardio Training",
    "Diet/Nutrition",
    "Weight Loss/Control"
  ];

  const plans = [
    { title: "Single Session", price: "$50", detail: "Per Session", note: "Flexible booking" },
    { title: "Standard Flow", price: "$150", detail: "3 Days a Week", note: "Best for consistency" },
    { title: "Elite Routine", price: "$200", detail: "5 Days a Week", note: "Maximum results" }
  ];

  const handleSelectPlan = (planTitle: string) => {
    if (!user) {
      // Prompt user to log in
      const shouldLogin = window.confirm('Please log in to select a plan. Would you like to log in now?');
      if (shouldLogin) {
        onLogin(login(UserRole.CLIENT));
      }
      return;
    }

    // Update user's plan
    selectPlan(user.id, planTitle);

    // Notify trainer
    const trainer = getTrainer();
    if (trainer) {
      notifyTrainerPlanSelection(user.name, planTitle);
    }

    // Show confirmation
    setConfirmedPlan(planTitle);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 4000);
  };

  return (
    <section id="pricing-plans" className="py-24 bg-black border-t border-zinc-900 relative">
      <div className="container mx-auto px-4">
        {/* Confirmation Toast */}
        {showConfirmation && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
            <div className="bg-[#d4ff00] text-black px-8 py-4 rounded-2xl shadow-2xl border-2 border-black">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-black text-sm uppercase tracking-wider">
                  {confirmedPlan} Selected! Your trainer has been notified.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          <div className="lg:col-span-4 space-y-8">
            <div>
              <span className="text-orange-brand font-bold tracking-widest uppercase text-sm">Our Expertise</span>
              <h2 className="font-bebas text-7xl italic mt-2">SERVICES.</h2>
            </div>
            <ul className="space-y-4">
              {services.map((s, i) => (
                <li key={i} className="flex items-center space-x-4 group">
                  <div className="w-2 h-2 rounded-full bg-orange-brand group-hover:scale-150 transition-transform"></div>
                  <span className="text-xl font-bold text-zinc-300 group-hover:text-white transition-colors">{s}</span>
                </li>
              ))}
            </ul>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-orange-brand font-black block mb-2 uppercase tracking-widest">Notice:</span>
                $25 deposit required to lock in your day and time. All sessions are professionally coached to ensure form and results.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              const isSelected = user?.selectedPlan === plan.title;
              return (
                <div
                  key={i}
                  className={`bg-zinc-900 border p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all group relative ${isSelected
                      ? 'border-[#d4ff00] shadow-[0_0_30px_rgba(212,255,0,0.3)]'
                      : 'border-zinc-800 hover:border-orange-brand/50'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 bg-[#d4ff00] text-black rounded-full p-2 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-bebas text-3xl italic mb-6 text-zinc-400 group-hover:text-white">{plan.title}</h3>
                  <div className="mb-2">
                    <span className="text-6xl font-bebas text-orange-brand italic">{plan.price}</span>
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">{plan.detail}</div>
                  <p className="text-zinc-500 text-sm mb-12">{plan.note}</p>
                  <button
                    onClick={() => handleSelectPlan(plan.title)}
                    className={`w-full mt-auto font-black py-4 rounded-2xl uppercase text-xs tracking-widest transition-all ${isSelected
                        ? 'bg-[#d4ff00] text-black hover:bg-[#c4ef00]'
                        : 'bg-white text-black hover:bg-orange-brand'
                      }`}
                  >
                    {isSelected ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;