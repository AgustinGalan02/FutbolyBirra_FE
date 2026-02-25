import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPostRequest } from '../api/posts';
import { getCommentsByPostRequest, createCommentRequest } from '../api/comments';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { Button } from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, MessageSquare, Shield, Clock, Send } from 'lucide-react';
import '../index.css';

function PostPage() {
    const { id } = useParams(); // Obtenemos el ID de la URL
    const { user } = useAuth(); // Para saber quién comenta
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estado para el nuevo comentario
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPostData = async () => {
            try {
                // Hacemos las dos peticiones en paralelo para que cargue más rápido
                const [postRes, commentsRes] = await Promise.all([
                    getPostRequest(id),
                    getCommentsByPostRequest(id)
                ]);
                setPost(postRes.data);
                setComments(commentsRes.data);
            } catch (error) {
                console.error("Error cargando el post o comentarios:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPostData();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await createCommentRequest({
                content: newComment,
                post: id
            });
            
            // Agregamos manualmente el autor al comentario devuelto para no recargar toda la página
            const commentToAdd = {
                ...res.data,
                author: { username: user.username, team: user.team }
            };
            
            // Actualizamos la lista de comentarios
            setComments([...comments, commentToAdd]);
            setNewComment(""); // Limpiamos la caja de texto
        } catch (error) {
            console.error("Error al publicar comentario:", error);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-[#f0ac00] mb-4">Post no encontrado</h1>
                <Link to="/" className="text-blue-500 hover:underline">Volver al inicio</Link>
            </div>
        );
    }

    const postAuthorTeam = getTeamData(post.author?.team);

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans pb-10">
            {/* Navbar Simple */}
            <div className="bg-zinc-800 border-b border-zinc-700 p-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link 
                        to={`/category/${post.category?._id}`} 
                        className="flex items-center gap-2 text-zinc-400 hover:text-[#f0ac00] transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold truncate max-w-50 sm:max-w-xs">
                            Volver a {post.category?.title}
                        </span>
                    </Link>
                    <span className="text-[#f0ac00] font-bold text-xl hidden md:block">Fútbol y Birra</span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 mt-4 space-y-6">
                
                {/* POST PRINCIPAL */}
                <article className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
                        
                        {/* Info del Autor */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-700">
                            <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center border border-[#f0ac00]">
                                <span className="text-xl font-bold text-[#f0ac00] uppercase">
                                    {post.author?.username?.charAt(0) || '?'}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-zinc-200 uppercase">{post.author?.username || 'Usuario Eliminado'}</p>
                                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                                    <div className="flex items-center gap-1">
                                        {postAuthorTeam.logo ? (
                                            <img src={postAuthorTeam.logo} alt="escudo" className="w-4 h-4 object-contain" />
                                        ) : (
                                            <Shield className="w-4 h-4" />
                                        )}
                                        <span className="font-medium">{postAuthorTeam.name}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="text-zinc-300 whitespace-pre-wrap text-lg leading-relaxed">
                            {post.content}
                        </div>
                    </div>
                </article>

                {/* SECCIÓN DE COMENTARIOS */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-zinc-700/50 p-4 border-b border-zinc-700 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#f0ac00]" />
                        <h2 className="font-bold text-lg text-white">Respuestas ({comments.length})</h2>
                    </div>

                    <div className="divide-y divide-zinc-700">
                        {comments.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <p>No hay respuestas aún. ¡Sé el primero en opinar!</p>
                            </div>
                        ) : (
                            comments.map((comment) => {
                                const commentTeam = getTeamData(comment.author?.team);
                                return (
                                    <div key={comment._id} className="p-6 hover:bg-zinc-750 transition">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-[#f0ac00] uppercase text-sm">
                                                    {comment.author?.username}
                                                </span>
                                                <span className="text-zinc-600">•</span>
                                                {commentTeam.logo && (
                                                    <img src={commentTeam.logo} alt="escudo" className="w-4 h-4 object-contain" title={commentTeam.name}/>
                                                )}
                                                <span className="text-zinc-500 text-xs">
                                                    {formatDate(comment.createdAt || new Date())}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* CAJA PARA COMENTAR */}
                    <div className="p-6 bg-zinc-900/50 border-t border-zinc-700">
                        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-zinc-400">Dejá tu respuesta:</label>
                            <textarea 
                                rows="3"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribí lo que pensás acá..."
                                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all resize-y"
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="flex items-center gap-2 px-6"
                                >
                                    {isSubmitting ? 'Publicando...' : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Responder
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default PostPage;