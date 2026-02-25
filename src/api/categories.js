import axios from './axios';

export const GetCategoriesRequest = () => axios.get(`/categories`);
export const getCategoryRequest = (id) => axios.get(`/categories/${id}`);