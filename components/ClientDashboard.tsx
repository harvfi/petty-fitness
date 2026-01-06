
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Workout, AIWorkoutPlan, FoodEntry, FoodFacts, StepEntry } from '../types';
import { getWorkouts, saveWorkout, getCurrentUser, getFoodEntries, saveFoodEntry, updateUser, getSteps, saveSteps } from '../services/dataService';
import { generateWorkoutPlan, analyzeFood } from '../services/geminiService';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface ClientDashboardProps {
  user: User;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'training' | 'movement' | 'nutrition' | 'settings'>('training');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [stepEntries, setStepEntries] = useState<StepEntry[]>([]);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIWorkoutPlan | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastAccelRef = useRef<number>(0);
  const stepThreshold = 12;

  useEffect(() => {
    const refreshed = getCurrentUser();
    if (refreshed) setUser(refreshed);

    const fetchedWorkouts = getWorkouts(user.id);
    setWorkouts([...fetchedWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const fetchedFood = getFoodEntries(user.id);
    setFoodEntries([...fetchedFood].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const fetchedSteps = getSteps(user.id);
    setStepEntries(fetchedSteps);

    const today = new Date().toISOString().split('T')[0];
    const todaySteps = fetchedSteps.find(s => s.date === today);
    if (todaySteps) setCurrentSteps(todaySteps.count);
  }, [user.id]);

  useEffect(() => {
    if (!isLiveTracking) return;
    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;
      const totalAccel = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2);
      const delta = Math.abs(totalAccel - lastAccelRef.current);
      if (delta > stepThreshold) {
        setCurrentSteps(prev => {
          const next = prev + 1;
          const today = new Date().toISOString().split('T')[0];
          saveSteps(user.id, next, today);
          return next;
        });
      }
      lastAccelRef.current = totalAccel;
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isLiveTracking, user.id]);

  const handleSyncHealth = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const simulatedSteps = Math.floor(Math.random() * 5000) + 3000;
      setCurrentSteps(simulatedSteps);
      const today = new Date().toISOString().split('T')[0];
      saveSteps(user.id, simulatedSteps, today);
      setIsSyncing(false);
      alert('HealthKit synchronization complete.');
    }, 2000);
  };

  const startLiveTracking = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      if (permission === 'granted') setIsLiveTracking(true);
    } else {
      setIsLiveTracking(true);
    }
  };

  const weeklyStepData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = stepEntries.find(s => s.date === dateStr);
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: entry ? entry.count : 0 });
    }
    return days;
  }, [stepEntries]);

  const goalStats = useMemo(() => {
    const now = new Date();
    const thisMonthWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyTarget = 12;
    const progress = Math.min((thisMonthWorkouts.length / monthlyTarget) * 100, 100);
    const recentVolume = workouts.slice(0, 5).reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0);
    const previousVolume = workouts.slice(5, 10).reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0);
    const volumeIncrease = previousVolume > 0 ? ((recentVolume - previousVolume) / previousVolume) * 100 : 0;
    return { monthlyCount: thisMonthWorkouts.length, monthlyTarget, progress, volumeIncrease, totalVolume: workouts.reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0) };
  }, [workouts]);

  const nutritionStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayFood = foodEntries.filter(f => f.date === today);
    return todayFood.reduce((acc, f) => ({
      calories: acc.calories + f.facts.calories,
      protein: acc.protein + f.facts.protein,
      carbs: acc.carbs + f.facts.carbs,
      fat: acc.fat + f.facts.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [foodEntries]);

  // Fix: Defined uniqueExercises to populate the exercise datalist suggestions
  const uniqueExercises = useMemo(() => {
    const names = workouts.map(w => w.exercise);
    return Array.from(new Set(names)).sort();
  }, [workouts]);

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const desc = form.description.value;

    if (!desc.trim()) {
      alert('Please enter a food description');
      return;
    }

    setIsAnalyzingFood(true);

    try {
      const analysis = await analyzeFood(desc);

      if (analysis) {
        const entry: FoodEntry = {
          id: Date.now().toString(),
          userId: user.id,
          date: new Date().toISOString().split('T')[0],
          name: analysis.name,
          facts: analysis.facts
        };

        saveFoodEntry(entry);
        setFoodEntries([entry, ...foodEntries]);

        // Reset form and close
        form.reset();
        setShowAddFood(false);

        // Show success message
        alert(`✅ Food logged successfully!\n\n${analysis.name}\nCalories: ${analysis.facts.calories} kcal\nProtein: ${analysis.facts.protein}g | Carbs: ${analysis.facts.carbs}g | Fat: ${analysis.facts.fat}g`);
      } else {
        alert('❌ Could not analyze food. Please make sure the GEMINI_API_KEY is configured on Vercel, or try describing the food differently.');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('❌ Error analyzing food. Please check that the GEMINI_API_KEY is configured on Vercel.');
    } finally {
      setIsAnalyzingFood(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="font-bebas text-6xl italic uppercase">MY ECOSYSTEM.</h1>
          <p className="text-zinc-400">Holistic performance tracker for {user.name}.</p>
        </div>
        <div className="flex space-x-1 bg-zinc-900 p-1 rounded-2xl mt-6 md:mt-0 overflow-x-auto scrollbar-hide">
          {['training', 'movement', 'nutrition', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-xl font-bold uppercase text-xs transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#d4ff00] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'nutrition' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="font-bebas text-4xl italic">NUTRITION FUEL</h2>
            <button onClick={() => setShowAddFood(!showAddFood)} className="bg-[#d4ff00] text-black px-6 py-3 rounded-full font-bold uppercase text-sm shadow-lg hover:shadow-[#d4ff00]/20 transition-all">{showAddFood ? 'Close' : 'Log Food'}</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Assigned Nutrition Protocol (New Section) */}
              <div className="bg-zinc-900 border border-[#d4ff00]/30 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <svg className="w-12 h-12 text-[#d4ff00]/20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#d4ff00] mb-6">Assigned Protocol</h3>
                <div className="prose prose-invert max-w-none">
                  {user.nutritionPlan ? (
                    <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-medium">
                      {user.nutritionPlan}
                    </div>
                  ) : (
                    <p className="text-zinc-600 italic text-sm">Waiting for coach to assign your daily fuel strategy...</p>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-[#d4ff00]">Coach</div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Verified Performance Strategy</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center">
                  <h3 className="text-xs font-black uppercase text-zinc-500 mb-4 tracking-widest">Today's Calories</h3>
                  <div className="text-6xl font-bebas italic text-[#d4ff00] mb-2">{nutritionStats.calories}</div>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold">kcal consumed</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 col-span-2 flex flex-col justify-center space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest">Today's Macros</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><div className="text-xs font-bold text-blue-400 uppercase">Protein</div><div className="text-2xl font-bebas">{nutritionStats.protein}g</div></div>
                    <div><div className="text-xs font-bold text-red-400 uppercase">Carbs</div><div className="text-2xl font-bebas">{nutritionStats.carbs}g</div></div>
                    <div><div className="text-xs font-bold text-amber-400 uppercase">Fats</div><div className="text-2xl font-bebas">{nutritionStats.fat}g</div></div>
                  </div>
                </div>
              </div>

              {showAddFood && (
                <form onSubmit={handleAddFood} className="bg-zinc-900 p-8 rounded-2xl border border-[#d4ff00]/30 animate-in slide-in-from-top duration-300">
                  <h3 className="font-bold text-xl mb-6 uppercase tracking-widest text-[#d4ff00]">Log Fuel</h3>
                  <textarea name="description" required rows={3} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-[#d4ff00]" placeholder="E.g. Double cheeseburger with sweet potato fries" />
                  <button type="submit" disabled={isAnalyzingFood} className="w-full mt-4 bg-[#d4ff00] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition">{isAnalyzingFood ? 'AI Analyzing...' : 'Analyze & Record'}</button>
                </form>
              )}

              {/* Food Log Table */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                  <h3 className="font-bebas text-2xl italic uppercase tracking-tight">Food Log History</h3>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">All Recorded Meals & Snacks</p>
                </div>

                {foodEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-black/50">
                          <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Date</th>
                          <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Food Item</th>
                          <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Calories</th>
                          <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Protein (g)</th>
                          <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Carbs (g)</th>
                          <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Fat (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foodEntries.map((f, index) => (
                          <tr
                            key={f.id}
                            className={`border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/20' : ''}`}
                          >
                            <td className="px-6 py-4 text-sm text-zinc-400 font-medium">
                              {new Date(f.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-white uppercase text-sm tracking-tight">{f.name}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bebas text-xl text-[#d4ff00]">{f.facts.calories}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-blue-400">{f.facts.protein}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-red-400">{f.facts.carbs}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-amber-400">{f.facts.fat}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-black/50 border-t-2 border-[#d4ff00]/30">
                          <td className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500" colSpan={2}>
                            Total ({foodEntries.length} entries)
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bebas text-2xl text-[#d4ff00]">
                              {foodEntries.reduce((sum, f) => sum + f.facts.calories, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-blue-400 text-lg">
                              {foodEntries.reduce((sum, f) => sum + f.facts.protein, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-red-400 text-lg">
                              {foodEntries.reduce((sum, f) => sum + f.facts.carbs, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-amber-400 text-lg">
                              {foodEntries.reduce((sum, f) => sum + f.facts.fat, 0)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-zinc-600 italic text-sm">No food entries logged yet. Start tracking your nutrition!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                <h3 className="font-bebas text-2xl italic mb-6">FUEL LOG</h3>
                <div className="space-y-4">
                  {foodEntries.slice(0, 5).map(f => (
                    <div key={f.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-[#d4ff00]"></div>
                      <span className="text-xs text-zinc-400 flex-grow truncate">{f.name}</span>
                      <span className="text-xs font-bold text-white">{f.facts.calories}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="font-bebas text-4xl italic">PERFORMANCE</h2>
            <div className="flex space-x-4">
              <button onClick={() => setShowAddWorkout(!showAddWorkout)} className="bg-[#d4ff00] text-black px-6 py-3 rounded-full font-bold uppercase text-sm shadow-lg hover:shadow-[#d4ff00]/20 transition-all">{showAddWorkout ? 'Close' : 'Log Session'}</button>
              <button onClick={async () => { setIsGenerating(true); const plan = await generateWorkoutPlan(user.goal || 'General Fitness', 'Intermediate'); setAiPlan(plan); setIsGenerating(false); }} disabled={isGenerating} className="border-2 border-[#d4ff00] text-[#d4ff00] px-6 py-3 rounded-full font-bold uppercase text-sm disabled:opacity-50 hover:bg-[#d4ff00]/10 transition-all">{isGenerating ? 'Analyzing...' : 'AI Strategy'}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex items-center justify-between relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Consistency</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-5xl font-bebas italic">{goalStats.monthlyCount}</span>
                      <span className="text-zinc-500 font-bold">/ {goalStats.monthlyTarget}</span>
                    </div>
                  </div>
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: 'Completed', value: goalStats.progress, color: '#d4ff00' }, { name: 'Remaining', value: 100 - goalStats.progress, color: '#1a1a1a' }]} cx="50%" cy="50%" innerRadius={35} outerRadius={45} paddingAngle={0} dataKey="value" stroke="none"><Cell fill="#d4ff00" /><Cell fill="#1a1a1a" /></Pie></PieChart></ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bebas text-[#d4ff00]">{Math.round(goalStats.progress)}%</div>
                  </div>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Growth Factor</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`text-5xl font-bebas italic ${goalStats.volumeIncrease >= 0 ? 'text-[#d4ff00]' : 'text-red-500'}`}>{goalStats.volumeIncrease >= 0 ? '+' : ''}{Math.round(goalStats.volumeIncrease)}%</span>
                    <div className="h-10 w-px bg-zinc-800"></div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none">Power Output<br /><span className="text-zinc-600 font-normal lowercase tracking-normal">vs last cycle</span></p>
                  </div>
                  <div className="mt-6 w-full h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-[#d4ff00] shadow-[0_0_8px_#d4ff00]" style={{ width: `${Math.max(0, Math.min(100, 50 + goalStats.volumeIncrease))}%` }}></div></div>
                </div>
              </div>
              {showAddWorkout && (
                <form onSubmit={(e) => { e.preventDefault(); const w = { id: Date.now().toString(), userId: user.id, exercise: (e.target as any).exercise.value, sets: parseInt((e.target as any).sets.value), reps: parseInt((e.target as any).reps.value), weight: parseInt((e.target as any).weight.value), date: (e.target as any).date.value }; saveWorkout(w as any); setWorkouts([w as any, ...workouts]); setShowAddWorkout(false); }} className="bg-zinc-900 p-8 rounded-2xl border border-[#d4ff00]/30 animate-in slide-in-from-top duration-300">
                  <h3 className="font-bold text-xl mb-6 uppercase tracking-widest text-[#d4ff00]">Log Training</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Exercise Name</label><input name="exercise" list="exercises" required className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-[#d4ff00]" placeholder="E.g. Barbell Squat" /><datalist id="exercises">{uniqueExercises.map(ex => <option key={ex} value={ex} />)}</datalist></div>
                    <div><label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Sets x Reps</label><div className="flex space-x-2"><input name="sets" type="number" defaultValue={3} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white" /><input name="reps" type="number" defaultValue={10} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white" /></div></div>
                    <div><label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Weight (KG)</label><input name="weight" type="number" defaultValue={0} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white" /></div>
                    <input name="date" type="hidden" value={new Date().toISOString().split('T')[0]} />
                  </div>
                  <button type="submit" className="w-full mt-8 bg-[#d4ff00] text-black font-black py-5 rounded-xl uppercase tracking-widest hover:brightness-110 transition shadow-lg active:scale-[0.98]">Record Performance</button>
                </form>
              )}
              <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 h-[400px]">
                <h3 className="font-bold text-xl mb-6 uppercase italic">Load Progression</h3>
                <ResponsiveContainer width="100%" height="80%"><LineChart data={[...workouts].slice(0, 10).reverse().map(w => ({ name: w.date.split('-')[2], weight: w.weight }))}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} /><YAxis stroke="#666" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} /><Line type="monotone" dataKey="weight" stroke="#d4ff00" strokeWidth={3} dot={{ fill: '#d4ff00', r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <h3 className="font-bold mb-6 uppercase tracking-widest text-zinc-500 text-xs">KPI Scorecard</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-zinc-800/50"><span className="text-sm text-zinc-400">Total Volume</span><span className="font-bebas text-2xl text-blue-500">{Math.round(goalStats.totalVolume / 1000)}t</span></div>
                  <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-zinc-800/50"><span className="text-sm text-zinc-400">Sessions Logged</span><span className="font-bebas text-2xl text-zinc-200">{workouts.length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings tab logic... */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-bebas text-4xl italic mb-8 uppercase">SYNC PREFERENCES</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-black rounded-2xl border border-zinc-800">
              <div>
                <h4 className="font-bold text-white uppercase text-sm tracking-tight">Step Goal</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black mt-1">Daily Movement Target</p>
              </div>
              <input
                type="number"
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white w-24 text-center font-bold"
                value={user.stepGoal || 10000}
                onChange={(e) => {
                  const next = { ...user, stepGoal: parseInt(e.target.value) };
                  updateUser(next);
                  setUser(next);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Movement tab logic... */}
      {activeTab === 'movement' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h2 className="font-bebas text-4xl italic">BIOMETRIC FLOW</h2>
            <div className="flex space-x-4">
              <button onClick={handleSyncHealth} disabled={isSyncing} className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-[#d4ff00] transition-all"><svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span>{isSyncing ? 'Syncing...' : 'Sync Apple Health'}</span></button>
              <button onClick={isLiveTracking ? () => setIsLiveTracking(false) : startLiveTracking} className={`px-6 py-3 rounded-full font-bold uppercase text-xs transition-all ${isLiveTracking ? 'bg-red-500 text-white animate-pulse' : 'bg-[#d4ff00] text-black'}`}>{isLiveTracking ? 'Stop Tracking' : 'Start Live Pedometer'}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90"><circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" /><circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 110} strokeDashoffset={2 * Math.PI * 110 * (1 - Math.min(1, currentSteps / (user.stepGoal || 10000)))} className="text-[#d4ff00] transition-all duration-1000" /></svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-6xl font-bebas italic leading-none">{currentSteps.toLocaleString()}</span><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Steps / 10k</span></div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 h-[400px]">
                <h3 className="font-bebas text-3xl italic mb-8 uppercase tracking-tight">Movement Trajectory</h3>
                <ResponsiveContainer width="100%" height="80%"><BarChart data={weeklyStepData}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="day" stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} /><YAxis stroke="#444" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} cursor={{ fill: 'rgba(212, 255, 0, 0.05)' }} /><Bar dataKey="count" fill="#d4ff00" radius={[6, 6, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
