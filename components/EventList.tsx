
import React, { useEffect, useState, useMemo } from 'react';
import { getEvents, getCurrentUser } from '../services/dataService';
import { GymEvent, User } from '../types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventList: React.FC = () => {
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GymEvent | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewType, setViewType] = useState<'split' | 'full'>('split');

  // Contact state for reservation
  const [contactInfo, setContactInfo] = useState('');
  const [contactError, setContactError] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents());
    setCurrentUser(getCurrentUser());
  }, []);

  const handleReserveClick = (event: GymEvent) => {
    setSelectedEvent(event);
    setIsConfirming(true);

    const user = getCurrentUser();
    let prefill = '';
    if (user) {
      if (user.prefPhone && user.phone) prefill = user.phone;
      else if (user.prefEmail && user.email) prefill = user.email;
      else prefill = user.email || user.phone || '';
    }

    setContactInfo(prefill);
    setContactError(false);
  };

  const handleConfirm = () => {
    if (!contactInfo.trim()) {
      setContactError(true);
      return;
    }

    alert(`Success! You've reserved a spot for "${selectedEvent?.title}". A confirmation has been sent to ${contactInfo}. See you there!`);
    setIsConfirming(false);
    setSelectedEvent(null);
    setContactInfo('');
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setSelectedEvent(null);
    setContactInfo('');
  };

  // Calendar Logic
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad for previous month days
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Fill current month days
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(e => e.date === selectedDate);
  }, [events, selectedDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <section id="classes-schedule" className="py-24 bg-black relative border-t border-zinc-900 min-h-screen">
      <div className="container mx-auto px-4">

        {/* Header and View Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-[#d4ff00] font-bold tracking-widest uppercase text-sm">Gym Schedule</span>
            <h2 className="font-bebas text-7xl italic mt-2">CLASS CALENDAR.</h2>
          </div>

          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setViewType('split')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'split' ? 'bg-[#d4ff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewType('full')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'full' ? 'bg-[#d4ff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Full Calendar
            </button>
          </div>
        </div>

        {viewType === 'split' ? (
          <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-500">
            {/* Split View: Mini Calendar Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 sticky top-24">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bebas text-3xl italic tracking-tight text-white">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-[#d4ff00]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-[#d4ff00]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="text-center text-[10px] uppercase font-black text-zinc-600 tracking-tighter">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    const dateStr = date.toISOString().split('T')[0];
                    const active = selectedDate === dateStr;
                    const dayEvents = getEventsForDate(date);
                    const today = isToday(date);

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(active ? null : dateStr)}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all duration-300
                          ${active ? 'bg-[#d4ff00] text-black font-black scale-110 shadow-[0_0_20px_rgba(212,255,0,0.3)]' : 'hover:bg-zinc-800 text-zinc-300'}
                          ${today && !active ? 'border border-[#d4ff00]/40' : ''}
                        `}
                      >
                        <span className="text-sm">{date.getDate()}</span>
                        {dayEvents.length > 0 && !active && (
                          <div className="w-1 h-1 rounded-full absolute bottom-1.5 bg-[#d4ff00]"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    View All Sessions
                  </button>
                )}
              </div>
            </div>

            {/* Split View: Events List */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="flex items-center space-x-4 mb-8">
                <h3 className="font-bebas text-4xl italic text-white uppercase">
                  {selectedDate ? `SESSIONS ON ${new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}` : 'UPCOMING FLOW'}
                </h3>
                <div className="h-px bg-zinc-800 flex-grow"></div>
              </div>

              {filteredEvents.length > 0 ? filteredEvents.map((e) => {
                const eventDate = e.date ? new Date(e.date + 'T00:00:00') : new Date();
                return (
                  <div key={e.id} className="group flex flex-col sm:flex-row items-start sm:items-center bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800 hover:border-[#d4ff00]/40 transition-all duration-500">
                    <div className="w-full sm:w-40 mb-6 sm:mb-0">
                      <span className="block font-bebas text-4xl text-[#d4ff00] tracking-tight">{eventDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                      <span className="text-zinc-500 uppercase text-[10px] font-black tracking-widest block mt-1">{e.time}</span>
                    </div>
                    <div className="flex-grow pr-8">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${e.category === 'Class' ? 'bg-blue-500/10 text-blue-400' : e.category === 'Workshop' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                          {e.category}
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold text-white group-hover:text-[#d4ff00] transition-colors mb-2">{e.title}</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{e.description}</p>
                    </div>
                    <button
                      onClick={() => handleReserveClick(e)}
                      className="mt-6 sm:mt-0 px-10 py-4 bg-white text-black font-black text-xs uppercase rounded-2xl hover:bg-[#d4ff00] transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                    >
                      Reserve
                    </button>
                  </div>
                );
              }) : (
                <div className="py-32 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest">No sessions scheduled.</p>
                  <button onClick={() => setSelectedDate(null)} className="mt-4 text-[#d4ff00] text-xs font-black uppercase underline decoration-2 underline-offset-4">Reset Schedule</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Full Grid Calendar View */
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] overflow-hidden p-8 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-8">
                  <h3 className="font-bebas text-6xl italic text-white leading-none">
                    {currentMonth.toLocaleString('default', { month: 'long' })} <span className="text-zinc-700">{currentMonth.getFullYear()}</span>
                  </h3>
                  <div className="flex bg-black p-1.5 rounded-2xl border border-zinc-800">
                    <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-zinc-800 rounded-xl transition text-[#d4ff00]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-3 hover:bg-zinc-800 rounded-xl transition text-[#d4ff00]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm font-medium hidden md:block">Click any date to see the daily agenda.</p>
              </div>

              <div className="grid grid-cols-7 border-t border-l border-zinc-800">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="p-4 border-r border-b border-zinc-800 text-center text-xs font-black text-zinc-600 uppercase tracking-widest bg-zinc-900/50">
                    {day}
                  </div>
                ))}
                {daysInMonth.map((date, idx) => {
                  if (!date) return <div key={`full-empty-${idx}`} className="aspect-square bg-black/40 border-r border-b border-zinc-800"></div>;

                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = getEventsForDate(date);
                  const active = selectedDate === dateStr;
                  const today = isToday(date);

                  return (
                    <button
                      key={`full-${dateStr}`}
                      onClick={() => {
                        setSelectedDate(active ? null : dateStr);
                        if (!active) {
                          // Smoothly scroll down to agenda if on mobile
                          if (window.innerWidth < 768) {
                            setTimeout(() => {
                              document.getElementById('daily-agenda')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }
                        }
                      }}
                      className={`
                        aspect-square md:aspect-video p-4 border-r border-b border-zinc-800 flex flex-col items-start justify-start relative transition-all group
                        ${active ? 'bg-[#d4ff00]/10 ring-2 ring-inset ring-[#d4ff00] z-10' : 'hover:bg-white/[0.02]'}
                        ${today ? 'bg-zinc-800/20' : ''}
                      `}
                    >
                      <span className={`text-xl font-bebas italic ${active ? 'text-[#d4ff00]' : today ? 'text-white' : 'text-zinc-500'} group-hover:text-[#d4ff00] transition-colors`}>
                        {date.getDate()}
                      </span>

                      <div className="mt-2 space-y-1 w-full hidden md:block">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div key={i} className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 truncate text-left uppercase font-bold">
                            {e.time} • {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-[#d4ff00] font-black pl-2">+{dayEvents.length - 3} MORE</div>
                        )}
                      </div>

                      {/* Mobile indicators */}
                      <div className="md:hidden flex gap-1 mt-auto">
                        {dayEvents.map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-[#d4ff00]"></div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily agenda drilldown for Full View */}
            {selectedDate && (
              <div id="daily-agenda" className="mt-16 space-y-8 animate-in fade-in slide-in-from-top-8 duration-500">
                <div className="flex items-center space-x-4">
                  <h3 className="font-bebas text-5xl italic text-white">SESSIONS FOR {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</h3>
                  <div className="h-px bg-[#d4ff00]/30 flex-grow"></div>
                  <button onClick={() => setSelectedDate(null)} className="text-[#d4ff00] text-xs font-black uppercase tracking-widest border border-[#d4ff00]/30 px-6 py-2 rounded-full hover:bg-[#d4ff00]/10">Clear Filter</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map(e => (
                    <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] flex items-center justify-between group hover:border-[#d4ff00] transition-all">
                      <div>
                        <div className="text-[#d4ff00] font-bebas text-3xl mb-1">{e.time}</div>
                        <h4 className="text-xl font-bold text-white mb-2">{e.title}</h4>
                        <p className="text-zinc-500 text-sm">{e.description}</p>
                      </div>
                      <button
                        onClick={() => handleReserveClick(e)}
                        className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#d4ff00] transition-colors"
                      >
                        Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleCancel}></div>
          <div className="relative bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#d4ff00]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 group hover:rotate-0 transition-transform">
                <svg className="w-10 h-10 text-[#d4ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bebas text-5xl italic mb-3 tracking-tight">SPOT SECURED?</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Confirm your reservation for <span className="text-white font-bold">{selectedEvent.title}</span> on {selectedEvent.date ? new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString() : 'TBD'}.
              </p>

              <div className="text-left mb-8">
                <label className="block text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-3 ml-2">
                  Confirmation Destination
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    className={`w-full bg-black border ${contactError ? 'border-red-500' : 'border-zinc-800'} rounded-2xl p-5 text-white placeholder-zinc-700 focus:outline-none focus:border-[#d4ff00] transition-colors`}
                    value={contactInfo}
                    onChange={(e) => {
                      setContactInfo(e.target.value);
                      if (e.target.value.trim()) setContactError(false);
                    }}
                    autoFocus
                  />
                  {contactError && (
                    <p className="text-red-500 text-[9px] font-black mt-2 uppercase italic ml-2">Contact details required for your athlete profile.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-[#d4ff00] text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,255,0,0.2)]"
                >
                  Finalize Reservation
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-zinc-900 text-zinc-500 font-black py-5 rounded-2xl uppercase tracking-widest hover:text-white transition-colors"
                >
                  Return to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventList;
