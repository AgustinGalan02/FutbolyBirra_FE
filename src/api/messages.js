import axios from './axios';

export const getMessagesRequest = (conversationId) => axios.get(`/messages/${conversationId}`);
export const sendMessageRequest = (data) => axios.post('/messages', data);