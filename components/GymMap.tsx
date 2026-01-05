
import React, { useEffect, useRef } from 'react';
import { GYM_LOCATION } from '../constants/gymConfig';

// Declare Leaflet global type for TS
declare const L: any;

const GymMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize Leaflet map
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(GYM_LOCATION.coords, 14);

      // Add Dark Mode Tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Add Zoom Control at a better position
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Custom Icon logic
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-[#ff8c37] rounded-full animate-ping opacity-25"></div>
            <div class="relative w-4 h-4 bg-[#ff8c37] rounded-full border-2 border-black shadow-[0_0_15px_#ff8c37]"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Add Marker
      const marker = L.marker(GYM_LOCATION.coords, { icon: customIcon }).addTo(mapInstanceRef.current);

      // Custom Popup content
      const popupContent = `
        <div class="p-1">
          <h5 class="font-bebas text-xl italic text-[#ff8c37] mb-1">${GYM_LOCATION.name}</h5>
          <p class="text-[10px] uppercase font-black text-zinc-400 mb-3 tracking-widest">Elite Training Facility</p>
          <p class="text-xs text-zinc-300 mb-4 leading-relaxed">${GYM_LOCATION.address}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${GYM_LOCATION.coords[0]},${GYM_LOCATION.coords[1]}" 
             target="_blank" 
             class="inline-block w-full text-center bg-[#ff8c37] text-black font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">
            Get Directions
          </a>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-800 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <span className="text-orange-brand font-bold tracking-widest uppercase text-sm">Find Us</span>
            <h2 className="font-bebas text-6xl italic mt-2 mb-8">CONTACT HUB.</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 group-hover:border-orange-brand/50 transition-colors">
                  <svg className="w-6 h-6 text-orange-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Our Location</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{GYM_LOCATION.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 group-hover:border-orange-brand/50 transition-colors">
                  <svg className="w-6 h-6 text-orange-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Get In Touch</h4>
                  <p className="text-zinc-400 text-sm">Phone: {GYM_LOCATION.phone}<br />Email: {GYM_LOCATION.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 group-hover:border-orange-brand/50 transition-colors">
                  <svg className="w-6 h-6 text-orange-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Follow The Progress</h4>
                  <a 
                    href={GYM_LOCATION.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-brand text-sm font-bold hover:underline"
                  >
                    Instagram: {GYM_LOCATION.instagram}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-[500px] border border-zinc-800 shadow-2xl animate-in fade-in slide-in-from-right duration-700">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {/* Top Gradient Overlay for depth */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GymMap;