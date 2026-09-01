import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  MessageSquare,
  LogOut,
  Activity,
  Send,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Users
} from 'lucide-react';
import { getMyPostsRequest, getMyCommentsRequest } from '../api/profile';
import { getUserProfileRequest } from '../api/auth';
import {
  getFriendsRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendRequest
} from '../api/friends';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { Navbar, LoadingSpinner, Button, FormatDate, DeleteModal } from '../components/';

import "../index.css";

function ProfilePage() {
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para el modal de confirmación de eliminar amigo
  const [isRemoveFriendModalOpen, setIsRemoveFriendModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);

  const isOwnProfile = !username || username === authUser?.username;
  const authUserId = authUser?.id || authUser?._id;

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      let currentUserData = null;

      if (isOwnProfile) {
        currentUserData = authUser;
      } else {
        const userRes = await getUserProfileRequest(username);
        currentUserData = userRes.data;
      }

      setProfileUser(currentUserData);

      const targetId = currentUserData?.id || currentUserData?._id;

      const promises = [
        targetId ? getMyPostsRequest(targetId) : Promise.resolve({ data: [] }),
        targetId ? getMyCommentsRequest(targetId) : Promise.resolve({ data: [] })
      ];

      if (isAuthenticated) {
        promises.push(getFriendsRequest());
      }

      const [postsRes, commentsRes, friendsRes] = await Promise.all(promises);

      setMyPosts(postsRes.data || []);
      setMyComments(commentsRes.data || []);

      if (friendsRes?.data) {
        setFriendsList(friendsRes.data.friends || []);
        setFriendRequests(friendsRes.data.friendRequests || []);
      }
    } catch (error) {
      console.error("Error al cargar perfil", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated || username) {
      loadProfileData();
    }
  }, [username, authUser, isOwnProfile, isAuthenticated]);

  // Handlers de Amigos
  const handleSendRequest = async () => {
    if (!profileUser?.username) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(profileUser.username);
      await loadProfileData();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    setActionLoading(true);
    try {
      await acceptFriendRequest(senderId);
      await loadProfileData();
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (senderId) => {
    setActionLoading(true);
    try {
      await rejectFriendRequest(senderId);
      await loadProfileData();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openRemoveFriendModal = (friend) => {
    setFriendToRemove(friend);
    setIsRemoveFriendModalOpen(true);
  };

  const handleConfirmRemoveFriend = async () => {
    if (!friendToRemove) return;
    setActionLoading(true);
    try {
      const friendId = friendToRemove._id || friendToRemove.id;
      await removeFriendRequest(friendId);
      setIsRemoveFriendModalOpen(false);
      setFriendToRemove(null);
      await loadProfileData();
    } catch (error) {
      console.error("Error al eliminar amigo:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated && !username) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center">
        <Navbar backTo="/" backLabel="Volver" />
      </div>
    );
  }

  const getTeamData = (teamValue) => {
    const found = ARGENTINE_TEAMS_LOCAL.find(item =>
      String(item.team.id) === String(teamValue)
    );
    if (found) return found.team;
    return { name: "Sin equipo", logo: null };
  };

  const userTeam = getTeamData(profileUser?.team);
  const profileUserId = profileUser?.id || profileUser?._id;

  // Estados de relación
  const isFriend = friendsList.some(f => (f._id || f.id) === profileUserId);
  const hasIncomingRequest = friendRequests.some(r => (r.from?._id || r.from?.id || r.from) === profileUserId);
  const hasSentRequest = profileUser?.friendRequests?.some(r => (r.from?._id || r.from?.id || r.from) === authUserId);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans pb-10">
      <Navbar backTo="/" backLabel="Volver al inicio" />

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA: Tarjeta de Usuario */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl p-6 text-center">
              <div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-[#f0ac00]">
                <User className="w-12 h-12 text-[#f0ac00]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-wide">
                {profileUser?.username || "Usuario"}
              </h1>
              <p className="text-[#f0ac00] text-sm font-medium mb-6">Hincha de {userTeam.name}</p>

              <div className="space-y-4 text-left border-t border-zinc-700 pt-6">
                {profileUser?.email && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="w-5 h-5 text-zinc-500" />
                    <span className="text-sm truncate">{profileUser?.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-zinc-300">
                  {userTeam.logo ? (
                    <img
                      src={userTeam.logo}
                      alt={userTeam.name}
                      className="w-6 h-6 object-contain drop-shadow-md"
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-zinc-500" />
                  )}
                  <span className="text-sm font-semibold text-[#f0ac00]">
                    {userTeam.name}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-8 pt-6 border-t border-zinc-700 space-y-3">
                {isOwnProfile ? (
                  <Button onClick={handleLogout} className="w-full bg-red-600/10 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/messages"
                      className="w-full bg-[#f0ac00] hover:bg-[#d49800] text-black font-bold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Mensaje
                    </Link>

                    {isAuthenticated && (
                      <div>
                        {isFriend ? (
                          <button
                            onClick={() => openRemoveFriendModal(profileUser)}
                            disabled={actionLoading}
                            className="w-full bg-zinc-700 hover:bg-red-600/20 text-zinc-300 hover:text-red-400 border border-zinc-600 hover:border-red-500 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            Amigos (Eliminar)
                          </button>
                        ) : hasIncomingRequest ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(profileUserId)}
                              disabled={actionLoading}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Aceptar
                            </button>
                            <button
                              onClick={() => handleRejectRequest(profileUserId)}
                              disabled={actionLoading}
                              className="flex-1 bg-zinc-700 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" /> Rechazar
                            </button>
                          </div>
                        ) : hasSentRequest ? (
                          <button
                            disabled
                            className="w-full bg-zinc-800 text-zinc-500 border border-zinc-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                          >
                            <Clock className="w-4 h-4" />
                            Solicitud Enviada
                          </button>
                        ) : (
                          <button
                            onClick={handleSendRequest}
                            disabled={actionLoading}
                            className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4 text-[#f0ac00]" />
                            Agregar Amigo
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Estadísticas y Actividad */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-[#f0ac00]/20 p-3 rounded-lg text-[#f0ac00]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? '-' : myPosts.length}</p>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Temas</p>
                </div>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg text-blue-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? '-' : myComments.length}</p>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Respuestas</p>
                </div>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? '-' : (isOwnProfile ? friendsList.length : (profileUser?.friends?.length || 0))}
                  </p>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Amigos</p>
                </div>
              </div>
            </div>

            {/* Pestañas de Contenido */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
              <div className="flex border-b border-zinc-700">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'posts' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-750'}`}
                >
                  {isOwnProfile ? 'Mis Temas' : 'Temas'}
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'comments' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-750'}`}
                >
                  {isOwnProfile ? 'Mis Respuestas' : 'Respuestas'}
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition cursor-pointer relative ${activeTab === 'friends' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-750'}`}
                  >
                    Amigos
                    {friendRequests.length > 0 && (
                      <span className="ml-2 bg-[#f0ac00] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                        {friendRequests.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="p-0 min-h-75">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full pt-20">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    {/* LISTADO DE POSTS */}
                    {activeTab === 'posts' && (
                      <div className="divide-y divide-zinc-700">
                        {myPosts.length === 0 ? (
                          <div className="p-10 text-center text-zinc-500">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>{isOwnProfile ? 'Aún no creaste ningún tema.' : 'Este usuario aún no creó ningún tema.'}</p>
                          </div>
                        ) : (
                          myPosts.map(post => (
                            <div key={post._id} className="p-4 hover:bg-zinc-750 transition group">
                              <Link to={`/post/${post._id}`} className="text-lg text-zinc-200 font-semibold group-hover:text-[#f0ac00] transition block">
                                {post.title}
                              </Link>
                              <p className="text-xs text-zinc-500 mt-2">
                                Creado el {FormatDate(post.createdAt)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* LISTADO DE COMENTARIOS */}
                    {activeTab === 'comments' && (
                      <div className="divide-y divide-zinc-700">
                        {myComments.filter(comment => comment.post).length === 0 ? (
                          <div className="p-10 text-center text-zinc-500">
                            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>{isOwnProfile ? 'Aún no respondiste en ningún tema.' : 'Este usuario aún no respondió en ningún tema.'}</p>
                          </div>
                        ) : (
                          myComments
                            .filter(comment => comment.post)
                            .map(comment => (
                              <div key={comment._id} className="p-4 hover:bg-zinc-750 transition group">
                                <p className="text-zinc-300 text-sm mb-2 font-medium">"{comment.content}"</p>
                                <p className="text-xs text-zinc-500">
                                  En respuesta a: <Link to={`/post/${comment.post?._id}`} className="text-[#f0ac00] hover:underline">{comment.post?.title}</Link>
                                  <span className="mx-2">•</span> {FormatDate(comment.createdAt)}
                                </p>
                              </div>
                            ))
                        )}
                      </div>
                    )}

                    {/* PESTAÑA AMIGOS Y SOLICITUDES */}
                    {activeTab === 'friends' && isOwnProfile && (
                      <div className="p-4 space-y-6">
                        {/* Solicitudes pendientes */}
                        {friendRequests.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0ac00]">
                              Solicitudes Pendientes ({friendRequests.length})
                            </h3>
                            <div className="divide-y divide-zinc-700/60 bg-zinc-900/40 rounded-lg border border-zinc-700/50">
                              {friendRequests.map((req) => (
                                <div key={req._id || req.from?._id} className="p-3 flex items-center justify-between">
                                  <Link
                                    to={`/profile/${req.from?.username}`}
                                    className="font-semibold text-zinc-200 hover:text-[#f0ac00] transition flex items-center gap-2"
                                  >
                                    <User className="w-4 h-4 text-[#f0ac00]" />
                                    @{req.from?.username}
                                  </Link>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptRequest(req.from?._id || req.from?.id)}
                                      disabled={actionLoading}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition cursor-pointer"
                                    >
                                      Aceptar
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req.from?._id || req.from?.id)}
                                      disabled={actionLoading}
                                      className="bg-zinc-700 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition cursor-pointer"
                                    >
                                      Rechazar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lista de amigos confirmados */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Mis Amigos ({friendsList.length})
                          </h3>
                          {friendsList.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p>Todavía no agregaste a ningún amigo.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {friendsList.map((friend) => {
                                const friendTeam = getTeamData(friend.team);
                                return (
                                  <div
                                    key={friend._id || friend.id}
                                    className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-700/50 flex items-center justify-between"
                                  >
                                    <Link
                                      to={`/profile/${friend.username}`}
                                      className="flex items-center gap-3 group"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600 group-hover:border-[#f0ac00] transition">
                                        <User className="w-4 h-4 text-[#f0ac00]" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-zinc-200 group-hover:text-[#f0ac00] transition text-sm">
                                          @{friend.username}
                                        </p>
                                        <p className="text-xs text-zinc-500">{friendTeam.name}</p>
                                      </div>
                                    </Link>

                                    <button
                                      onClick={() => openRemoveFriendModal(friend)}
                                      title="Eliminar amigo"
                                      disabled={actionLoading}
                                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded transition cursor-pointer"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR AMIGO */}
      <DeleteModal
        isOpen={isRemoveFriendModalOpen}
        onClose={() => {
          setIsRemoveFriendModalOpen(false);
          setFriendToRemove(null);
        }}
        onConfirm={handleConfirmRemoveFriend}
        title="¿Eliminar de tu lista de amigos?"
        message={`¿Estás seguro de que querés eliminar a @${friendToRemove?.username || 'este usuario'} de tus amigos?`}
      />
    </div>
  );
}

export default ProfilePage;