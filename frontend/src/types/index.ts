export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture: string;
  profilePhoto?: string;
  progressPhotos?: string[];
  createdAt: string;
  skinReport?: any;
  onboardingCompleted?: boolean;

  // Profile
  age?: number;
  gender?: string;
  skinType?: string;
  skinConcerns?: string[];
  skinScore?: number;
  skinTone?: string;

  // Streak
  currentStreak?: number;
  longestStreak?: number;
  lastCompletedDate?: string;
  completedDays?: string[];

  // Water Tracker
  waterGoal?: number;
  currentWaterIntake?: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Product {
  _id: string;
  user: string;
  name: string;
  brand: string;
  category: string;
  skinType: string;
  ingredients: string[];
  quantity: number;
  purchaseDate: string;
  openingDate: string;
  expiryDate: string;
  image: string;
  notes: string;
  price?: number;
  routineUsage?: 'morning' | 'night' | 'both' | 'none';
  status: 'active' | 'expired' | 'expiring' | 'low';
  createdAt: string;
}

export interface RoutineStep {
  _id?: string;
  order: number;
  stepType: string;
  product?: string;
  productName?: string;
  completed: boolean;
}

export interface Routine {
  _id: string;
  user: string;
  type: 'morning' | 'night';
  steps: RoutineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineHistory {
  _id: string;
  user: string;
  routine: string;
  routineType: 'morning' | 'night';
  date: string;
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
}

export interface JournalEntry {
  _id: string;
  user: string;
  date: string;
  skinConcern: string[];
  waterIntake: number;
  sleepHours: number;
  stressLevel: number;
  mood: 'Great' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
  notes: string;
  progressPhoto: string;
  skinCondition?: string;
  acne?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  dryness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  oiliness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  redness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  reaction?: string;
  rating?: number;
  images?: string[];
  createdAt: string;
}

export interface Photo {
  _id: string;
  user: string;
  image: string;
  date: string;
  category: 'before' | 'after' | 'progress';
  notes: string;
  createdAt: string;
}

export interface WishlistItem {
  _id: string;
  user: string;
  productName: string;
  brand: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  price?: number;
  reminderDate?: string;
  createdAt: string;
}

export interface Achievement {
  _id: string;
  user: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
  isUnlocked: boolean;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Ingredient {
  _id: string;
  name: string;
  description: string;
  category: string;
}

export interface CompatibilityRule {
  _id: string;
  ingredientA: string;
  ingredientB: string;
  status: 'safe' | 'warning' | 'avoid';
  warningMessage: string;
}

export interface CompatibilityWarning {
  ingredientA: string;
  ingredientB: string;
  status: 'safe' | 'warning' | 'avoid';
  warningMessage: string;
}

export interface CalendarEvent {
  date: string;
  type: 'routine' | 'journal' | 'photo' | 'expiry';
  subType?: string;
  title: string;
  detail: string;
  completion?: number;
  id?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface DashboardStats {
  totalProducts: number;
  expiredProducts: number;
  expiringProducts: number;
  lowProducts: number;
  currentStreak: number;
  longestStreak: number;
  recentJournal: JournalEntry | null;
  routineCompletion: number;
}

export interface WeeklyActivity {
  date: string;
  day: string;
  routineCompletion: number;
  journalEntry: boolean;
}

export interface RoutineCompletionData {
  date: string;
  morning: number;
  night: number;
  average: number;
}

export interface JournalStats {
  entriesPerMonth: { month: string; count: number }[];
  concerns: { name: string; count: number }[];
  avgWaterIntake: number;
  avgSleepHours: number;
  moodDistribution: { mood: string; count: number }[];
}

export interface ProductStats {
  byCategory: { _id: string; count: number }[];
  bySkinType: { _id: string; count: number }[];
  byStatus: { _id: string; count: number }[];
}

export interface PlatformStats {
  totalUsers: number;
  totalProducts: number;
  totalJournals: number;
  totalRoutineCompletions: number;
  activeUsersCount: number;
  usersPerMonth: { month: string; count: number }[];
}
