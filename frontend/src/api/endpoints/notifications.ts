import { apiClient } from '../client';
import type { NotificationsResponse } from '../types/notification.types';

export const notificationsApi = {
    getNotifications: async (): Promise<NotificationsResponse> => {
        const response = await apiClient.get<NotificationsResponse>('/internal/users/notifications');
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await apiClient.patch(`/internal/users/notifications/${notificationId}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch('/internal/users/notifications/read-all');
    },
};
