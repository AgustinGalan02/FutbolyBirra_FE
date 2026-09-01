import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversationsRequest, acceptConversationRequest } from '../api/conversations';
import { getMessagesRequest, sendMessageRequest } from '../api/messages';
import { getFriendsRequest } from '../api/friends';
import { Navbar, Footer, LoadingSpinner } from '../components';
import {
    MessageSquare,
    Send,
    User,
    Users,
    Inbox,
    Check,
    AlertCircle,
    Clock
} from 'lucide-react';

function ChatPage() {
    const { user, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const targetUserFromUrl = searchParams.get('with');

    const [conversations, setConversations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(targetUserFromUrl || null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [tab, setTab] = useState('friends');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Cargar lista de amigos y conversaciones
    const loadData = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [convRes, friendsRes] = await Promise.all([
                getConversationsRequest(),
                getFriendsRequest()
            ]);
            const convList = convRes.data || [];
            setConversations(convList);
            setFriends(friendsRes.data?.friends || []);
            return convList;
        } catch (err) {
            console.error("Error al cargar datos de chat:", err);
            return [];
        }
    }, [isAuthenticated]);

    // Cargar mensajes del chat activo
    const fetchActiveMessages = useCallback(async (targetUsername, currentConvs) => {
        if (!targetUsername) return;
        const conv = currentConvs.find(c => c.members.includes(targetUsername));
        if (conv) {
            setActiveConversation(conv);
            try {
                const msgRes = await getMessagesRequest(conv._id);
                setMessages(msgRes.data || []);
            } catch (err) {
                console.error("Error al traer mensajes:", err);
            }
        } else {
            setActiveConversation(null);
            setMessages([]);
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        async function init() {
            setLoading(true);
            const convList = await loadData();
            if (targetUserFromUrl) {
                setActiveChatUser(targetUserFromUrl);
                await fetchActiveMessages(targetUserFromUrl, convList);
            }
            setLoading(false);
        }
        init();
    }, [loadData, targetUserFromUrl, fetchActiveMessages]);

    // Polling cada 2.5 segundos para sincronizar ambos navegadores
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(async () => {
            try {
                const convRes = await getConversationsRequest();
                const convList = convRes.data || [];
                setConversations(convList);

                if (activeChatUser) {
                    const conv = convList.find(c => c.members.includes(activeChatUser));
                    if (conv) {
                        setActiveConversation(conv);
                        const msgRes = await getMessagesRequest(conv._id);
                        setMessages(msgRes.data || []);
                    }
                }
            } catch (err) {
                console.error("Error en sincronización:", err);
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [isAuthenticated, activeChatUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const selectUserToChat = async (targetUsername) => {
        setErrorMsg('');
        setActiveChatUser(targetUsername);
        setSearchParams({ with: targetUsername });
        await fetchActiveMessages(targetUsername, conversations);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !activeChatUser || sending) return;

        setSending(true);
        setErrorMsg('');
        try {
            const res = await sendMessageRequest({
                receiver: activeChatUser,
                content: text.trim(),
                conversationId: activeConversation?._id
            });

            setMessages(prev => [...prev, res.data.message]);
            setText('');

            if (!activeConversation && res.data.conversation) {
                setActiveConversation(res.data.conversation);
            }

            const convRes = await getConversationsRequest();
            setConversations(convRes.data || []);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleAcceptRequest = async (convId) => {
        try {
            const res = await acceptConversationRequest(convId);
            setConversations(prev => prev.map(c => c._id === convId ? res.data.conversation : c));
            if (activeConversation?._id === convId) {
                setActiveConversation(res.data.conversation);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isFriend = friends.some(f => f.username === activeChatUser);
    const isPending = activeConversation?.status === 'pending';
    const isInitiator = activeConversation?.initiatedBy === user?.username;
    const hasSentOneMessage = messages.filter(m => m.sender === user?.username).length >= 1;
    const isBlockedFromSending = !isFriend && isPending && isInitiator && hasSentOneMessage;

    const pendingRequests = conversations.filter(c => c.status === 'pending' && c.initiatedBy !== user?.username);

    if (loading) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col font-sans">
            <Navbar backTo="/" backLabel="Volver" />

            <main className="max-w-6xl mx-auto p-4 flex-grow w-full grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">

                {/* PANEL LATERAL */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl flex flex-col overflow-hidden">

                    <div className="flex border-b border-zinc-700 bg-zinc-900/40">
                        <button
                            onClick={() => setTab('friends')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition ${tab === 'friends' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Users className="w-4 h-4" /> Amigos
                        </button>
                        <button
                            onClick={() => setTab('requests')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition relative ${tab === 'requests' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Inbox className="w-4 h-4" /> Solicitudes
                            {pendingRequests.length > 0 && (
                                <span className="bg-[#f0ac00] text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto divide-y divide-zinc-700/50">
                        {tab === 'friends' ? (
                            friends.length === 0 ? (
                                <div className="p-6 text-center text-zinc-500 text-xs">
                                    No tenés amigos agregados aún para chatear.
                                </div>
                            ) : (
                                friends.map(friend => {
                                    const isSelected = activeChatUser === friend.username;
                                    return (
                                        <div
                                            key={friend._id || friend.id}
                                            onClick={() => selectUserToChat(friend.username)}
                                            className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${isSelected ? 'bg-[#f0ac00]/10 border-l-4 border-[#f0ac00]' : 'hover:bg-zinc-750'}`}
                                        >
                                            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-[#f0ac00] font-bold">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="font-semibold text-sm text-zinc-200">@{friend.username}</p>
                                                <p className="text-[11px] text-zinc-500">{friend.team || 'Neutral'}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        ) : (
                            pendingRequests.length === 0 ? (
                                <div className="p-6 text-center text-zinc-500 text-xs">
                                    No tenés solicitudes de mensajes pendientes.
                                </div>
                            ) : (
                                pendingRequests.map(reqConv => {
                                    const otherUser = reqConv.members.find(m => m !== user?.username);
                                    const isSelected = activeChatUser === otherUser;
                                    return (
                                        <div
                                            key={reqConv._id}
                                            onClick={() => selectUserToChat(otherUser)}
                                            className={`p-3 flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-[#f0ac00]/10 border-l-4 border-[#f0ac00]' : 'hover:bg-zinc-750'}`}
                                        >
                                            <div className="truncate">
                                                <p className="font-semibold text-sm text-zinc-200">@{otherUser}</p>
                                                <p className="text-[10px] text-amber-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Solicitud pendiente
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>

                {/* SALA DE CHAT */}
                <div className="md:col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl flex flex-col overflow-hidden">
                    {activeChatUser ? (
                        <>
                            {/* Header */}
                            <div className="p-3.5 border-b border-zinc-700 bg-zinc-750 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[#f0ac00] border border-[#f0ac00]/50 font-bold text-xs">
                                        {activeChatUser.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <Link to={`/profile/${activeChatUser}`} className="font-bold text-sm text-white hover:text-[#f0ac00] hover:underline transition">
                                            @{activeChatUser}
                                        </Link>
                                        <span className="block text-[10px] text-zinc-400">
                                            {isFriend ? 'Amigos' : 'No es tu amigo'}
                                        </span>
                                    </div>
                                </div>

                                {isPending && !isInitiator && (
                                    <button
                                        onClick={() => handleAcceptRequest(activeConversation?._id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" /> Aceptar Mensaje
                                    </button>
                                )}
                            </div>

                            {/* Mensajes */}
                            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-zinc-900/30">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                                        No hay mensajes en esta conversación. ¡Iniciá el chat!
                                    </div>
                                ) : (
                                    messages.map(m => {
                                        const isMe = m.sender === user?.username;
                                        return (
                                            <div key={m._id || m.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? 'bg-[#f0ac00] text-black font-medium' : 'bg-zinc-700 text-zinc-100'}`}>
                                                    <p>{m.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-zinc-700 bg-zinc-800">
                                {errorMsg && (
                                    <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errorMsg}
                                    </div>
                                )}

                                {isBlockedFromSending ? (
                                    <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-center text-xs text-zinc-400">
                                        <Clock className="w-4 h-4 mx-auto mb-1 text-[#f0ac00]" />
                                        Ya enviaste tu mensaje de solicitud. Tenés que esperar a que <b>@{activeChatUser}</b> acepte para seguir chateando.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={!isFriend && !activeConversation ? "Enviá tu mensaje de solicitud..." : "Escribí tu mensaje..."}
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            className="flex-grow bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f0ac00]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!text.trim() || sending}
                                            className="bg-[#f0ac00] hover:bg-[#d49800] disabled:opacity-50 text-black px-4 py-2 rounded-lg font-bold transition flex items-center justify-center cursor-pointer"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
                            <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-semibold">Seleccioná a un amigo o responde una solicitud para chatear</p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
}

export default ChatPage;