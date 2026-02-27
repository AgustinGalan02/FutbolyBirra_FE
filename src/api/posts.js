import axios from './axios';

export const getPostRequest = (id) => axios.get(`/posts/${id}`);
export const getPostsByCategoryRequest = (categoryId) => axios.get(`/posts/category/${categoryId}`);
export const createPostRequest = (post) => axios.post('/posts', post);
export const deletePostRequest = (id) => axios.delete(`/posts/${id}`);
export const updatePostRequest = (id, post) => axios.put(`/posts/${id}`, post);