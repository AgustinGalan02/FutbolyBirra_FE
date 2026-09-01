import axios from './axios';

// Obtener lista de amigos confirmados y solicitudes pendientes
export const getFriendsRequest = () => axios.get('/friends');

// Enviar solicitud de amistad usando el username
export const sendFriendRequest = (targetUsername) =>
    axios.post(`/friends/request/${targetUsername}`);

// Aceptar solicitud de amistad pasando el ID del remitente
export const acceptFriendRequest = (senderId) =>
    axios.post(`/friends/accept/${senderId}`);

// Rechazar solicitud de amistad pasando el ID del remitente
export const rejectFriendRequest = (senderId) =>
    axios.post(`/friends/reject/${senderId}`);

// Eliminar a un amigo de la lista usando su ID
export const removeFriendRequest = (friendId) =>
    axios.delete(`/friends/${friendId}`);