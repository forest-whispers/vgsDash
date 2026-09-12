import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import * as notificationsService from "../notifications.service";
import type { NotificationItem } from "../notifications.types";
import { formatNotificationMessage } from "../utils/formatNotification";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function NotificationDropdown() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load of unread count when authenticated app loads
    useEffect(() => {
        let isMounted = true;
        notificationsService
            .getUnreadCount()
            .then((count) => {
                if (isMounted) setUnreadCount(count);
            })
            .catch(() => {
                // Non-critical, ignore
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Load notifications when panel is opened
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        notificationsService
            .getNotifications()
            .then((items) => {
                if (isMounted) {
                    setNotifications(items);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(getErrorMessage(err, "Failed to load notifications"));
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    // Close panel on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsLoading(true);
                setError(null);
            }
            return next;
        });
    };

    const handleMarkOneRead = async (notification: NotificationItem) => {
        if (!notification.readAt) {
            try {
                const updated = await notificationsService.markNotificationRead(
                    notification.id
                );
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id
                            ? { ...n, readAt: updated.readAt }
                            : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch {
                // Ignore failure on click
            }
        }

        // Navigate if applicable
        if (notification.projectId) {
            setIsOpen(false);
            if (user?.role === "DEVELOPER") {
                navigate("/tasks");
            } else {
                navigate('/projects/' + notification.projectId);
            }
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0 || isMarkingAll) return;

        setIsMarkingAll(true);
        try {
            await notificationsService.markAllNotificationsRead();
            const now = new Date().toISOString();
            setNotifications((prev) =>
                prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
            );
            setUnreadCount(0);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to mark all as read"));
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Notification Bell Button */}
            <button
                type="button"
                onClick={handleToggle}
                className="relative flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition focus:outline-none"
                title="Notifications"
                aria-label="Notifications"
            >
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread count badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                                {isMarkingAll ? "Marking..." : "Mark all as read"}
                            </button>
                        )}
                    </div>

                    {/* Panel Body */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="flex min-h-[160px] items-center justify-center">
                                <Spinner />
                            </div>
                        ) : error ? (
                            <div className="p-4 text-xs text-red-600 text-center">
                                {error}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-500">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isUnread = !notification.readAt;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleMarkOneRead(notification)}
                                        className={'flex items-start gap-3 p-3.5 transition cursor-pointer ' +
                                            (isUnread
                                                ? "bg-blue-50/50 hover:bg-blue-50"
                                                : "bg-white hover:bg-gray-50")}
                                    >
                                        {/* Unread indicator dot */}
                                        <div className="mt-1 flex shrink-0 items-center justify-center">
                                            {isUnread ? (
                                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                                            ) : (
                                                <span className="h-2 w-2 rounded-full bg-transparent" />
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <p
                                                className={'text-xs ' +
                                                    (isUnread
                                                        ? "font-semibold text-gray-900"
                                                        : "text-gray-700")}
                                            >
                                                {formatNotificationMessage(notification)}
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(
                                                    notification.createdAt
                                                ).toLocaleString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
