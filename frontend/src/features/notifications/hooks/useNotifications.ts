import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/endpoints/notifications';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationsApi.getNotifications,
        enabled: isAuthenticated,
        refetchInterval: 15000,
        staleTime: 10000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return {
        notifications: notificationsQuery.data?.notifications ?? [],
        unreadCount: notificationsQuery.data?.unreadCount ?? 0,
        isLoading: notificationsQuery.isLoading,
        isError: notificationsQuery.isError,
        refetch: notificationsQuery.refetch,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        isMarkingAll: markAllAsReadMutation.isPending,
    };
}
