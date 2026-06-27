import api from './axios';
import type { ApiResponse, Product, Routine, JournalEntry, Photo, WishlistItem, Achievement, Category, Ingredient, CompatibilityRule, CompatibilityWarning, CalendarEvent, DashboardStats, WeeklyActivity, RoutineCompletionData, JournalStats, ProductStats, PlatformStats, User } from '../types';

// Auth Services
export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; email?: string; skinReport?: any; onboardingCompleted?: boolean }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  uploadProfilePicture: (formData: FormData) =>
    api.put('/auth/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  logout: () => api.post('/auth/logout'),
};

// Product Services
export const productService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Product[]>>('/products', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),
  create: (formData: FormData) =>
    api.post<ApiResponse<Product>>('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) =>
    api.delete(`/products/${id}`),
  getStats: () =>
    api.get('/products/stats'),
};

// Routine Services
export const routineService = {
  getAll: () => api.get<ApiResponse<Routine[]>>('/routines'),
  getOne: (id: string) => api.get<ApiResponse<Routine>>(`/routines/${id}`),
  create: (data: { type: string; steps: any[] }) =>
    api.post<ApiResponse<Routine>>('/routines', data),
  update: (id: string, data: { steps: any[] }) =>
    api.put<ApiResponse<Routine>>(`/routines/${id}`, data),
  delete: (id: string) => api.delete(`/routines/${id}`),
  toggleStep: (routineId: string, stepId: string) =>
    api.put<ApiResponse<Routine>>(`/routines/${routineId}/steps/${stepId}/toggle`),
  checkCompatibility: (productIds: string[]) =>
    api.post<ApiResponse<CompatibilityWarning[]>>('/routines/check-compatibility', { productIds }),
  getHistory: (days?: number) =>
    api.get('/routines/history', { params: { days } }),
  reset: (id: string) =>
    api.put<ApiResponse<Routine>>(`/routines/${id}/reset`),
};

// Journal Services
export const journalService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<JournalEntry[]>>('/journal', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<JournalEntry>>(`/journal/${id}`),
  create: (formData: FormData) =>
    api.post<ApiResponse<JournalEntry>>('/journal', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put<ApiResponse<JournalEntry>>(`/journal/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/journal/${id}`),
};

// Photo Services
export const photoService = {
  getAll: (category?: string) =>
    api.get<ApiResponse<Photo[]>>('/photos', { params: category ? { category } : {} }),
  upload: (formData: FormData) =>
    api.post<ApiResponse<Photo>>('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/photos/${id}`),
  getMonthly: () => api.get('/photos/monthly'),
};

// Wishlist Services
export const wishlistService = {
  getAll: () => api.get<ApiResponse<WishlistItem[]>>('/wishlist'),
  add: (data: Partial<WishlistItem>) =>
    api.post<ApiResponse<WishlistItem>>('/wishlist', data),
  update: (id: string, data: Partial<WishlistItem>) =>
    api.put<ApiResponse<WishlistItem>>(`/wishlist/${id}`, data),
  delete: (id: string) => api.delete(`/wishlist/${id}`),
  moveToInventory: (id: string) =>
    api.post(`/wishlist/${id}/move-to-inventory`),
};

// Compatibility Services
export const compatibilityService = {
  getRules: () => api.get<ApiResponse<CompatibilityRule[]>>('/compatibility'),
  createRule: (data: Partial<CompatibilityRule>) =>
    api.post<ApiResponse<CompatibilityRule>>('/compatibility', data),
  updateRule: (id: string, data: Partial<CompatibilityRule>) =>
    api.put<ApiResponse<CompatibilityRule>>(`/compatibility/${id}`, data),
  deleteRule: (id: string) => api.delete(`/compatibility/${id}`),
  check: (ingredients: string[]) =>
    api.post<ApiResponse<CompatibilityWarning[]>>('/compatibility/check', { ingredients }),
};

// Category Services
export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
  create: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>('/categories', data),
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Ingredient Services
export const ingredientService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<Ingredient[]>>('/ingredients', { params }),
  create: (data: Partial<Ingredient>) =>
    api.post<ApiResponse<Ingredient>>('/ingredients', data),
  update: (id: string, data: Partial<Ingredient>) =>
    api.put<ApiResponse<Ingredient>>(`/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/ingredients/${id}`),
};

// Analytics Services
export const analyticsService = {
  getDashboard: () => api.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),
  getRoutineCompletion: (days?: number) =>
    api.get<ApiResponse<RoutineCompletionData[]>>('/analytics/routine-completion', { params: { days } }),
  getProducts: () => api.get<ApiResponse<ProductStats>>('/analytics/products'),
  getJournal: () => api.get<ApiResponse<JournalStats>>('/analytics/journal'),
  getWeekly: () => api.get<ApiResponse<WeeklyActivity[]>>('/analytics/weekly'),
};

// Achievement Services
export const achievementService = {
  getAll: () => api.get<ApiResponse<Achievement[]>>('/achievements'),
  check: () => api.post<ApiResponse<Achievement[]>>('/achievements/check'),
};

// Calendar Services
export const calendarService = {
  getEvents: (year: number, month: number) =>
    api.get<ApiResponse<CalendarEvent[]>>('/calendar', { params: { year, month } }),
};

// Admin Services
export const adminService = {
  getUsers: () => api.get<ApiResponse<User[]>>('/admin/users'),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get<ApiResponse<PlatformStats>>('/admin/stats'),
};

// Data Services
export const dataService = {
  exportData: () => api.get('/data/export'),
  importData: (data: any) => api.post('/data/import', data),
};
