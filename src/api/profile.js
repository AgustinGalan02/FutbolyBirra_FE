import axios from './axios';

export const getMyPostsRequest = (userId) => axios.get(`/posts/user/${userId}`);
export const getMyCommentsRequest = (userId) => axios.get(`/comments/user/${userId}`);