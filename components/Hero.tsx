
import React, { useState } from 'react';
import { login } from '../services/dataService';
import { sendBookingEmail } from '../services/notificationService';
import BookingForm from './BookingForm';

interface HeroProps {
  onJoin: () => void;
}

const Hero: React.FC<HeroProps> = ({ onJoin }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleScrollToPrices = () => {
    const element = document.getElementById('pricing-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookWithMe = () => {
    setShowBookingForm(true);
  };

  const handleBookingFormSubmit = async (formData: { name: string; email: string; phone: string; date: string }) => {
    // Log the user in
    onJoin();

    // Send email notification with booking date
    try {
      const result = await sendBookingEmail(
        formData.name,
        formData.email,
        formData.phone,
        formData.date
      );

      if (!result.success) {
        console.error('Failed to send email notification:', result.error);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden bg-black">
      {/* Booking Form Modal */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSubmit={handleBookingFormSubmit}
        actionType="booking"
      />

      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/fitness-focus/1920/1080"
          alt="Gym background"
          className="w-full h-full object-cover opacity-30 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <span className="text-orange-brand font-black uppercase tracking-[0.4em] text-sm mb-4 block animate-in fade-in duration-700">"Hard work is easy work"</span>
          <h1 className="font-bebas text-8xl md:text-[10rem] italic leading-[0.85] mb-6 animate-in fade-in slide-in-from-left duration-1000">
            PETTYFITNESS <span className="text-orange-brand">22</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl font-medium leading-relaxed">
            Because the harder you work, the easier the work becomes... If you're looking to get in shape, lose weight, and learn new techniques, come see me!
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleBookWithMe}
              className="bg-orange-brand text-black font-black py-5 px-12 rounded-2xl text-lg uppercase transition-all hover:scale-105 orange-glow"
            >
              Book With Me
            </button>
            <button
              onClick={handleScrollToPrices}
              className="border-2 border-white/20 hover:border-orange-brand hover:text-orange-brand text-white font-black py-5 px-12 rounded-2xl text-lg uppercase transition-all"
            >
              View Rates
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;