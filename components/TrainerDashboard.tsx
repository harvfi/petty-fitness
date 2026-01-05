
import React, { useState, useEffect, useMemo } from 'react';
import { User, Testimonial, GymEvent, Workout, UserRole } from '../types';
import { saveTestimonial, saveEvent, getAllWorkouts, updateWorkout, getUsers, updateUser } from '../services/dataService';
import { enhanceTestimonial, generateNutritionPlan } from '../services/geminiService';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';

interface TrainerDashboardProps {
  user: User;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'events' | 'clients' | 'nutrition' | 'settings'>('clients');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  
  // Clients state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Nutrition Hub state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [tempNutritionText, setTempNutritionText] = useState('');

  // Form States
  const [testForm, setTestForm] = useState({ name: '', content: '' });
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '09:00 AM', 
    category: 'Class' as 'Class' | 'Workshop' | 'Special' 
  });

  useEffect(() => {
    setNotifStatus(getNotificationStatus());
    setAllWorkouts(getAllWorkouts());
    const clients = getUsers().filter(u => u.role === UserRole.CLIENT);
    setAllUsers(clients);
    if (clients.length > 0) {
      setSelectedClientId(clients[0].id);
      setTempNutritionText(clients[0].nutritionPlan || '');
    }
  }, []);

  useEffect(() => {
    const client = allUsers.find(u => u.id === selectedClientId);
    if (client) {
      setTempNutritionText(client.nutritionPlan || '');
    }
  }, [selectedClientId, allUsers]);

  const handleSaveNutrition = () => {
    const client = allUsers.find(u => u.id === selectedClientId);
    if (client) {
      const updated = { ...client, nutritionPlan: tempNutritionText };
      updateUser(updated);
      setAllUsers(getUsers().filter(u => u.role === UserRole.CLIENT));
      alert(`Nutrition plan assigned to ${client.name}!`);
    }
  };

  const handleAiNutrition = async () => {
    const client = allUsers.find(u => u.id === selectedClientId);
    if (!client) return;
    setIsGeneratingNutrition(true);
    const plan = await generateNutritionPlan(client.goal || 'General Fitness', client.name);
    setTempNutritionText(plan);
    setIsGeneratingNutrition(false);
  };

  // ... rest of the existing handlers (feedback, events, testimonials)
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) setNotifStatus('granted');
  };

  const handleEnhance = async () => {
    if (!testForm.content) return;
    setIsEnhancing(true);
    const enhanced = await enhanceTestimonial(testForm.content);
    setTestForm({ ...testForm, content: enhanced });
    setIsEnhancing(false);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t: Testimonial = { ...testForm, id: Date.now().toString(), date: new Date().toISOString() };
    saveTestimonial(t);
    setTestForm({ name: '', content: '' });
    alert('Testimonial added to landing page!');
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ev: GymEvent = { ...eventForm, id: Date.now().toString() };
    saveEvent(ev);
    setEventForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00 AM', category: 'Class' });
    alert('Event published successfully!');
  };

  const handleStartFeedback = (workout: Workout) => {
    setEditingFeedbackId(workout.id);
    setFeedbackText(workout.feedback || '');
  };

  const handleSaveFeedback = (workout: Workout) => {
    const updated = { ...workout, feedback: feedbackText };
    updateWorkout(updated);
    setAllWorkouts(getAllWorkouts());
    setEditingFeedbackId(null);
    setFeedbackText('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="font-bebas text-6xl italic uppercase">TRAINER HUB.</h1>
        <p className="text-zinc-400 font-medium tracking-tight">Coach Dashboard — Elite Performance Management.</p>
      </div>

      <div className="flex space-x-1 border-b border-zinc-800 mb-8 overflow-x-auto scrollbar-hide">
        {(['clients', 'nutrition', 'testimonials', 'events', 'settings'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#d4ff00] border-b-2 border-[#d4ff00]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab === 'clients' ? 'Client Roster' : tab === 'nutrition' ? 'Nutrition Hub' : tab === 'testimonials' ? 'Testimonials' : tab === 'events' ? 'Manage Events' : 'Settings'}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl">
        {activeTab === 'clients' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Existing Clients View Implementation */}
            <h3 className="text-4xl font-bebas italic tracking-tight text-[#d4ff00]">CLIENT MANAGEMENT</h3>
            <div className="grid grid-cols-1 gap-6">
              {allUsers.map((client) => (
                <div key={client.id} className="bg-black/60 border border-zinc-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center space-x-8">
                    <div className="w-20 h-20 rounded-2xl bg-[#d4ff00] flex items-center justify-center font-bebas text-4xl text-black italic">{client.name[0]}</div>
                    <div>
                      <h4 className="text-3xl font-bold text-white tracking-tight">{client.name}</h4>
                      <p className="text-[#d4ff00] text-xs font-black uppercase tracking-widest mt-1">{client.goal || 'No Goal Set'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedClientId(client.id); setActiveTab('nutrition'); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                  >
                    Manage Nutrition
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-4xl font-bebas italic tracking-tight text-[#d4ff00] uppercase">NUTRITION STRATEGY</h3>
                <p className="text-zinc-500 text-sm">Assign custom fueling protocols to your athletes.</p>
              </div>
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-black border border-zinc-800 rounded-xl px-6 py-3 text-white text-sm outline-none focus:border-[#d4ff00]"
              >
                {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Macro & Fueling Protocol</label>
                <button 
                  onClick={handleAiNutrition}
                  disabled={isGeneratingNutrition || !selectedClientId}
                  className="bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center space-x-2 hover:bg-[#d4ff00]/20 transition"
                >
                  <svg className={`w-3 h-3 ${isGeneratingNutrition ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>{isGeneratingNutrition ? 'Designing...' : 'Gemini Nutrition Architect'}</span>
                </button>
              </div>
              
              <textarea 
                rows={12}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-6 text-white text-sm leading-relaxed outline-none focus:border-[#d4ff00] transition resize-none font-mono"
                placeholder="Type the nutrition plan here or use the AI Architect..."
                value={tempNutritionText}
                onChange={(e) => setTempNutritionText(e.target.value)}
              />
              
              <button 
                onClick={handleSaveNutrition}
                className="w-full bg-[#d4ff00] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition shadow-lg"
              >
                Assign Strategy to Athlete
              </button>
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <form onSubmit={handleTestSubmit} className="space-y-8 max-w-3xl">
            <h3 className="text-4xl font-bebas italic tracking-tight text-[#d4ff00] uppercase">ADD SUCCESS STORY</h3>
            <input required className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white" placeholder="Client Name" value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} />
            <textarea required rows={6} className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white" placeholder="Testimonial content..." value={testForm.content} onChange={e => setTestForm({...testForm, content: e.target.value})} />
            <button type="submit" className="w-full bg-[#d4ff00] text-black font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm">Publish</button>
          </form>
        )}

        {/* ... remaining tabs (events, settings) ... */}
      </div>
    </div>
  );
};

export default TrainerDashboard;
