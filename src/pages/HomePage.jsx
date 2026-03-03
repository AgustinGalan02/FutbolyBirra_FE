import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Clock, MessageCirclePlus, Trash2 } from 'lucide-react';
import { GetCategoriesRequest, createCategoryRequest, deleteCategoryRequest } from '../api/categories';
import { Navbar, FormModal, LoadingSpinner, DeleteModal, Footer, FormatDate } from '../components';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS MODAL CREAR
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCat, setNewCat] = useState({ title: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  // ESTADOS MODAL ELIMINAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    GetCategoriesRequest().then(res => setCategories(res.data)).finally(() => setLoading(false));
  }, []);

  // Lógica Crear
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    const localErrors = [];
    if (!newCat.title.trim()) localErrors.push({ field: "title", message: "El título no puede estar vacío" });
    if (!newCat.description.trim()) localErrors.push({ field: "description", message: "La descripción no puede estar vacía" });
    if (localErrors.length > 0) {
      setFormErrors(localErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCategoryRequest(newCat);
      setCategories([res.data, ...categories]);
      setShowCreateModal(false);
      setNewCat({ title: "", description: "" });
      setFormErrors([]);
    } catch (error) {
      const serverErrors = error.response?.data;
      if (Array.isArray(serverErrors)) {
        setFormErrors(serverErrors);
      } else {
        setFormErrors([{ message: serverErrors?.message || "Error al crear la categoría" }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica Abrir Modal Eliminar
  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  // Lógica Confirmar Eliminación
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryRequest(categoryToDelete._id);
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const titleError = formErrors.find(e => e.field === "title")?.message;
  const descriptionError = formErrors.find(e => e.field === "description")?.message;
  const generalError = formErrors.find(e => !e.field)?.message;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 flex-grow w-full">

        {/* BANNER PARA INVITADOS */}
        {!isAuthenticated && (
          <div className="bg-[#f0ac00]/10 border border-[#f0ac00]/30 p-4 rounded-xl mb-8 text-center animate-pulse shadow-[0_0_15px_rgba(240,172,0,0.1)]">
            <Link to="/register"
            ><p className="text-[#f0ac00] font-bold tracking-tight">
                ¡Registrate para poder subir posts y comentar en el foro!
              </p>
            </Link>
          </div>
        )}

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">FUTBOL Y BIRRA</h1>
            <p className="text-zinc-500 text-sm">Discusión general sobre el fútbol y más</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => { setShowCreateModal(true); setFormErrors([]); }} className="bg-[#f0ac00] text-black px-5 py-2.5 rounded-xl font-bold hover:bg-[#d49800] transition flex items-center gap-2 shadow-lg cursor-pointer">
              <MessageCirclePlus className="w-5 h-5" /> Nueva Categoría
            </button>
          )}
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-zinc-700/50 p-4 flex text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-700 text-center">
            <div className="flex-1 px-4 text-left">Subforo</div>
            <div className="w-32 hidden md:block">Estadísticas</div>
            <div className="w-72 hidden lg:block text-left pl-6">Última Actividad</div>
            {user?.role === 'admin' && <div className="w-16">Acción</div>}
          </div>

          <div className="divide-y divide-zinc-700/50">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center p-5 hover:bg-zinc-700/30 transition-all group">
                {/* Info */}
                <div className="flex-1 flex gap-5 items-center truncate">
                  <div className="bg-zinc-900 p-4 rounded-2xl text-[#f0ac00] group-hover:bg-[#f0ac00] group-hover:text-black transition-all">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <Link to={`/category/${cat._id}`} className="text-xl font-bold text-white group-hover:text-[#f0ac00] transition-colors">{cat.title}</Link>
                    <p className="text-zinc-400 text-sm line-clamp-1">{cat.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-32 text-center hidden md:block border-x border-zinc-700/50">
                  <div className="text-white font-black text-lg">{cat.postCount || 0}</div>
                  <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Temas</div>
                </div>

                {/* Último Mensaje */}
                <div className="w-72 px-6 hidden lg:block text-sm">
                  {cat.lastPostTitle ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-100 font-semibold truncate">
                        <Clock className="w-3.5 h-3.5 text-[#f0ac00]" />
                        <span className="truncate">{cat.lastPostTitle}</span>
                      </div>
                      <div className="text-zinc-500 text-xs">
                        por <span className="text-zinc-300 font-medium">{cat.lastPostAuthor || 'Usuario'}</span><br />
                        <span className="text-[10px] uppercase opacity-70">{FormatDate(cat.lastPostDate)}</span>
                      </div>
                    </div>
                  ) : <span className="text-zinc-600 italic text-xs">Sin actividad</span>}
                </div>

                {/* BOTÓN ELIMINAR (Solo Admin) */}
                {user?.role === 'admin' && (
                  <div className="w-16 flex justify-center">
                    <button onClick={() => openDeleteModal(cat)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />

      {/* MODAL CREAR */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormErrors([]); }}
        onSubmit={handleCreateCategory}
        title="Nueva Categoría"
        icon={MessageCirclePlus}
        isSubmitting={isSubmitting}
        submitLabel="Crear"
      >
        <div className="space-y-4">
          {generalError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <span className="text-red-500 text-sm font-medium">{generalError}</span>
            </div>
          )}
          <div>
            <input
              type="text"
              placeholder="Título"
              value={newCat.title}
              onChange={e => { setNewCat({ ...newCat, title: e.target.value }); setFormErrors(prev => prev.filter(err => err.field !== "title")); }}
              className={`w-full bg-zinc-900 border rounded-xl p-3 text-white outline-none focus:ring-1 ${titleError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-[#f0ac00]'}`}
            />
            {titleError && <span className="text-red-500 text-xs font-medium mt-1 block">{titleError}</span>}
          </div>
          <div>
            <textarea
              placeholder="Descripción"
              value={newCat.description}
              onChange={e => { setNewCat({ ...newCat, description: e.target.value }); setFormErrors(prev => prev.filter(err => err.field !== "description")); }}
              className={`w-full bg-zinc-900 border rounded-xl p-3 text-white outline-none focus:ring-1 resize-none ${descriptionError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-[#f0ac00]'}`}
              rows="3"
            />
            {descriptionError && <span className="text-red-500 text-xs font-medium mt-1 block">{descriptionError}</span>}
          </div>
        </div>
      </FormModal>

      {/* DELETEMODAL */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar "${categoryToDelete?.title}"? Esta acción borrará todos los posts asociados y no se puede deshacer.`}
      />
    </div>

  );
}

export default HomePage;