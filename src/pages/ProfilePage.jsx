import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Shield, MessageSquare, LogOut, Activity, ArrowLeft } from 'lucide-react';
import { getMyPostsRequest, getMyCommentsRequest } from '../api/profile';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { Navbar, LoadingSpinner, Button, FormatDate } from '../components/';

import "../index.css";

function ProfilePage() {
  const { user, isAuthenticated, setUser, setIsAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Normalizamos el ID por las dudas (si viene como _id o id)
  const userId = user?.id || user?._id;

  useEffect(() => {
    async function loadUserActivity() {
      if (userId) {
        try {
          const [postsRes, commentsRes] = await Promise.all([
            getMyPostsRequest(userId),
            getMyCommentsRequest(userId)
          ]);
          setMyPosts(postsRes.data);
          setMyComments(commentsRes.data);
        } catch (error) {
          console.error("Error al cargar la actividad del usuario", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadUserActivity();
    }
  }, [userId, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center">
        <Navbar
          backTo="/"
          backLabel="Volver"
        />
      </div>
    );
  }


  const getTeamData = (teamValue) => {
    const found = ARGENTINE_TEAMS_LOCAL.find(item =>
      String(item.team.id) === String(teamValue)
    );
    if (found) return found.team;

    return {
      name: "Sin equipo",
      logo: null
    };
  };

  // Guardamos los datos del equipo del usuario en una constante
  const userTeam = getTeamData(user?.team);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans pb-10">
      <Navbar
        backTo="/"
        backLabel="Volver al inicio"
      />

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA: Tarjeta de Usuario */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl p-6 text-center">
              <div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-[#f0ac00]">
                <User className="w-12 h-12 text-[#f0ac00]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-wide">{user?.username}</h1>
              <p className="text-[#f0ac00] text-sm font-medium mb-6">Hincha de {userTeam.name}</p>

              <div className="space-y-4 text-left border-t border-zinc-700 pt-6">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Mail className="w-5 h-5 text-zinc-500" />
                  <span className="text-sm truncate">{user?.email}</span>
                </div>
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

              <div className="mt-8 pt-6 border-t border-zinc-700">
                <Button onClick={handleLogout} className="w-full bg-red-600/10 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Estadísticas y Actividad */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-[#f0ac00]/20 p-3 rounded-lg text-[#f0ac00]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isLoading ? '-' : myPosts.length}</p>
                  <p className="text-xs text-zinc-400 uppercase font-semibold">Temas Creados</p>
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
            </div>

            {/* Actividad Reciente */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
              <div className="flex border-b border-zinc-700">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'posts' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-750'}`}
                >
                  Mis Temas
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'comments' ? 'text-[#f0ac00] border-b-2 border-[#f0ac00] bg-zinc-700/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-750'}`}
                >
                  Mis Respuestas
                </button>
              </div>

              <div className="p-0 min-h-75">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full pt-20">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    {activeTab === 'posts' && (
                      <div className="divide-y divide-zinc-700">
                        {myPosts.length === 0 ? (
                          <div className="p-10 text-center text-zinc-500">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Aún no creaste ningún tema.</p>
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

                    {activeTab === 'comments' && (
                      <div className="divide-y divide-zinc-700">
                        {myComments.filter(comment => comment.post).length === 0 ? (
                          <div className="p-10 text-center text-zinc-500">
                            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Aún no respondiste en ningún tema.</p>
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
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;