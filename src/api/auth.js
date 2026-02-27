import axios from './axios';

export const RegisterRequest = (user) => axios.post(`/register`, user); // registro

export const LoginRequest = (user) => axios.post(`/login`, user); // login

export const VerifyTokenRequest = () => axios.get(`/verify`); // validacion token

export const LogoutRequest = () => axios.post('/logout'); // logout