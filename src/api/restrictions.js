import axios from './axios';

export const getRestrictionsRequest = () => axios.get('/restrictions');
export const createRestrictionRequest = (data) => axios.post('/restrictions', data);
export const removeRestrictionRequest = (personTarget) => axios.delete(`/restrictions/${personTarget}`);