import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Truck,
    PackageCheck,
    CreditCard,
    AlertCircle,
    ShoppingBag,
    ExternalLink,
    Clock,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationItem } from '@/api/types/notification.types';

function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return '';
    }
}

function getNotificationIcon(status?: string) {
    switch (status?.toUpperCase()) {
        case 'SHIPPED':
            return <Truck size={16} className="text-blue-500 shrink-0" />;
        case 'DELIVERED':
            return <PackageCheck size={16} className="text-green-500 shrink-0" />;
        case 'PAID':
            return <CreditCard size={16} className="text-emerald-500 shrink-0" />;
        case 'CANCELLED':
        case 'FAILED':
            return <AlertCircle size={16} className="text-red-500 shrink-0" />;
        case 'CREATED':
        default:
            return <ShoppingBag size={16} className="text-primary shrink-0" />;
    }
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isMarkingAll,
    } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: NotificationItem) => {
        if (!item.isRead) {
            markAsRead(item.id);
        }
        if (item.link) {
            setIsOpen(false);
            navigate(item.link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell trigger button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={isOpen}
            >
                <Bell size={20} className="text-text transition-transform active:scale-95" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-surface-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-text">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                disabled={isMarkingAll}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
                        {notifications.length === 0 ? (
                            <div className="py-10 px-4 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
                                    <Bell size={22} />
                                </div>
                                <p className="text-sm font-medium text-text">No notifications yet</p>
                                <p className="text-xs text-text-muted mt-1 max-w-[240px] mx-auto">
                                    You'll see real-time updates here whenever your orders are placed, paid, shipped, or delivered.
                                </p>
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`p-3.5 flex gap-3 hover:bg-surface-muted/60 transition-colors cursor-pointer text-left ${
                                        !item.isRead ? 'bg-primary/[0.04]' : ''
                                    }`}
                                >
                                    <div className="mt-0.5 p-2 rounded-lg bg-surface border border-border/70 shadow-xs flex items-center justify-center">
                                        {getNotificationIcon(item.status)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1 mb-0.5">
                                            <p className={`text-xs font-semibold truncate ${!item.isRead ? 'text-text' : 'text-text-muted'}`}>
                                                {item.title}
                                            </p>
                                            {!item.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between text-[11px]">
                                            <span className="flex items-center gap-1 text-text-muted/80">
                                                <Clock size={11} />
                                                {formatRelativeTime(item.createdAt)}
                                            </span>
                                            {item.link && (
                                                <span className="flex items-center gap-0.5 text-primary font-medium hover:underline">
                                                    Track Order
                                                    <ExternalLink size={11} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
