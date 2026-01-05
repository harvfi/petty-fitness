
import React from 'react';

const PricingSection: React.FC = () => {
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

  return (
    <section id="pricing-plans" className="py-24 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4">
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
            {plans.map((plan, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:border-orange-brand/50 transition-all group">
                <h3 className="font-bebas text-3xl italic mb-6 text-zinc-400 group-hover:text-white">{plan.title}</h3>
                <div className="mb-2">
                  <span className="text-6xl font-bebas text-orange-brand italic">{plan.price}</span>
                </div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">{plan.detail}</div>
                <p className="text-zinc-500 text-sm mb-12">{plan.note}</p>
                <button className="w-full mt-auto bg-white text-black font-black py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-orange-brand transition-all">Select Plan</button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;