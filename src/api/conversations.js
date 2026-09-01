import axios from './axios';

export const getConversationsRequest = () => axios.get('/conversations');
export const deleteConversationRequest = (id) => axios.delete(`/conversations/${id}`);
export const acceptConversationRequest = (id) => axios.put(`/conversations/${id}/accept`);