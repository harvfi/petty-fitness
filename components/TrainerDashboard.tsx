
import React, { useState, useEffect, useMemo } from 'react';
import { User, Testimonial, GymEvent, Workout, UserRole, Goal } from '../types';
import { saveTestimonial, saveEvent, getAllWorkouts, updateWorkout, getUsers, updateUser, getAllGoals, saveGoal, deleteGoal, getGoalsByTrainer } from '../services/dataService';
import { enhanceTestimonial, generateNutritionPlan } from '../services/geminiService';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';

interface TrainerDashboardProps {
  user: User;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'events' | 'clients' | 'nutrition' | 'goals' | 'settings'>('clients');
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

  // Goals state
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    assignedTo: '',
    category: 'Other' as Goal['category'],
    milestones: [''] as string[]
  });

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
    setAllGoals(getAllGoals());
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

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: Goal = {
      id: Date.now().toString(),
      title: goalForm.title,
      description: goalForm.description,
      targetDate: goalForm.targetDate || undefined,
      assignedTo: goalForm.assignedTo || undefined,
      createdBy: user.id,
      createdDate: new Date().toISOString(),
      status: 'active',
      category: goalForm.category,
      milestones: goalForm.milestones.filter(m => m.trim() !== '')
    };
    saveGoal(goal);
    setAllGoals(getAllGoals());
    setGoalForm({ title: '', description: '', targetDate: '', assignedTo: '', category: 'Other', milestones: [''] });
    alert('Goal created successfully!');
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
      setAllGoals(getAllGoals());
    }
  };

  const handleAddMilestone = () => {
    setGoalForm({ ...goalForm, milestones: [...goalForm.milestones, ''] });
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const newMilestones = [...goalForm.milestones];
    newMilestones[index] = value;
    setGoalForm({ ...goalForm, milestones: newMilestones });
  };

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = goalForm.milestones.filter((_, i) => i !== index);
    setGoalForm({ ...goalForm, milestones: newMilestones.length > 0 ? newMilestones : [''] });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="font-bebas text-6xl italic uppercase">TRAINER HUB.</h1>
        <p className="text-zinc-400 font-medium tracking-tight">Coach Dashboard — Elite Performance Management.</p>
      </div>

      <div className="flex space-x-1 border-b border-zinc-800 mb-8 overflow-x-auto scrollbar-hide">
        {(['clients', 'nutrition', 'goals', 'testimonials', 'events', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#d4ff00] border-b-2 border-[#d4ff00]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab === 'clients' ? 'Client Roster' : tab === 'nutrition' ? 'Nutrition Hub' : tab === 'goals' ? 'Goals Manager' : tab === 'testimonials' ? 'Testimonials' : tab === 'events' ? 'Manage Events' : 'Settings'}
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
            <input required className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white" placeholder="Client Name" value={testForm.name} onChange={e => setTestForm({ ...testForm, name: e.target.value })} />
            <textarea required rows={6} className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white" placeholder="Testimonial content..." value={testForm.content} onChange={e => setTestForm({ ...testForm, content: e.target.value })} />
            <button type="submit" className="w-full bg-[#d4ff00] text-black font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm">Publish</button>
          </form>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-4xl font-bebas italic tracking-tight text-[#d4ff00] uppercase">GOALS MANAGER</h3>

            {/* Create Goal Form */}
            <form onSubmit={handleGoalSubmit} className="bg-black/60 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <h4 className="text-2xl font-bebas italic text-white">Create New Goal</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Goal Title *</label>
                  <input
                    required
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4ff00] transition"
                    placeholder="e.g., Lose 20 pounds"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as Goal['category'] })}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4ff00] transition"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4ff00] transition resize-none"
                  placeholder="Describe the goal in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4ff00] transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Assign to Client (Optional)</label>
                  <select
                    value={goalForm.assignedTo}
                    onChange={(e) => setGoalForm({ ...goalForm, assignedTo: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4ff00] transition"
                  >
                    <option value="">Unassigned</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Milestones (Optional)</label>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="text-[#d4ff00] text-xs font-bold hover:brightness-110 transition"
                  >
                    + Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {goalForm.milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={milestone}
                        onChange={(e) => handleMilestoneChange(index, e.target.value)}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#d4ff00] transition"
                        placeholder={`Milestone ${index + 1}`}
                      />
                      {goalForm.milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(index)}
                          className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#d4ff00] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition shadow-lg"
              >
                Create Goal
              </button>
            </form>

            {/* Goals List */}
            <div className="space-y-4">
              <h4 className="text-2xl font-bebas italic text-white">All Goals ({allGoals.length})</h4>
              {allGoals.length === 0 ? (
                <div className="bg-black/60 border border-zinc-800 rounded-3xl p-12 text-center">
                  <p className="text-zinc-500 text-sm">No goals created yet. Create your first goal above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allGoals.map((goal) => {
                    const assignedClient = allUsers.find(u => u.id === goal.assignedTo);
                    return (
                      <div key={goal.id} className="bg-black/60 border border-zinc-800 rounded-3xl p-6 hover:border-[#d4ff00]/30 transition">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="text-xl font-bold text-white">{goal.title}</h5>
                              {goal.category && (
                                <span className="px-3 py-1 bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] text-[10px] font-black uppercase rounded-lg">
                                  {goal.category}
                                </span>
                              )}
                              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${goal.status === 'active' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                  goal.status === 'completed' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                    'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400'
                                }`}>
                                {goal.status}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-3">{goal.description}</p>
                            {assignedClient && (
                              <p className="text-[#d4ff00] text-xs font-bold">Assigned to: {assignedClient.name}</p>
                            )}
                            {goal.targetDate && (
                              <p className="text-zinc-500 text-xs mt-1">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                            )}
                            {goal.milestones && goal.milestones.length > 0 && (
                              <div className="mt-3">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Milestones:</p>
                                <ul className="space-y-1">
                                  {goal.milestones.map((milestone, idx) => (
                                    <li key={idx} className="text-zinc-400 text-xs flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-[#d4ff00] rounded-full"></span>
                                      {milestone}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition text-xs font-bold uppercase"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... remaining tabs (events, settings) ... */}
      </div>
    </div>
  );
};

export default TrainerDashboard;
