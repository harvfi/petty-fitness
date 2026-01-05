
import React, { useEffect, useState } from 'react';
import { getTestimonials } from '../services/dataService';
import { Testimonial } from '../types';

const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetched = getTestimonials();
    // Sort chronologically: Newest timestamps first
    const sorted = [...fetched].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTestimonials(sorted);
  }, []);

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4">
          <div>
            <span className="text-[#d4ff00] font-bold tracking-widest uppercase text-sm">Success Stories</span>
            <h2 className="font-bebas text-6xl italic mt-2">REAL RESULTS.</h2>
          </div>
          <p className="text-zinc-500 max-w-sm">
            Check out how our community members are achieving their dreams and pushing beyond their limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#d4ff00]/50 transition duration-500">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={t.imageUrl || `https://picsum.photos/seed/${t.id}/800/600`} 
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                {t.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                     <svg className="w-16 h-16 text-[#d4ff00]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="flex text-[#d4ff00] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-zinc-300 italic mb-6">"{t.content}"</p>
                <div className="flex items-center space-x-4">
                   <div className="h-px bg-zinc-800 flex-grow"></div>
                   <div className="flex flex-col items-end">
                     <span className="font-bold text-[#d4ff00] whitespace-nowrap">{t.name}</span>
                     <span className="text-[10px] text-zinc-500 uppercase">{new Date(t.date).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
