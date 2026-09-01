import { useEffect, useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

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
        deleteConversationRequest,
        errors
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [newReceiver, setNewReceiver] = useState('');
    const [isStartingNewChat, setIsStartingNewChat] = useState(false);
    const messagesEndRef = useRef(null);

    // Cargar lista de conversaciones al montar el componente
    useEffect(() => {
        loadConversations();
    }, []);

    // Cargar mensajes al cambiar la conversación activa
    useEffect(() => {
        if (activeConversation?._id) {
            loadMessages(activeConversation._id);
        }
    }, [activeConversation]);

    // Scroll automático al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Obtener el nombre del otro usuario en la conversación
    const getOtherMember = (members = []) => {
        return members.find((m) => m !== user?.username) || 'Usuario';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const receiver = isStartingNewChat
                ? newReceiver.trim()
                : getOtherMember(activeConversation?.members);

            await sendMessage({
                receiver,
                content: newMessage,
                conversationId: activeConversation?._id
            });

            setNewMessage('');
            if (isStartingNewChat) {
                setIsStartingNewChat(false);
                setNewReceiver('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockUser = async () => {
        const target = getOtherMember(activeConversation?.members);
        if (window.confirm(`¿Estás seguro de que deseas bloquear a ${target}?`)) {
            await blockUser(target);
        }
    };

    const handleDeleteChat = async () => {
        if (window.confirm('¿Deseas eliminar esta conversación y todo su historial?')) {
            await deleteConversation(activeConversation._id);
        }
    };

    return (
        <div className="max-w-6xl mx-auto my-6 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex h-[650px]">

                {/* PANEL LATERAL: Lista de Conversaciones */}
                <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <h2 className="text-xl font-bold text-white tracking-wide">Mensajes</h2>
                        <button
                            onClick={() => {
                                setIsStartingNewChat(true);
                                setActiveConversation(null);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                            + Nuevo Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
                        {conversations.length === 0 ? (
                            <p className="text-zinc-500 text-center text-sm mt-8">No tienes conversaciones activas</p>
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
                                        className={`p-4 cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-zinc-800/80 border-l-4 border-emerald-500' : 'hover:bg-zinc-900'
                                            }`}
                                    >
                                        <div>
                                            <h3 className="font-semibold text-zinc-200">{otherUser}</h3>
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

                {/* PANEL CENTRAL: Chat Activo */}
                <div className="w-2/3 flex flex-col bg-zinc-900">
                    {isStartingNewChat ? (
                        /* Vista para redactar a un nuevo usuario */
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-zinc-800 bg-zinc-950/40">
                                <label className="text-xs text-zinc-400 block mb-1">Para (Username):</label>
                                <input
                                    type="text"
                                    value={newReceiver}
                                    onChange={(e) => setNewReceiver(e.target.value)}
                                    placeholder="Ej. lautaro99"
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex-1 p-4 flex items-center justify-center text-zinc-500 text-sm">
                                Escribe un mensaje abajo para iniciar la conversación.
                            </div>

                            {errors.length > 0 && (
                                <div className="p-2 mx-4 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded">
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
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                                >
                                    Enviar
                                </button>
                            </form>
                        </div>
                    ) : activeConversation ? (
                        /* Vista del chat seleccionado */
                        <div className="flex flex-col h-full">
                            {/* Header del chat */}
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
                                <span className="font-semibold text-white">
                                    {getOtherMember(activeConversation.members)}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBlockUser}
                                        className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-950/40 border border-amber-800 transition"
                                    >
                                        Bloquear
                                    </button>
                                    <button
                                        onClick={handleDeleteChat}
                                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/40 border border-red-800 transition"
                                    >
                                        Eliminar Chat
                                    </button>
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
                                                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-zinc-500 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {errors.length > 0 && (
                                <div className="p-2 mx-4 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded">
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
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                                >
                                    Enviar
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Estado vacío si no hay chat seleccionado */
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <span className="text-4xl">💬</span>
                            <p className="text-sm">Selecciona una conversación o inicia un nuevo chat</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}