import { apiService } from './api';

export interface CarouselItem {
    id: number;
    title?: string;
    description?: string;
    image_url: string; // backend returns snake_case
    imageUrl?: string; // frontend helpful alias (we might need to map it)
    redirect_url?: string;
    display_order: number;
    is_active: boolean;
    created_at?: string;
}

export const carouselService = {
    // Public/User
    getPublicItems: async (): Promise<CarouselItem[]> => {
        return apiService.get<CarouselItem[]>('/carousel');
    },

    // Admin
    getAdminItems: async (): Promise<CarouselItem[]> => {
        return apiService.get<CarouselItem[]>('/carousel/admin');
    },

    createItem: async (formData: FormData) => {
        return apiService.post('/carousel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateItem: async (id: number | string, formData: FormData) => {
        return apiService.put(`/carousel/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteItem: async (id: number | string) => {
        return apiService.delete(`/carousel/${id}`);
    }
};
