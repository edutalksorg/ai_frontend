import { apiService } from './api';

export interface SiteSettings {
    [key: string]: string;
}

export const settingsService = {
    /**
     * Get site-wide settings (public)
     */
    getSiteSettings: async (): Promise<SiteSettings> => {
        const response = await apiService.get<any>('/settings/site');
        // Based on apiService unwrap logic, it returns the data property directly
        return response || {};
    },

    /**
     * Update site-wide settings (Admin only)
     */
    updateSiteSettings: async (settings: Partial<SiteSettings>): Promise<{ success: boolean; message: string }> => {
        const response = await apiService.post<any>('/settings/site', settings);
        return response;
    }
};
