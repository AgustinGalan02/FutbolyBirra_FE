import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCommentsByPostRequest, createCommentRequest, deleteCommentRequest } from '../api/comments';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { MessageSquare, Shield, Clock, Send, User, Edit, Trash2 } from 'lucide-react';
import { getPostRequest, deletePostRequest, updatePostRequest } from '../api/posts';
import '../index.css';
import { Footer, EditModal, DeleteModal, Navbar, FormatDate, LoadingSpinner, Button } from '../components/';

function PostPage() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // ESTADOS PARA MODALES
    const [isDeletePostModalOpen, setIsDeletePostModalOpen] = useState(false);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- LÓGICA DE POSTS ---
    const handleDeletePost = async () => {
        try {
            await deletePostRequest(post._id);
            setIsDeletePostModalOpen(false);
            navigate(`/category/${post.category?._id}`);
        } catch (error) {
            console.error("Error al borrar el post:", error);
        }
    };

    const handleUpdatePost = async (newTitle, newContent) => {
        try {
            const res = await updatePostRequest(post._id, { title: newTitle, content: newContent });
            setPost({
                ...res.data,
                author: post.author,
                category: post.category
            });
            setIsEditPostModalOpen(false);
        } catch (error) {
            console.error("Error al editar el post:", error);
        }
    };

    // --- LÓGICA DE COMENTARIOS ---
    const handleDeleteComment = async () => {
        try {
            await deleteCommentRequest(commentToDelete);
            setComments(comments.filter(c => c._id !== commentToDelete));
            setIsDeleteCommentModalOpen(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error("Error al borrar comentario:", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await createCommentRequest({ content: newComment, post: id });
            // Agregamos el comentario a la lista con la info del usuario actual
            setComments([...comments, {
                ...res.data,
                author: { _id: user.id, username: user.username, team: user.team }
            }]);
            setNewComment("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadPostData = async () => {
            try {
                const [postRes, commentsRes] = await Promise.all([
                    getPostRequest(id),
                    getCommentsByPostRequest(id)
                ]);
                setPost(postRes.data);
                setComments(commentsRes.data);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPostData();
    }, [id]);

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

    if (isLoading) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><LoadingSpinner /></div>;
    if (!post) return <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col items-center justify-center"><h1 className="text-2xl font-bold text-[#f0ac00] mb-4">
        Post no encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">Volver al inicio</Link>
    </div>;

    const userId = user?.id || user?._id;
    const postAuthorTeam = getTeamData(post.author?.team);

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans flex flex-col">
            <Navbar backLabel="Volver" />

            <main className="max-w-4xl mx-auto p-4 mt-4 space-y-6 flex-grow w-full">

                {/* POST PRINCIPAL */}
                <article className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-3xl font-bold text-white">{post.title}</h1>
                            {userId === post.author?._id && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsEditPostModalOpen(true)} className="p-2 text-zinc-400 hover:text-[#f0ac00] transition-colors cursor-pointer" title="Editar tema"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => setIsDeletePostModalOpen(true)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer" title="Borrar tema"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-700">
                            <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center border border-[#f0ac00]">
                                <span className="text-xl font-bold text-[#f0ac00] uppercase">{post.author?.username?.charAt(0) || '?'}</span>
                            </div>
                            <div>
                                <p className="font-bold text-zinc-200 uppercase">{post.author?.username || 'Usuario Eliminado'}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                                    <div className="flex items-center gap-1">
                                        {postAuthorTeam.logo ? <img src={postAuthorTeam.logo} alt="escudo" className="w-4 h-4 object-contain" /> : <Shield className="w-4 h-4" />}
                                        <span className="font-medium">{postAuthorTeam.name}</span>
                                    </div>
                                    <span>•</span>
                                    <span><b>Publicado: </b>{FormatDate(post.createdAt)}</span>
                                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                                        <>
                                            <span className="text-zinc-600">•</span>
                                            <div className="flex items-center gap-1 text-[#f0ac00]/80">
                                                <Edit className="w-3 h-3" />
                                                <span className="italic">
                                                    <b>Última edición:</b> {FormatDate(post.updatedAt)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-zinc-300 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</div>
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
                                    <div key={comment._id} className="p-6 hover:bg-zinc-750 transition group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-[#f0ac00] uppercase text-sm">{comment.author?.username}</span>
                                                {commentTeam.logo && <img src={commentTeam.logo} alt="escudo" className="w-4 h-4 object-contain" />}
                                                <span className="text-zinc-500 text-xs">{FormatDate(comment.createdAt)}</span>
                                            </div>
                                            {userId === comment.author?._id && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setCommentToDelete(comment._id); setIsDeleteCommentModalOpen(true); }}
                                                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                                                        title="Borrar comentario"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-6 bg-zinc-900/50 border-t border-zinc-700">
                        {isAuthenticated ? (
                            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                                <textarea rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribí lo que pensás acá..." className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all" />
                                <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || !newComment.trim()} className="flex items-center gap-2 px-6">{isSubmitting ? 'Publicando...' : <><Send className="w-4 h-4" />Responder</>}</Button></div>
                            </form>
                        ) : (
                            <Link to="/register" className="bg-[#f0ac00]/10 border border-[#f0ac00]/30 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#f0ac00]/20 transition-all group"><User className="w-5 h-5 text-[#f0ac00]" /><p className="text-[#f0ac00] font-medium">¡Registrate para responder posts!</p></Link>
                        )}
                    </div>
                </div>
            </main>
            <Footer></Footer>

            {/* MODALES */}
            <DeleteModal
                isOpen={isDeletePostModalOpen}
                onClose={() => setIsDeletePostModalOpen(false)}
                onConfirm={handleDeletePost}
                title="¿Eliminar este tema?"
                message="Se borrará el post y todas sus respuestas de forma permanente."
            />

            <DeleteModal
                isOpen={isDeleteCommentModalOpen}
                onClose={() => { setIsDeleteCommentModalOpen(false); setCommentToDelete(null); }}
                onConfirm={handleDeleteComment}
                title="¿Borrar comentario?"
                message="Esta respuesta desaparecerá del foro."
            />

            <EditModal
                isOpen={isEditPostModalOpen}
                onClose={() => setIsEditPostModalOpen(false)}
                post={post}
                onSave={handleUpdatePost}
            />
        </div>
    );
}

export default PostPage;