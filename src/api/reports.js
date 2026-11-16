import axios from './axios';

// crear una denuncia
export const createReportRequest = (data) => axios.post('/reports', data);

// Moderador/Admin: obtener bandeja de denuncias pendientes
export const getPendingReportsRequest = () => axios.get('/reports/pending');

// Moderador/Admin: resolver denuncia aplicando sanción
export const resolveReportRequest = (id, data) => axios.put(`/reports/${id}/resolve`, data);

// Moderador/Admin: desestimar denuncia sin sanción
export const dismissReportRequest = (id, data) => axios.put(`/reports/${id}/dismiss`, data);