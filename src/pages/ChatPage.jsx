import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Send,
    MoreVertical,
    ShieldBan,
    Trash2,
    Shield,
    X,
    ChevronDown,
    MessageCirclePlus,
    Check
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { getFriendsRequest } from '../api/friends';
import { getUserProfileRequest } from '../api/auth';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { Navbar, Footer } from '../components';

export default function ChatPage() {
    const { user } = useAuth();
    const {
        conversations,
        loadConversations,
        activeConversation,
        setActiveConversation,
        messages,
        loadMessages,
        sendMessage,
        blockUser,
        deleteConversation,
        errors
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [newReceiver, setNewReceiver] = useState('');
    const [isStartingNewChat, setIsStartingNewChat] = useState(false);

    // Modal y selector personalizado para "Nuevo Chat"
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const friendDropdownRef = useRef(null);

    // Amigos para el desplegable de "Nuevo Chat"
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    // Datos del perfil del contacto activo (club / team)
    const [activePartnerInfo, setActivePartnerInfo] = useState(null);

    // Menú desplegable de 3 puntitos en el header del chat
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const messagesEndRef = useRef(null);

    const getTeamData = (teamValue) => {
        const found = ARGENTINE_TEAMS_LOCAL.find(
            (item) => String(item.team.id) === String(teamValue)
        );
        if (found) return found.team;
        return { name: 'Sin equipo', logo: null };
    };

    // Cargar conversaciones y lista de amigos al montar
    useEffect(() => {
        loadConversations();
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            setLoadingFriends(true);
            const res = await getFriendsRequest();
            setFriends(res.data?.friends || []);
        } catch (error) {
            console.error('Error al cargar amigos:', error);
        } finally {
            setLoadingFriends(false);
        }
    };

    // Obtener el nombre del otro usuario en la conversación
    const getOtherMember = (members = []) => {
        return members.find((m) => m !== user?.username) || 'Usuario';
    };

    // Ordenar amigos según con quién más hablás (actividad/interacciones en conversations)
    const sortedFriends = useMemo(() => {
        return [...friends].sort((a, b) => {
            const convA = conversations.find((c) => c.members.includes(a.username));
            const convB = conversations.find((c) => c.members.includes(b.username));

            // Primero los que tienen conversación abierta
            if (convA && !convB) return -1;
            if (!convA && convB) return 1;

            if (convA && convB) {
                // Ordenar por cantidad de interacciones (indicadorPendientes) y luego por fecha más reciente
                const countDiff = (convB.indicadorPendientes || 0) - (convA.indicadorPendientes || 0);
                if (countDiff !== 0) return countDiff;

                return (
                    new Date(convB.fechaUltimaActualizacion || 0) -
                    new Date(convA.fechaUltimaActualizacion || 0)
                );
            }

            // Si ninguno tiene chat previo, orden alfabético
            return a.username.localeCompare(b.username);
        });
    }, [friends, conversations]);

    // Cargar mensajes y datos del club del contacto cuando cambia la conversación activa
    useEffect(() => {
        setIsMenuOpen(false);

        if (!activeConversation?._id) {
            setActivePartnerInfo(null);
            return;
        }

        loadMessages(activeConversation._id);

        const otherUsername = getOtherMember(activeConversation.members);
        if (otherUsername && otherUsername !== 'Usuario') {
            getUserProfileRequest(otherUsername)
                .then((res) => {
                    const data = res.data || {};
                    setActivePartnerInfo({
                        username: otherUsername,
                        team: data.person?.team || data.team || null
                    });
                })
                .catch(() => {
                    setActivePartnerInfo({ username: otherUsername, team: null });
                });
        }
    }, [activeConversation]);

    // Scroll automático al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cerrar menús flotantes al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
            if (friendDropdownRef.current && !friendDropdownRef.current.contains(e.target)) {
                setIsFriendDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpenNewChatModal = () => {
        setSelectedFriend(null);
        setIsFriendDropdownOpen(false);
        setIsNewChatModalOpen(true);
        fetchFriends();
    };

    const handleConfirmNewChat = () => {
        if (!selectedFriend) return;

        const existingConv = conversations.find((c) =>
            c.members.includes(selectedFriend.username)
        );

        setIsNewChatModalOpen(false);
        setIsFriendDropdownOpen(false);

        if (existingConv) {
            setIsStartingNewChat(false);
            setNewReceiver('');
            setActiveConversation(existingConv);
        } else {
            setActiveConversation(null);
            setIsStartingNewChat(true);
            setNewReceiver(selectedFriend.username);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (isStartingNewChat && !newReceiver) return;

        try {
            const receiver = isStartingNewChat
                ? newReceiver
                : getOtherMember(activeConversation?.members);

            const existingConv = isStartingNewChat
                ? conversations.find((c) => c.members.includes(receiver))
                : activeConversation;

            const result = await sendMessage({
                receiver,
                content: newMessage,
                conversationId: existingConv?._id
            });

            setNewMessage('');

            if (isStartingNewChat) {
                setIsStartingNewChat(false);
                setNewReceiver('');
                if (existingConv) {
                    setActiveConversation(existingConv);
                } else if (result?.conversationId) {
                    setActiveConversation({
                        _id: result.conversationId,
                        members: [user?.username, receiver]
                    });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockUser = async () => {
        setIsMenuOpen(false);
        const target = getOtherMember(activeConversation?.members);
        if (window.confirm(`¿Estás seguro de que deseas bloquear a @${target}?`)) {
            await blockUser(target);
        }
    };

    const handleDeleteChat = async () => {
        setIsMenuOpen(false);
        if (window.confirm('¿Deseas eliminar esta conversación y todo su historial?')) {
            await deleteConversation(activeConversation._id);
        }
    };

    const isSendDisabled = !newMessage.trim() || (isStartingNewChat && !newReceiver);
    const partnerTeam = activePartnerInfo?.team ? getTeamData(activePartnerInfo.team) : null;
    const newReceiverTeam = isStartingNewChat && selectedFriend ? getTeamData(selectedFriend.team) : null;

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
            {/* Navbar*/}
            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto my-6 px-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex h-[650px]">

                    {/* PANEL LATERAL*/}
                    <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h2 className="text-xl font-bold text-white tracking-wide">Mensajes</h2>
                            <button
                                onClick={handleOpenNewChatModal}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <MessageCirclePlus className="w-4 h-4" />
                                Nuevo Chat
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
                            {conversations.length === 0 ? (
                                <p className="text-zinc-500 text-center text-sm mt-8 px-4">
                                    No tienes conversaciones activas
                                </p>
                            ) : (
                                conversations.map((conv) => {
                                    const otherUser = getOtherMember(conv.members);
                                    const isSelected = activeConversation?._id === conv._id;
                                    return (
                                        <div
                                            key={conv._id}
                                            onClick={() => {
                                                setIsStartingNewChat(false);
                                                setActiveConversation(conv);
                                            }}
                                            className={`p-4 cursor-pointer transition flex items-center justify-between ${
                                                isSelected
                                                    ? 'bg-zinc-800/80 border-l-4 border-emerald-500'
                                                    : 'hover:bg-zinc-900'
                                            }`}
                                        >
                                            <div>
                                                <h3 className="font-semibold text-zinc-200">@{otherUser}</h3>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {new Date(conv.fechaUltimaActualizacion).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* PANEL CENTRAL*/}
                    <div className="w-2/3 flex flex-col bg-zinc-900">
                        {isStartingNewChat ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
                                    <div className="flex flex-col">
                                        <Link
                                            to={`/profile/${newReceiver}`}
                                            className="font-bold text-white hover:text-emerald-400 transition inline-flex items-center gap-1.5 w-fit"
                                        >
                                            @{newReceiver}
                                        </Link>
                                        {newReceiverTeam && (
                                            <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                                                {newReceiverTeam.logo ? (
                                                    <img
                                                        src={newReceiverTeam.logo}
                                                        alt={newReceiverTeam.name}
                                                        className="w-4 h-4 object-contain drop-shadow"
                                                    />
                                                ) : (
                                                    <Shield className="w-3.5 h-3.5 text-[#f0ac00]" />
                                                )}
                                                Hincha de{' '}
                                                <strong className="text-[#f0ac00] font-semibold">
                                                    {newReceiverTeam.name}
                                                </strong>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                                        Nuevo chat
                                    </span>
                                </div>

                                <div className="flex-1 p-4 flex items-center justify-center text-zinc-500 text-sm">
                                    Escribí un mensaje abajo para iniciar la conversación con @{newReceiver}.
                                </div>

                                {errors.length > 0 && (
                                    <div className="p-2 mx-4 mb-2 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded">
                                        {errors[0]}
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe el primer mensaje..."
                                        className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSendDisabled}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>Enviar</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        ) : activeConversation ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
                                    <div className="flex flex-col">
                                        <Link
                                            to={`/profile/${getOtherMember(activeConversation.members)}`}
                                            className="font-bold text-white hover:text-emerald-400 transition inline-flex items-center gap-1.5 w-fit"
                                            title="Ver perfil"
                                        >
                                            @{getOtherMember(activeConversation.members)}
                                        </Link>
                                        {partnerTeam && (
                                            <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                                                {partnerTeam.logo ? (
                                                    <img
                                                        src={partnerTeam.logo}
                                                        alt={partnerTeam.name}
                                                        className="w-4 h-4 object-contain drop-shadow"
                                                    />
                                                ) : (
                                                    <Shield className="w-3.5 h-3.5 text-[#f0ac00]" />
                                                )}
                                                Hincha de{' '}
                                                <strong className="text-[#f0ac00] font-semibold">
                                                    {partnerTeam.name}
                                                </strong>
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsMenuOpen((prev) => !prev)}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                                            title="Opciones de conversación"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="absolute right-0 mt-1.5 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl py-1.5 z-50">
                                                <button
                                                    type="button"
                                                    onClick={handleBlockUser}
                                                    className="w-full px-4 py-2 text-left text-xs text-amber-400 hover:bg-zinc-700/70 flex items-center gap-2 transition cursor-pointer"
                                                >
                                                    <ShieldBan className="w-4 h-4" />
                                                    Bloquear usuario
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteChat}
                                                    className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-zinc-700/70 flex items-center gap-2 transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contenedor de Mensajes */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                    {messages.map((msg) => {
                                        const isMine = msg.sender === user?.username;
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                                        isMine
                                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {errors.length > 0 && (
                                    <div className="p-2 mx-4 mb-2 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded">
                                        {errors[0]}
                                    </div>
                                )}

                                {/* Input para enviar mensaje */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>Enviar</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                                <span className="text-4xl">💬</span>
                                <p className="text-sm">Selecciona una conversación o inicia un nuevo chat</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* MODAL DE NUEVO CHAT*/}
            {isNewChatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md overflow-visible">
                        {/* Header del Modal */}
                        <div className="px-6 py-4 border-b border-zinc-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageCirclePlus className="w-5 h-5 text-[#f0ac00]" />
                                Iniciar Nuevo Chat
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsNewChatModalOpen(false)}
                                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-700 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                    Seleccioná un amigo
                                </label>

                                {loadingFriends ? (
                                    <div className="p-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-xs text-zinc-400">
                                        Cargando lista de amigos...
                                    </div>
                                ) : sortedFriends.length === 0 ? (
                                    <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-300">
                                        Todavía no tenés amigos agregados. Visitá el perfil de otros usuarios para enviarles solicitud de amistad.
                                    </div>
                                ) : (
                                    <div className="relative" ref={friendDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsFriendDropdownOpen((prev) => !prev)}
                                            className="w-full bg-zinc-900 border border-zinc-700 hover:border-[#f0ac00] text-left rounded-xl px-4 py-3 flex items-center justify-between transition cursor-pointer"
                                        >
                                            {selectedFriend ? (
                                                (() => {
                                                    const selTeam = getTeamData(selectedFriend.team);
                                                    return (
                                                        <div className="flex items-center gap-2.5">
                                                            {selTeam.logo ? (
                                                                <img
                                                                    src={selTeam.logo}
                                                                    alt={selTeam.name}
                                                                    className="w-5 h-5 object-contain"
                                                                />
                                                            ) : (
                                                                <Shield className="w-4 h-4 text-[#f0ac00]" />
                                                            )}
                                                            <span className="font-semibold text-white text-sm">
                                                                @{selectedFriend.username}
                                                            </span>
                                                            <span className="text-xs text-zinc-400">
                                                                ({selTeam.name})
                                                            </span>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-sm text-zinc-400">
                                                    -- Elegí un amigo de tu lista --
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`w-4 h-4 text-zinc-400 transition-transform ${
                                                    isFriendDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {isFriendDropdownOpen && (
                                            <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl divide-y divide-zinc-800 z-50">
                                                {sortedFriends.map((friend) => {
                                                    const fTeam = getTeamData(friend.team);
                                                    const hasChat = conversations.some((c) =>
                                                        c.members.includes(friend.username)
                                                    );
                                                    const isCurrentSelected =
                                                        selectedFriend?._id === friend._id;

                                                    return (
                                                        <button
                                                            key={friend._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedFriend(friend);
                                                                setIsFriendDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-zinc-800 transition cursor-pointer ${
                                                                isCurrentSelected ? 'bg-zinc-800/80' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {fTeam.logo ? (
                                                                    <img
                                                                        src={fTeam.logo}
                                                                        alt={fTeam.name}
                                                                        className="w-6 h-6 object-contain shrink-0"
                                                                    />
                                                                ) : (
                                                                    <Shield className="w-5 h-5 text-zinc-500 shrink-0" />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-semibold text-zinc-100">
                                                                        @{friend.username}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-400">
                                                                        {fTeam.name}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {hasChat && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                                                        Chat activo
                                                                    </span>
                                                                )}
                                                                {isCurrentSelected && (
                                                                    <Check className="w-4 h-4 text-[#f0ac00]" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-700 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsNewChatModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={!selectedFriend}
                                onClick={handleConfirmNewChat}
                                className="px-5 py-2 text-sm font-bold text-black bg-[#f0ac00] hover:bg-[#d49800] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
                            >
                                Abrir Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}