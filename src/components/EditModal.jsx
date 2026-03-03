import { X, Edit, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';

// Modal para editar posts o comentarios
function EditModal({ isOpen, onClose, onSave, post }) { 
    const [editTitle, setEditTitle] = useState(""); // titulo del post (solo posts)
    const [editContent, setEditContent] = useState(""); // contenido a editar

    useEffect(() => { // carga datos cuando se abre o cambia post
        if (post) {
            setEditTitle(post.title || ""); // inicializa titulo
            setEditContent(post.content || ""); // inicializa contenido
        }
    }, [post, isOpen]);

    if (!isOpen) return null; // no renderiza si está cerrado

    const handleSubmit = (e) => {
        e.preventDefault(); 
        onSave(editTitle, editContent); // pasa titulo y contenido al componente padre
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit className="w-5 h-5 text-[#f0ac00]" />
                        {post?.title !== undefined ? "Editar Tema" : "Editar Respuesta"}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition p-1 cursor-pointer"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {post?.title !== undefined && ( // muestra input de titulo solo si es un post (tiene title)
                        <div>
                            <label className="block text-sm font-semibold text-zinc-400 mb-2">Título del tema</label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                            {post?.title !== undefined ? "Contenido" : "Tu respuesta"}
                        </label>
                        <textarea
                            rows="6"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-[#f0ac00] transition-all resize-y"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-zinc-300 hover:bg-zinc-700 transition cursor-pointer">Cancelar</button>
                        <Button type="submit" className="flex items-center gap-2 px-6">
                            <Send className="w-4 h-4" /> Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;