import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCommentsByPostRequest, createCommentRequest, deleteCommentRequest } from '../api/comments';
import { ARGENTINE_TEAMS_LOCAL } from '../api/teamsData';
import { MessageSquare, Shield, Clock, Send, User, Edit, Trash2, Reply, X } from 'lucide-react';
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

    // Ref para manipular la posición del cursor en el textarea de respuesta
    const replyInputRef = useRef(null);

    // ESTADOS PARA MODALES
    const [isDeletePostModalOpen, setIsDeletePostModalOpen] = useState(false);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    // ESTADOS PARA COMENTAR / RESPONDER
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID del comentario raíz del hilo
    const [replyTargetUser, setReplyTargetUser] = useState(""); // Username al que se arroba
    const [replyContent, setReplyContent] = useState("");

    // Función para transformar @username en un enlace <Link>
    const renderFormattedText = (text) => {
        if (!text) return null;
        const words = text.split(' ');
        return words.map((word, index) => {
            if (word.startsWith('@') && word.length > 1) {
                const cleanUsername = word.replace(/^@/, '').replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
                return (
                    <React.Fragment key={index}>
                        <Link
                            to={`/profile/${cleanUsername}`}
                            className="text-[#f0ac00] hover:underline font-semibold cursor-pointer transition inline-block"
                        >
                            @{cleanUsername}
                        </Link>
                        {' '}
                    </React.Fragment>
                );
            }
            return <React.Fragment key={index}>{word} </React.Fragment>;
        });
    };

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
            setComments(comments.filter(c => c._id !== commentToDelete && c.parentComment !== commentToDelete));
            setIsDeleteCommentModalOpen(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error("Error al borrar comentario:", error);
        }
    };

    // Comentario Principal
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await createCommentRequest({ content: newComment, post: id, parentComment: null });
            setComments([...comments, {
                ...res.data,
                author: res.data.author || { _id: user.id || user._id, username: user.username, team: user.team }
            }]);
            setNewComment("");
        } catch (error) {
            console.error("Error al publicar comentario:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Activar el formulario de respuesta y posicionar el cursor al final del @usuario
    const handleStartReply = (rootCommentId, targetUsername, isSubReply = false) => {
        if (replyingTo === rootCommentId && replyTargetUser === targetUsername) {
            setReplyingTo(null);
            setReplyTargetUser("");
            setReplyContent("");
            return;
        }

        const textToInsert = isSubReply ? `@${targetUsername} ` : "";
        setReplyingTo(rootCommentId);
        setReplyTargetUser(targetUsername);
        setReplyContent(textToInsert);

        // Ubica el cursor exactamente al final del texto insertado
        setTimeout(() => {
            if (replyInputRef.current) {
                const length = textToInsert.length;
                replyInputRef.current.focus();
                replyInputRef.current.setSelectionRange(length, length);
            }
        }, 50);
    };

    // Respuesta a un Comentario
    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await createCommentRequest({ content: replyContent, post: id, parentComment: parentId });
            setComments([...comments, {
                ...res.data,
                author: res.data.author || { _id: user.id || user._id, username: user.username, team: user.team }
            }]);
            setReplyContent("");
            setReplyingTo(null);
            setReplyTargetUser("");
        } catch (error) {
            console.error("Error al responder comentario:", error);
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

    // Separamos comentarios raíz y respuestas hijas
    const rootComments = comments.filter(c => !c.parentComment);
    const getRepliesForComment = (parentId) => comments.filter(c => String(c.parentComment) === String(parentId));

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
                                <Link
                                    to={`/profile/${post.author?.username}`}
                                    className="text-xl font-bold text-[#f0ac00] uppercase hover:opacity-80 transition cursor-pointer"
                                >
                                    {post.author?.username?.charAt(0) || '?'}
                                </Link>
                            </div>
                            <div>
                                {post.author?.username ? (
                                    <Link
                                        to={`/profile/${post.author.username}`}
                                        className="font-bold text-zinc-200 hover:text-[#f0ac00] hover:underline uppercase transition cursor-pointer block"
                                    >
                                        {post.author.username}
                                    </Link>
                                ) : (
                                    <p className="font-bold text-zinc-400 uppercase">Usuario Eliminado</p>
                                )}
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
                        <div className="text-zinc-300 whitespace-pre-wrap text-lg leading-relaxed">{renderFormattedText(post.content)}</div>
                    </div>
                </article>

                {/* SECCIÓN DE COMENTARIOS */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-zinc-700/50 p-4 border-b border-zinc-700 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#f0ac00]" />
                        <h2 className="font-bold text-lg text-white">Respuestas ({comments.length})</h2>
                    </div>

                    <div className="divide-y divide-zinc-700">
                        {rootComments.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <p>No hay respuestas aún. ¡Sé el primero en opinar!</p>
                            </div>
                        ) : (
                            rootComments.map((comment) => {
                                const commentTeam = getTeamData(comment.author?.team);
                                const replies = getRepliesForComment(comment._id);

                                return (
                                    <div key={comment._id} className="p-6 hover:bg-zinc-750/50 transition">
                                        {/* Comentario Padre */}
                                        <div className="group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    {comment.author?.username ? (
                                                        <Link
                                                            to={`/profile/${comment.author.username}`}
                                                            className="font-bold text-[#f0ac00] hover:underline uppercase text-sm transition cursor-pointer"
                                                        >
                                                            {comment.author.username}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-bold text-zinc-500 uppercase text-sm">Usuario Eliminado</span>
                                                    )}
                                                    {commentTeam.logo && <img src={commentTeam.logo} alt="escudo" className="w-4 h-4 object-contain" />}
                                                    <span className="text-zinc-500 text-xs">{FormatDate(comment.createdAt)}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isAuthenticated && (
                                                        <button
                                                            onClick={() => handleStartReply(comment._id, comment.author?.username, false)}
                                                            className="text-xs text-zinc-400 hover:text-[#f0ac00] flex items-center gap-1 transition cursor-pointer"
                                                        >
                                                            <Reply className="w-3.5 h-3.5" />
                                                            Responder
                                                        </button>
                                                    )}

                                                    {userId === (comment.author?._id || comment.author?.id) && (
                                                        <button
                                                            onClick={() => { setCommentToDelete(comment._id); setIsDeleteCommentModalOpen(true); }}
                                                            className="text-zinc-500 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                                            title="Borrar comentario"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(comment.content)}</p>
                                        </div>

                                        {/* Respuestas Hijas (Hilos) */}
                                        {replies.length > 0 && (
                                            <div className="mt-4 pl-4 space-y-3 border-l-2 border-zinc-700/60 ml-2">
                                                {replies.map((reply) => {
                                                    const replyTeam = getTeamData(reply.author?.team);
                                                    return (
                                                        <div key={reply._id} className="p-3 bg-zinc-900/40 rounded-lg group">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    {reply.author?.username ? (
                                                                        <Link
                                                                            to={`/profile/${reply.author.username}`}
                                                                            className="font-bold text-[#f0ac00] hover:underline uppercase text-xs transition cursor-pointer"
                                                                        >
                                                                            {reply.author.username}
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="font-bold text-zinc-500 uppercase text-xs">Usuario Eliminado</span>
                                                                    )}
                                                                    {replyTeam.logo && <img src={replyTeam.logo} alt="escudo" className="w-3.5 h-3.5 object-contain" />}
                                                                    <span className="text-zinc-500 text-[11px]">{FormatDate(reply.createdAt)}</span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {isAuthenticated && (
                                                                        <button
                                                                            onClick={() => handleStartReply(comment._id, reply.author?.username, true)}
                                                                            className="text-[11px] text-zinc-400 hover:text-[#f0ac00] flex items-center gap-1 transition cursor-pointer opacity-0 group-hover:opacity-100"
                                                                        >
                                                                            <Reply className="w-3 h-3" />
                                                                            Responder
                                                                        </button>
                                                                    )}

                                                                    {userId === (reply.author?._id || reply.author?.id) && (
                                                                        <button
                                                                            onClick={() => { setCommentToDelete(reply._id); setIsDeleteCommentModalOpen(true); }}
                                                                            className="text-zinc-500 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                                                            title="Borrar respuesta"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-zinc-300 whitespace-pre-wrap text-xs leading-relaxed">{renderFormattedText(reply.content)}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Formulario para Responder dentro del hilo */}
                                        {replyingTo === comment._id && (
                                            <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="mt-4 pl-4 border-l-2 border-[#f0ac00] flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-xs text-[#f0ac00]">
                                                    <span>
                                                        Respondiendo a{' '}
                                                        <Link
                                                            to={`/profile/${replyTargetUser || comment.author?.username}`}
                                                            className="underline font-bold hover:text-white"
                                                        >
                                                            @{replyTargetUser || comment.author?.username}
                                                        </Link>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyTargetUser("");
                                                            setReplyContent("");
                                                        }}
                                                        className="text-zinc-400 hover:text-white cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <textarea
                                                    ref={replyInputRef}
                                                    rows="2"
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Escribí tu respuesta..."
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button type="submit" disabled={isSubmitting || !replyContent.trim()} className="text-xs px-4 py-1.5 flex items-center gap-1">
                                                        {isSubmitting ? 'Enviando...' : <><Send className="w-3 h-3" /> Responder</>}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Formulario para comentario principal del post */}
                    <div className="p-6 bg-zinc-900/50 border-t border-zinc-700">
                        {isAuthenticated ? (
                            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                                <textarea rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribí lo que pensás acá..." className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all" />
                                <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || !newComment.trim()} className="flex items-center gap-2 px-6">{isSubmitting ? 'Publicando...' : <><Send className="w-4 h-4" />Responder al tema</>}</Button></div>
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
                message="Esta respuesta (y sus posibles respuestas anidadas) desaparecerá del foro."
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