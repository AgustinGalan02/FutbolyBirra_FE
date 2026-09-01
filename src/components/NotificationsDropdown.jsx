import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell,
    UserPlus,
    MessageSquare,
    Reply,
    Check,
    ExternalLink
} from 'lucide-react';
import {
    getNotificationsRequest,
    markAsReadRequest,
    markAllAsReadRequest
} from '../api/notifications';

function NotificationsDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = async () => {
        try {
            const res = await getNotificationsRequest();
            setNotifications(res.data || []);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Consulta periódica cada 4 segundos
        const interval = setInterval(fetchNotifications, 4000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar al hacer click afuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsReadRequest(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error('Error al marcar notificación:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsReadRequest();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    const renderNotificationContent = (item) => {
        switch (item.type) {
            case 'friend_request':
                return {
                    icon: <UserPlus className="w-4 h-4 text-emerald-400" />,
                    text: (
                        <span>
                            <b className="text-white">@{item.sender?.username}</b> te envió una solicitud de amistad.
                        </span>
                    ),
                    link: `/profile/${item.sender?.username}`
                };
            case 'post_comment':
                return {
                    icon: <MessageSquare className="w-4 h-4 text-[#f0ac00]" />,
                    text: (
                        <span>
                            <b className="text-white">@{item.sender?.username}</b> comentó en tu tema{' '}
                            <span className="italic text-zinc-400">"{item.post?.title}"</span>.
                        </span>
                    ),
                    link: `/post/${item.post?._id || item.post}`
                };
            case 'comment_reply':
                return {
                    icon: <Reply className="w-4 h-4 text-blue-400" />,
                    text: (
                        <span>
                            <b className="text-white">@{item.sender?.username}</b> respondió a tu comentario o te mencionó.
                        </span>
                    ),
                    link: `/post/${item.post?._id || item.post}`
                };
            default:
                return {
                    icon: <Bell className="w-4 h-4 text-zinc-400" />,
                    text: <span>Tenés una nueva interacción.</span>,
                    link: '#'
                };
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de la Campana */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-[#f0ac00] hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                title="Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#f0ac00] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-zinc-700 flex items-center justify-between bg-zinc-750">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-[#f0ac00]" /> Notificaciones
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] text-[#f0ac00] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <Check className="w-3 h-3" /> Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-700/60">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 text-xs">
                                No tenés notificaciones.
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const config = renderNotificationContent(item);
                                return (
                                    <div
                                        key={item._id}
                                        className={`p-3 text-xs flex items-start justify-between gap-3 transition ${item.read ? 'bg-zinc-800 hover:bg-zinc-750/70 opacity-75' : 'bg-zinc-700/30 hover:bg-zinc-700/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2.5 flex-grow">
                                            <div className="mt-0.5">{config.icon}</div>
                                            <div className="text-zinc-300 leading-snug">
                                                {config.text}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Link
                                                to={config.link}
                                                onClick={() => {
                                                    if (!item.read) handleMarkAsRead(item._id);
                                                    setIsOpen(false);
                                                }}
                                                className="p-1 text-zinc-400 hover:text-white transition"
                                                title="Ver"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                            {!item.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(item._id)}
                                                    className="p-1 text-zinc-400 hover:text-[#f0ac00] transition cursor-pointer"
                                                    title="Marcar como leída"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
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

export default NotificationsDropdown;