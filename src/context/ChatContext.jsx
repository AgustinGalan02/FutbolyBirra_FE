import { createContext, useContext, useState, useEffect } from "react";
import { getConversationsRequest, deleteConversationRequest } from "../api/conversations";
import { getMessagesRequest, sendMessageRequest } from "../api/messages";
import { getRestrictionsRequest, createRestrictionRequest, removeRestrictionRequest } from "../api/restrictions";
import { getUserProfileRequest } from "../api/auth";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat debe ser usado dentro de un ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [restrictions, setRestrictions] = useState([]);
    const [errors, setErrors] = useState([]);

    const { socket } = useSocket() || {};

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = ({ message, conversationId }) => {
            if (String(activeConversation?._id) === String(conversationId)) {
                setMessages((prev) =>
                    prev.some((m) => m._id === message._id) ? prev : [...prev, message]
                );
            }
            loadConversations();
        };

        socket.on("new_message", handleNewMessage);
        return () => socket.off("new_message", handleNewMessage);
    }, [socket, activeConversation]);

    // CONVERSACIONES
    const loadConversations = async () => {
        try {
            const res = await getConversationsRequest();
            setConversations(res.data);
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al cargar conversaciones']);
        }
    };

    // BORRAR CONVERSACION
    const deleteConversation = async (id) => {
        try {
            await deleteConversationRequest(id);
            setConversations((prev) => prev.filter((c) => c._id !== id));
            if (activeConversation?._id === id) {
                setActiveConversation(null);
                setMessages([]);
            }
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al eliminar conversación']);
        }
    };

    // MENSAJES
    const loadMessages = async (conversationId) => {
        try {
            const res = await getMessagesRequest(conversationId);
            setMessages(res.data);
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al cargar mensajes']);
        }
    };

    const sendMessage = async (messageData) => {
        try {
            const res = await sendMessageRequest(messageData);
            setMessages((prev) => [...prev, res.data.message]);
            await loadConversations();
            return res.data;
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error al enviar mensaje';
            setErrors([errMsg]);
            throw error;
        }
    };

    // RESTRICCIONES - BLOQUEOS
    const loadRestrictions = async () => {
        try {
            const res = await getRestrictionsRequest();
            setRestrictions(res.data);
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al cargar restricciones']);
        }
    };

    const blockUser = async (targetUsernameOrPersonId) => {
        try {
            let personTarget = targetUsernameOrPersonId;

            if (!/^[0-9a-fA-F]{24}$/.test(String(targetUsernameOrPersonId))) {
                const profileRes = await getUserProfileRequest(targetUsernameOrPersonId);
                personTarget = profileRes.data?.personId || profileRes.data?.person?._id;
            }

            if (!personTarget) {
                setErrors(['No se pudo identificar la persona a bloquear']);
                return;
            }

            await createRestrictionRequest({
                personTarget,
                tipoRestriccion: 'BLOQUEO'
            });
            await loadRestrictions();
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al bloquear usuario']);
        }
    };

    const unblockUser = async (personTarget) => {
        try {
            await removeRestrictionRequest(personTarget);
            setRestrictions((prev) =>
                prev.filter((r) => String(r.personTarget?._id || r.personTarget) !== String(personTarget))
            );
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al desbloquear usuario']);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                conversations,
                activeConversation,
                setActiveConversation,
                messages,
                restrictions,
                errors,
                loadConversations,
                deleteConversation,
                loadMessages,
                sendMessage,
                loadRestrictions,
                blockUser,
                unblockUser
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};