
import { Testimonial, GymEvent, Workout, User, UserRole, FoodEntry, StepEntry, Goal } from '../types';

const KEYS = {
  TESTIMONIALS: 'petty_testimonials',
  EVENTS: 'petty_events',
  WORKOUTS: 'petty_workouts',
  FOOD: 'petty_food_entries',
  STEPS: 'petty_step_history',
  USER: 'petty_current_user',
  ALL_USERS: 'petty_all_users',
  GOALS: 'petty_goals'
};

// Calculate dynamic dates for defaults
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];
const tomorrowISO = tomorrow.toISOString();

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);
const dayAfterStr = dayAfterTomorrow.toISOString().split('T')[0];

// Generate Fun Run events for every Saturday for the next 8 weeks
const generateSaturdayFunRuns = (): GymEvent[] => {
  const saturdays: GymEvent[] = [];
  const currentDate = new Date(today);

  // Find the next Saturday (Saturday is day 6 in JavaScript)
  const currentDay = currentDate.getDay();
  let daysUntilSaturday;

  if (currentDay === 6) {
    // If today is Saturday, start from today
    daysUntilSaturday = 0;
  } else if (currentDay < 6) {
    // If before Saturday this week
    daysUntilSaturday = 6 - currentDay;
  } else {
    // If Sunday (day 0), next Saturday is 6 days away
    daysUntilSaturday = 6;
  }

  currentDate.setDate(currentDate.getDate() + daysUntilSaturday);

  // Generate 8 Saturday events
  for (let i = 0; i < 8; i++) {
    // Format date as YYYY-MM-DD in local timezone to avoid UTC conversion issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    saturdays.push({
      id: `fun-run-saturday-${i + 1}`,
      title: 'Fun Run',
      description: 'Weekly community fun run at YMCA Kings Mountain, NC. All fitness levels welcome!',
      date: dateStr,
      time: '01:00 PM',
      category: 'Special'
    });
    // Move to next Saturday (7 days later)
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return saturdays;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    content: 'PETTYFITNESS 22 changed my life. I lost 20lbs in 3 months and feel stronger than ever! Hard work really is easy work.',
    imageUrl: 'https://picsum.photos/seed/sarah/400/300',
    date: tomorrowISO
  },
  {
    id: '2',
    name: 'Mike Chen',
    content: 'The personal training sessions are elite. I finally broke my deadlift plateau. The harder you work, the easier it becomes!',
    imageUrl: 'https://picsum.photos/seed/mike/400/300',
    date: tomorrowISO
  }
];

const DEFAULT_EVENTS: GymEvent[] = [
  ...generateSaturdayFunRuns(), // Add all Saturday Fun Runs
  {
    id: 'special-5k-shelby',
    title: 'YMCA 5K Run',
    description: 'PettyFitness 22 takes over Shelby! Meet at the YMCA for the 5k event. Shelby, North Carolina 28150.',
    date: '2025-02-07',
    time: '08:00 AM',
    category: 'Special'
  },
  {
    id: '1',
    title: 'Strength & Conditioning',
    description: 'Focus on compound movements and functional strength.',
    date: tomorrowStr,
    time: '08:00 AM',
    category: 'Class'
  },
  {
    id: '2',
    title: 'Fat Loss Masterclass',
    description: 'Advanced techniques for weight control and metabolic health.',
    date: dayAfterStr,
    time: '06:30 PM',
    category: 'Workshop'
  }
];

export const getTestimonials = (): Testimonial[] => {
  const data = localStorage.getItem(KEYS.TESTIMONIALS);
  return data ? JSON.parse(data) : DEFAULT_TESTIMONIALS;
};

export const saveTestimonial = (t: Testimonial) => {
  const current = getTestimonials();
  localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify([t, ...current]));
};

export const getEvents = (): GymEvent[] => {
  const data = localStorage.getItem(KEYS.EVENTS);
  let allEvents: GymEvent[] = data ? JSON.parse(data) : DEFAULT_EVENTS;

  // CACHE FIX: Detect and clear old Sunday Fun Run dates
  // Check if any Fun Run events are on Sunday (day 0) instead of Saturday (day 6)
  const hasSundayFunRuns = allEvents.some(event => {
    if (event.title === 'Fun Run' && event.date) {
      const eventDate = new Date(event.date + 'T12:00:00'); // Use noon to avoid timezone issues
      return eventDate.getDay() === 0; // Sunday = 0
    }
    return false;
  });

  // If we found Sunday Fun Runs, clear cache and use fresh defaults
  if (hasSundayFunRuns) {
    console.log('Detected old Sunday Fun Run dates in cache - clearing and reloading...');
    localStorage.removeItem(KEYS.EVENTS);
    allEvents = DEFAULT_EVENTS;
  }

  // Filter out past events
  const currentEvents = allEvents.filter(event => event.date >= todayStr);

  // If we removed some events, sync back to local storage
  if (currentEvents.length !== allEvents.length) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(currentEvents));
  }

  return currentEvents;
};

export const saveEvent = (e: GymEvent) => {
  const current = getEvents();
  localStorage.setItem(KEYS.EVENTS, JSON.stringify([e, ...current]));
};

export const getAllWorkouts = (): Workout[] => {
  const data = localStorage.getItem(KEYS.WORKOUTS);
  return data ? JSON.parse(data) : [];
};

export const getWorkouts = (userId: string): Workout[] => {
  const all = getAllWorkouts();
  return all.filter(w => w.userId === userId);
};

export const saveWorkout = (w: Workout) => {
  const all = getAllWorkouts();
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify([w, ...all]));
};

export const updateWorkout = (updatedWorkout: Workout) => {
  const all = getAllWorkouts();
  const index = all.findIndex(w => w.id === updatedWorkout.id);
  if (index !== -1) {
    all[index] = updatedWorkout;
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(all));
  }
};

export const getFoodEntries = (userId: string): FoodEntry[] => {
  const data = localStorage.getItem(KEYS.FOOD);
  const all: FoodEntry[] = data ? JSON.parse(data) : [];
  return all.filter(f => f.userId === userId);
};

export const saveFoodEntry = (f: FoodEntry) => {
  const data = localStorage.getItem(KEYS.FOOD);
  const all: FoodEntry[] = data ? JSON.parse(data) : [];
  localStorage.setItem(KEYS.FOOD, JSON.stringify([f, ...all]));
};

export const getSteps = (userId: string): StepEntry[] => {
  const data = localStorage.getItem(KEYS.STEPS);
  const all: StepEntry[] = data ? JSON.parse(data) : [];
  return all.filter(s => s.userId === userId);
};

export const saveSteps = (userId: string, count: number, date: string) => {
  const data = localStorage.getItem(KEYS.STEPS);
  const all: StepEntry[] = data ? JSON.parse(data) : [];
  const existing = all.findIndex(s => s.userId === userId && s.date === date);

  if (existing !== -1) {
    all[existing].count = count;
  } else {
    all.push({ id: Math.random().toString(36).substr(2, 9), userId, count, date });
  }

  localStorage.setItem(KEYS.STEPS, JSON.stringify(all));
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(KEYS.ALL_USERS);
  if (!data) {
    const defaultUsers: User[] = [
      { id: 'trainer-1', name: 'PettyFitness Coach', role: UserRole.TRAINER },
      { id: 'client-123', name: 'New Athlete', role: UserRole.CLIENT, goal: 'Weight Loss', stepGoal: 10000 }
    ];
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(data);
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));

    // Also update current session if it's the same user
    const current = getCurrentUser();
    if (current && current.id === updatedUser.id) {
      localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
    }
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const login = (role: UserRole): User => {
  const users = getUsers();
  const id = role === UserRole.TRAINER ? 'trainer-1' : 'client-123';
  const user = users.find(u => u.id === id) || {
    id: id,
    name: role === UserRole.TRAINER ? 'PettyFitness Coach' : 'New Athlete',
    role: role,
    goal: role === UserRole.CLIENT ? 'Weight Loss' : undefined,
    stepGoal: 10000
  };
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(KEYS.USER);
};

export const selectPlan = (userId: string, planTitle: string): void => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.selectedPlan = planTitle;
    user.planSelectedDate = new Date().toISOString();
    updateUser(user);
  }
};

export const getTrainer = (): User | null => {
  const users = getUsers();
  return users.find(u => u.role === UserRole.TRAINER) || null;
};

// Goal Management Functions
export const getAllGoals = (): Goal[] => {
  const data = localStorage.getItem(KEYS.GOALS);
  return data ? JSON.parse(data) : [];
};

export const getGoalsByClient = (userId: string): Goal[] => {
  const all = getAllGoals();
  return all.filter(g => g.assignedTo === userId);
};

export const getGoalsByTrainer = (trainerId: string): Goal[] => {
  const all = getAllGoals();
  return all.filter(g => g.createdBy === trainerId);
};

export const saveGoal = (goal: Goal) => {
  const all = getAllGoals();
  const existing = all.findIndex(g => g.id === goal.id);

  if (existing !== -1) {
    all[existing] = goal;
  } else {
    all.push(goal);
  }

  localStorage.setItem(KEYS.GOALS, JSON.stringify(all));
};

export const deleteGoal = (goalId: string) => {
  const all = getAllGoals();
  const filtered = all.filter(g => g.id !== goalId);
  localStorage.setItem(KEYS.GOALS, JSON.stringify(filtered));
};

export const updateGoalStatus = (goalId: string, status: Goal['status']) => {
  const all = getAllGoals();
  const goal = all.find(g => g.id === goalId);
  if (goal) {
    goal.status = status;
    localStorage.setItem(KEYS.GOALS, JSON.stringify(all));
  }
};
