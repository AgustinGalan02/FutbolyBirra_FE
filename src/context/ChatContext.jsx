import { createContext, useContext, useState } from "react";
import { getConversationsRequest, deleteConversationRequest } from "../api/conversations";
import { getMessagesRequest, sendMessageRequest } from "../api/messages";
import { getRestrictionsRequest, createRestrictionRequest, removeRestrictionRequest } from "../api/restrictions";

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



    // CONVERSACIONES
    const loadConversations = async () => {
        try {
            const res = await getConversationsRequest();
            setConversations(res.data);
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al cargar conversaciones']);
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
            await loadConversations(); // Actualiza la lista lateral con el último mensaje/orden
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

    const blockUser = async (userTarget) => {
        try {
            await createRestrictionRequest({ userTarget });
            await loadRestrictions();
        } catch (error) {
            setErrors(error.response?.data ? [error.response.data.message] : ['Error al bloquear usuario']);
        }
    };

    const unblockUser = async (userTarget) => {
        try {
            await removeRestrictionRequest(userTarget);
            setRestrictions((prev) => prev.filter((r) => r.userTarget !== userTarget));
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
                deleteConversationRequest,
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