
export enum UserRole {
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER'
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  date: string;
}

export interface GymEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'Class' | 'Workshop' | 'Special';
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  exercise: string;
  category?: 'Strength' | 'Cardio' | 'Flexibility';
  sets: number;
  reps: number;
  weight: number;
  feedback?: string;
}

export interface StepEntry {
  id: string;
  userId: string;
  date: string;
  count: number;
}

export interface FoodFacts {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  name: string;
  image?: string;
  facts: FoodFacts;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  goal?: string;
  stepGoal?: number;
  email?: string;
  phone?: string;
  prefEmail?: boolean;
  prefPhone?: boolean;
  nutritionPlan?: string; // New field for trainer-assigned nutrition strategy
  selectedPlan?: string; // Selected pricing plan: "Single Session", "Standard Flow", or "Elite Routine"
  planSelectedDate?: string; // ISO date string when plan was selected
}

export interface AIWorkoutPlan {
  title: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    description: string;
  }[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  assignedTo?: string; // userId of the client
  createdBy: string; // userId of the trainer
  createdDate: string;
  status: 'active' | 'completed' | 'archived';
  category?: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Flexibility' | 'Other';
  milestones?: string[]; // Optional sub-goals or checkpoints
}
