import axios from './axios';

export const getCommentsByPostRequest = (postId) => axios.get(`/comments/${postId}`);
export const createCommentRequest = (comment) => axios.post('/comments', comment);