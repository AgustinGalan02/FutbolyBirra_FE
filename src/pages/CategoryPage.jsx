import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostsByCategoryRequest, createPostRequest } from '../api/posts';
import { getCategoryRequest } from '../api/categories';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Shield, Clock, PlusCircle, User } from 'lucide-react';
import '../index.css';
import { Footer, FormModal, Navbar, LoadingSpinner, FormatDate } from '../components/';

function CategoryPage() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [category, setCategory] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADOS PARA EL MODAL DE NUEVO TEMA
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
                console.error("Error al cargar las categorias: ", error);
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
                category: id
            });
            const newPostToAdd = {
                ...res.data,
                author: { username: user.username, team: user.team }
            };
            setPosts([newPostToAdd, ...posts]);

            // Limpiamos y cerramos
            setNewTitle("");
            setNewContent("");
            setShowModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error al crear el tema.";
            setErrors([errorMessage]);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (!category) return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-[#f0ac00] mb-4">Categoría no encontrada</h1>
            <Link to="/" className="text-blue-500 hover:underline">Volver al inicio</Link>
        </div>
    );

    const filteredPosts = posts.filter(post => {
        const term = searchTerm.toLowerCase();
        return (post.title?.toLowerCase() || "").includes(term) ||
            (post.author?.username?.toLowerCase() || "").includes(term);
    });

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans flex flex-col">
            <Navbar
                showSearch={true}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                backTo="/"
                backLabel="Volver"
            />

            <main className="max-w-5xl mx-auto p-4 mt-4 space-y-6 flex-grow w-full">
                {/* Cabecera */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#f0ac00] uppercase tracking-wide">{category.title}</h1>
                        <p className="text-zinc-400 mt-2 text-lg">{category.description}</p>
                    </div>

                    {isAuthenticated && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-[#f0ac00] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#d49800] transition active:scale-95 flex items-center gap-2"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">Nuevo Tema</span>
                        </button>
                    )}
                </div>

                {/* Lista de Posts */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-zinc-700/50 p-3 flex text-sm font-bold text-zinc-400 uppercase tracking-wider">
                        <div className="flex-1 px-4">Temas en discusión</div>
                        <div className="w-48 px-4 hidden md:block border-l border-zinc-700">Creado por</div>
                    </div>

                    <div className="divide-y divide-zinc-700">
                        {filteredPosts.length === 0 ? (
                            <div className="p-10 text-center text-zinc-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No se encontraron temas.</p>
                            </div>
                        ) : (
                            filteredPosts.map((post) => {
                                const authorTeam = getTeamData(post.author?.team);
                                return (
                                    <div key={post._id} className="flex items-center p-4 hover:bg-zinc-750 transition group">
                                        <div className="flex-1 px-4">
                                            <Link to={`/post/${post._id}`} className="text-lg font-bold text-zinc-200 group-hover:text-[#f0ac00] transition block truncate">
                                                {post.title}
                                            </Link>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                                                <Clock className="w-3 h-3" />
                                                <span>{FormatDate(post.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="w-48 px-4 hidden md:block border-l border-zinc-700">
                                            <span className="font-bold text-[#f0ac00] uppercase text-sm block truncate">
                                                {post.author?.username || 'Anónimo'}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                                                {authorTeam.logo ? <img src={authorTeam.logo} alt="escudo" className="w-3 h-3 object-contain" /> : <Shield className="w-3 h-3" />}
                                                <span className="truncate">{authorTeam.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
            <Footer></Footer>

            {/* MODAL PARA NUEVO TEMA */}
            <FormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreatePost}
                title="Crear un Nuevo Tema"
                icon={PlusCircle}
                isSubmitting={isSubmitting}
                submitLabel="Publicar Tema"
                isDisabled={!newTitle.trim() || !newContent.trim()}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">Título del tema</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">Contenido</label>
                        <textarea
                            rows="6"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all resize-y"
                            required
                        />
                    </div>
                </div>
            </FormModal>
        </div>
    );
}

export default CategoryPage;