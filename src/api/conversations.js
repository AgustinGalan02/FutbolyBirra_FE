import axios from './axios';

export const getConversationsRequest = () => axios.get('/conversations');
export const deleteConversationRequest = (id) => axios.delete(`/conversations/${id}`);