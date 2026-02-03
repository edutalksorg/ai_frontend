import { apiService } from './api';

export const pronunciationService = {
  // User Operations
  listParagraphs: async (params?: Record<string, any>) =>
    apiService.get('/pronunciation/paragraphs', {
      params: {
        ...params,
        pageSize: params?.pageSize || 1000, // Request up to 1000 paragraphs by default
        pageNumber: params?.pageNumber || 1
      }
    }),

  getParagraph: async (paragraphId: string) =>
    apiService.get(`/pronunciation/paragraphs/${paragraphId}`),

  searchParagraphs: async (query: string, params?: Record<string, any>) =>
    apiService.get('/pronunciation/search', { params: { q: query, ...params } }),

  getParagraphsByLevel: async (level: 'Beginner' | 'Intermediate' | 'Advanced', params?: Record<string, any>) =>
    apiService.get(`/pronunciation/paragraphs/level/${level}`, { params }),

  // Assessment
  assessAudio: async (paragraphId: string, audioFile: Blob, transcript: string) => {
    // Send JSON with transcript for text-based analysis (since backend doesn't support multipart/form-data)
    return apiService.post('/pronunciation/assess', {
      paragraphId,
      transcript
    });
  },

  getAssessmentResult: async (assessmentId: string) =>
    apiService.get(`/pronunciation/assessments/${assessmentId}`),

  // History & Progress
  history: async (params?: Record<string, any>) =>
    apiService.get('/pronunciation/history', { params }),

  getAttempts: async (paragraphId: string, params?: Record<string, any>) =>
    apiService.get(`/pronunciation/paragraphs/${paragraphId}/attempts`, { params }),

  getAttemptDetails: async (attemptId: string) =>
    apiService.get(`/pronunciation/attempts/${attemptId}`),

  getProgressStats: async () =>
    apiService.get('/pronunciation/progress'),

  getImprovementTrend: async () =>
    apiService.get('/pronunciation/improvement-trend'),

  // Favorites & Bookmarks
  addToFavorites: async (paragraphId: string) =>
    apiService.post(`/pronunciation/paragraphs/${paragraphId}/favorite`),

  removeFromFavorites: async (paragraphId: string) =>
    apiService.post(`/pronunciation/paragraphs/${paragraphId}/unfavorite`),

  getFavorites: async (params?: Record<string, any>) =>
    apiService.get('/pronunciation/favorites', { params }),

  // Recommendations
  getRecommendedParagraphs: async (params?: Record<string, any>) =>
    apiService.get('/pronunciation/recommended', { params }),

  // Instructor Operations
  createParagraph: async (data: any) =>
    apiService.post('/pronunciation/paragraphs', data),

  updateParagraph: async (paragraphId: string, data: any) =>
    apiService.put(`/pronunciation/paragraphs/${paragraphId}`, data),

  deleteParagraph: async (paragraphId: string) =>
    apiService.delete(`/pronunciation/paragraphs/${paragraphId}`),

  togglePublish: async (paragraphId: string, isPublished: boolean) =>
    apiService.post(`/pronunciation/paragraphs/${paragraphId}/publish`, { isPublished }),

  getInstructorParagraphs: async (params?: Record<string, any>) =>
    apiService.get('/pronunciation/paragraphs', {
      params: {
        ...params,
        mode: 'instructor',
        pageSize: params?.pageSize || 1000, // Request up to 1000 paragraphs by default
        pageNumber: params?.pageNumber || 1
      }
    }),

  getParagraphAnalytics: async (paragraphId: string) =>
    apiService.get(`/pronunciation/paragraphs/${paragraphId}/analytics`),

  // Admin Operations
  adminGetParagraphs: async (params?: Record<string, any>) =>
    apiService.get('/admin/pronunciation/paragraphs', { params }),

  adminApproveParagraph: async (paragraphId: string, feedback?: string) =>
    apiService.post(`/admin/pronunciation/paragraphs/${paragraphId}/approve`, { feedback }),

  adminRejectParagraph: async (paragraphId: string, reason: string) =>
    apiService.post(`/admin/pronunciation/paragraphs/${paragraphId}/reject`, { reason }),

  adminFlagParagraph: async (paragraphId: string, reason: string) =>
    apiService.post(`/admin/pronunciation/paragraphs/${paragraphId}/flag`, { reason }),

  // Voice Features
  getAudioWaveform: async (audioUrl: string) =>
    apiService.get('/pronunciation/waveform', { params: { url: audioUrl } }),

  getPhonemes: async (text: string) =>
    apiService.post('/pronunciation/phonemes', { text }),

  // Bulk Operations
  bulkImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/pronunciation/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportParagraphs: async (paragraphIds: string[]) =>
    apiService.post('/pronunciation/export', { paragraphIds }),

  // AI Voice-Over
  convertToSpeech: async (paragraphId: string) =>
    apiService.post(`/pronunciation/paragraphs/${paragraphId}/convert-paragraph-to-speech`, {
      paragraphId
    }),

  // Categories
  getCategories: async () =>
    apiService.get('/pronunciation/categories'),

  getParagraphsByCategory: async (categoryId: string, params?: Record<string, any>) =>
    apiService.get(`/pronunciation/categories/${categoryId}/paragraphs`, { params }),
};

export default pronunciationService;
