import axios from './axios';

// Obtener todas las notificaciones
export const getNotificationsRequest = () => axios.get('/notifications');

// Marcar una notificación específica como leída
export const markAsReadRequest = (id) => axios.put(`/notifications/${id}/read`);

// Marcar todas como leídas
export const markAllAsReadRequest = () => axios.put('/notifications/read-all');