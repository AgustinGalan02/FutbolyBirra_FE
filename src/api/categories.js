import axios from './axios';

export const GetCategoriesRequest = () => axios.get(`/categories`);