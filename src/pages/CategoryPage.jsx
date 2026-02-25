import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostsByCategoryRequest, createPostRequest } from '../api/posts'; // Sumamos createPostRequest
import { getCategoryRequest } from '../api/categories';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { useAuth } from '../context/AuthContext'; // Para saber quién lo crea
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { ArrowLeft, MessageSquare, Shield, Clock, PlusCircle, X } from 'lucide-react'; // Sumamos la X
import '../index.css';

function CategoryPage() {
    const { id } = useParams();
    const { user } = useAuth(); // Traemos el usuario logueado
    const [category, setCategory] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para el Modal del Nuevo Tema
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCategoryData = async () => {
            try {
                const [catRes, postsRes] = await Promise.all([
                    getCategoryRequest(id),
                    getPostsByCategoryRequest(id)
                ]);
                setCategory(catRes.data);
                setPosts(postsRes.data);
            } catch (error) {
                console.error("Error al cargar la categoría", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCategoryData();
    }, [id]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await createPostRequest({
                title: newTitle,
                content: newContent,
                category: id // El ID de la categoría actual (de la URL)
            });

            // Armamos el post nuevo con los datos del creador para sumarlo a la lista sin recargar
            const newPostToAdd = {
                ...res.data,
                author: { username: user.username, team: user.team }
            };

            // Lo agregamos primero en la lista para que se vea arriba de todo
            setPosts([newPostToAdd, ...posts]);
            
            // Limpiamos y cerramos
            setNewTitle("");
            setNewContent("");
            setShowModal(false);
        } catch (error) {
            console.error("Error al crear el tema:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getTeamData = (teamValue) => {
        if (!teamValue || teamValue === "Neutral") {
            return { name: "Seleccion Argentina", logo: "https://media.api-sports.io/football/teams/26.png" };
        }
        const found = ARGENTINE_TEAMS_LOCAL.find(t => String(t.team.id) === String(teamValue));
        return found ? found.team : { name: "Equipo Desconocido", logo: null };
    };

    if (isLoading) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><LoadingSpinner /></div>;

    if (!category) return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-[#f0ac00] mb-4">Categoría no encontrada</h1>
            <Link to="/" className="text-blue-500 hover:underline">Volver al inicio</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans pb-10 relative">
            
            {/* Navbar */}
            <div className="bg-zinc-800 border-b border-zinc-700 p-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-[#f0ac00] transition">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Volver al inicio</span>
                    </Link>
                    <span className="text-[#f0ac00] font-bold text-xl hidden md:block">Fútbol y Birra</span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto p-4 mt-4 space-y-6">
                
                {/* Cabecera de la Categoría */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#f0ac00] uppercase tracking-wide">{category.title}</h1>
                        <p className="text-zinc-400 mt-2 text-lg">{category.description}</p>
                    </div>
                    {/* Botón que abre el modal */}
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-[#f0ac00] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#d49800] transition active:scale-95 flex items-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Nuevo Tema</span>
                    </button>
                </div>

                {/* Lista de Posts */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-zinc-700/50 p-3 flex text-sm font-bold text-zinc-400 uppercase tracking-wider">
                        <div className="flex-1 px-4">Temas en discusión</div>
                        <div className="w-48 px-4 hidden md:block">Creado por</div>
                    </div>

                    <div className="divide-y divide-zinc-700">
                        {posts.length === 0 ? (
                            <div className="p-10 text-center text-zinc-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No hay temas en este foro todavía.</p>
                                <p className="text-sm mt-1">¡Animate a crear el primero!</p>
                            </div>
                        ) : (
                            posts.map((post) => {
                                const authorTeam = getTeamData(post.author?.team);
                                return (
                                    <div key={post._id} className="flex items-center p-4 hover:bg-zinc-750 transition group">
                                        
                                        <div className="flex-1 px-4">
                                            <Link to={`/post/${post._id}`} className="text-lg font-bold text-zinc-200 group-hover:text-[#f0ac00] transition block truncate">
                                                {post.title}
                                            </Link>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDate(post.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="w-48 px-4 hidden md:block border-l border-zinc-700">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-[#f0ac00] uppercase text-sm truncate">
                                                    {post.author?.username || 'Anónimo'}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-zinc-400">
                                                    {authorTeam.logo ? (
                                                        <img src={authorTeam.logo} alt="escudo" className="w-3 h-3 object-contain" />
                                                    ) : (
                                                        <Shield className="w-3 h-3" />
                                                    )}
                                                    <span className="truncate">{authorTeam.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL PARA NUEVO TEMA */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        
                        {/* Header del Modal */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-[#f0ac00]" />
                                Crear un Nuevo Tema
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white transition p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleCreatePost} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">Título del tema</label>
                                <input 
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Ej: Análisis del partido de anoche..."
                                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">Contenido</label>
                                <textarea 
                                    rows="6"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Desarrollá tu idea acá..."
                                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all resize-y"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-700">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg font-bold text-zinc-300 hover:bg-zinc-700 transition"
                                >
                                    Cancelar
                                </button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                                >
                                    {isSubmitting ? 'Publicando...' : 'Publicar Tema'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default CategoryPage;