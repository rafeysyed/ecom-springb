export interface NotificationItem {
    id: string;
    userId: string;
    orderId?: string;
    title: string;
    message: string;
    link?: string;
    status?: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: NotificationItem[];
    unreadCount: number;
}
