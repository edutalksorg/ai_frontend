import { apiService } from './api';
import { UserProfile } from '../types';
import { API_ENDPOINTS } from '../constants';

export const usersService = {
  // Profile Management
  getProfile: async (): Promise<UserProfile> => {
    return apiService.get<UserProfile>(API_ENDPOINTS.GET_PROFILE);
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiService.put<UserProfile>(API_ENDPOINTS.UPDATE_PROFILE, data);
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.uploadFile('/users/profile/avatar', file);
      if (typeof response === 'string') {
        return response;
      }
      return (response as any)?.avatarUrl || (response as any)?.url || '';
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const fallbackResponse = await apiService.uploadFile('/profile/avatar', file);
        if (typeof fallbackResponse === 'string') {
          return fallbackResponse;
        }
        return (fallbackResponse as any)?.avatarUrl || (fallbackResponse as any)?.url || '';
      }
      throw error;
    }
  },

  deleteAvatar: async () =>
    apiService.delete('/users/profile/avatar'),

  // Account Settings
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    apiService.post('/users/change-password', data),

  enableTwoFactor: async () =>
    apiService.post('/users/security/2fa/enable'),

  disableTwoFactor: async (code: string) =>
    apiService.post('/users/security/2fa/disable', { code }),

  verifyTwoFactor: async (code: string) =>
    apiService.post('/users/security/2fa/verify', { code }),

  getSecuritySettings: async () =>
    apiService.get('/users/security/settings'),

  updateSecuritySettings: async (settings: any) =>
    apiService.put('/users/security/settings', settings),

  // Login Sessions
  getActiveSessions: async () =>
    apiService.get('/users/sessions'),

  getSessionDetails: async (sessionId: string) =>
    apiService.get(`/users/sessions/${sessionId}`),

  revokeSession: async (sessionId: string) =>
    apiService.delete(`/users/sessions/${sessionId}`),

  revokeAllSessions: async () =>
    apiService.post('/users/sessions/revoke-all'),

  // Email & Phone Management
  addEmail: async (email: string) =>
    apiService.post('/users/email/add', { email }),

  verifyEmail: async (email: string, code: string) =>
    apiService.post('/users/email/verify', { email, code }),

  removeEmail: async (email: string) =>
    apiService.delete(`/users/email/${email}`),

  setEmailAsDefault: async (email: string) =>
    apiService.post(`/users/email/${email}/set-default`),

  addPhone: async (phone: string) =>
    apiService.post('/users/phone/add', { phone }),

  verifyPhone: async (phone: string, code: string) =>
    apiService.post('/users/phone/verify', { phone, code }),

  removePhone: async (phone: string) =>
    apiService.delete(`/users/phone/${phone}`),

  // Notification Preferences
  getNotificationPreferences: async () =>
    apiService.get('/users/notification-preferences'),

  updateNotificationPreferences: async (preferences: any) =>
    apiService.put('/users/notification-preferences', preferences),

  getNotifications: async (params?: Record<string, any>) =>
    apiService.get('/users/notifications', { params }),

  markNotificationAsRead: async (notificationId: string) =>
    apiService.put(`/users/notifications/${notificationId}/read`),

  markAllNotificationsAsRead: async () =>
    apiService.post('/users/notifications/mark-all-read'),

  deleteNotification: async (notificationId: string) =>
    apiService.delete(`/users/notifications/${notificationId}`),

  // Privacy & Data
  getPrivacySettings: async () =>
    apiService.get('/users/privacy/settings'),

  updatePrivacySettings: async (settings: any) =>
    apiService.put('/users/privacy/settings', settings),

  downloadMyData: async () =>
    apiService.get('/users/data/export'),

  deleteAccount: async (password: string, reason?: string) =>
    apiService.post('/users/delete-account', { password, reason }),

  // User Preferences
  getPreferences: async () =>
    apiService.get('/users/preferences'),

  updatePreferences: async (preferences: any) =>
    apiService.put('/users/preferences', preferences),

  // Learning Goals & Progress
  setLearningGoals: async (goals: string[]) =>
    apiService.post('/users/learning-goals', { goals }),

  getLearningGoals: async () =>
    apiService.get('/users/learning-goals'),

  getProgressSummary: async () =>
    apiService.get('/users/progress/summary'),

  getProgressAnalytics: async (params?: Record<string, any>) =>
    apiService.get('/users/progress/analytics', { params }),

  // Instructor Specific
  applyAsInstructor: async (data: {
    bio: string;
    expertise: string[];
    experience: string;
    qualifications?: string[];
    hourlyRate?: number;
  }) =>
    apiService.post('/users/apply-instructor', data),

  getInstructorProfile: async () => {
    try {
      // Try generic profile first as it usually contains all user data including roles
      return await apiService.get<UserProfile>(API_ENDPOINTS.GET_PROFILE);
    } catch (e) {
      console.warn('Fallback to instructor-profile failed, using base profile');
      return apiService.get<UserProfile>('/users/profile');
    }
  },

  updateInstructorProfile: async (data: Partial<UserProfile>) =>
    apiService.put<UserProfile>(API_ENDPOINTS.UPDATE_PROFILE, data),

  getInstructorStats: async () => {
    try {
      return await apiService.get<any>('/users/instructor-stats');
    } catch (err) {
      console.warn('Instructor stats endpoint not found, returning mock/empty');
      return {
        studentsTotal: 0,
        coursesTotal: 0,
        rating: 0,
        revenue: 0
      };
    }
  },

  // User Badges & Achievements
  getBadges: async () =>
    apiService.get('/users/badges'),

  getAchievements: async () =>
    apiService.get('/users/achievements'),

  claimAchievementBadge: async (achievementId: string) =>
    apiService.post(`/users/achievements/${achievementId}/claim`),

  // Leaderboard
  getLeaderboard: async (params?: Record<string, any>) =>
    apiService.get('/users/leaderboard', { params }),

  getUserRank: async () =>
    apiService.get('/users/leaderboard/rank'),

  // Admin Operations
  adminGetUser: async (userId: string) =>
    apiService.get(`/admin/users/${userId}`),

  adminGetUsers: async (params?: Record<string, any>) =>
    apiService.get('/admin/users', { params }),

  adminUpdateUser: async (userId: string, data: any) =>
    apiService.put(`/admin/users/${userId}`, data),

  adminDeleteUser: async (userId: string) =>
    apiService.delete(`/admin/users/${userId}`),

  adminSearchUsers: async (query: string, params?: Record<string, any>) =>
    apiService.get('/admin/users/search', { params: { q: query, ...params } }),

  adminSuspendUser: async (userId: string, reason: string, duration?: number) =>
    apiService.post(`/admin/users/${userId}/suspend`, { reason, duration }),

  adminUnsuspendUser: async (userId: string) =>
    apiService.post(`/admin/users/${userId}/unsuspend`),

  adminBanUser: async (userId: string, reason: string) =>
    apiService.post(`/admin/users/${userId}/ban`, { reason }),

  adminUnbanUser: async (userId: string) =>
    apiService.post(`/admin/users/${userId}/unban`),

  adminResetPassword: async (userId: string) =>
    apiService.post(`/admin/users/${userId}/reset-password`),

  adminForceLogout: async (userId: string) =>
    apiService.post(`/admin/users/${userId}/force-logout`),

  // User Statistics
  getUserStats: async (userId: string) =>
    apiService.get(`/admin/users/${userId}/stats`),

  getUserActivity: async (userId: string, params?: Record<string, any>) =>
    apiService.get(`/admin/users/${userId}/activity`, { params }),
};

export default usersService;

