import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MessageSquare, Clock, User } from 'lucide-react';
import { GetCategoriesRequest } from '../api/categories';
import LoadingSpinner from '../components/LoadingSpinner';
import FormatDate from '../components/FormatDate';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await GetCategoriesRequest();
        setCategories(res.data);
        setLoadingCategories(false);
      } catch (error) {
        console.error("Error al cargar categorias", error);
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  if (loadingCategories) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 font-sans">
      {/* NAVBAR */}
      <nav className="bg-zinc-800 border-b border-zinc-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="../src/assets/logo1.png" alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-[#f0ac00] font-bold text-xl hidden md:block">Fútbol y Birra</span>
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar posts..."
                className="w-full bg-zinc-900 border border-zinc-600 rounded-full py-2 px-10 focus:outline-none focus:border-[#f0ac00] transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-500 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-2 hover:text-[#f0ac00] transition">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.username}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#f0ac00] transition font-medium">Iniciar Sesión</Link>
                <Link to="/register" className="bg-[#f0ac00] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#d49800] transition active:scale-95">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {!isAuthenticated && (
          <div className="bg-[#f0ac00]/10 border border-[#f0ac00]/30 p-4 rounded-xl mb-8 text-center">
            <p className="text-[#f0ac00] font-medium">¡Registrate para escribir o responder temas!</p>
          </div>
        )}

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-zinc-700/50 p-3 flex text-sm font-bold text-zinc-400 uppercase tracking-wider">
            <div className="flex-1 px-4">Foros Temáticos</div>
            <div className="w-32 text-center hidden md:block">Temas</div>
            <div className="w-64 px-4 hidden lg:block">Último mensaje</div>
          </div>

          <div className="divide-y divide-zinc-700">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center p-4 hover:bg-zinc-750 transition-colors group">
                {/* Info del Foro */}
                <div className="flex-1 flex gap-4 items-center">
                  <div className="bg-zinc-900 p-3 rounded-full text-[#f0ac00] group-hover:bg-[#f0ac00] group-hover:text-black transition">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <Link to={`/category/${cat._id}`} className="text-lg font-bold text-[#f0ac00] hover:underline">
                      {cat.title}
                    </Link>
                    <p className="text-zinc-400 text-sm">{cat.description}</p>
                  </div>
                </div>

                {/* Estadísticas*/}
                <div className="w-32 text-center hidden md:block border-x border-zinc-700 text-sm">
                  <div className="text-zinc-200 font-semibold">{cat.postCount || 0}</div>
                  <div className="text-zinc-500 text-xs uppercase font-bold">Posts</div>
                </div>

                {/* Último Post*/}
                <div className="w-64 px-4 hidden lg:block text-sm">
                  {cat.lastPostTitle ? (
                    <>
                      <div className="flex items-center gap-1 text-zinc-200 font-medium truncate">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="truncate" title={cat.lastPostTitle}>
                          {cat.lastPostTitle}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-xs mt-1">
                        por <Link to={`/api/${cat.lastPostAuthor._id}`} className="text-[#f0ac00] hover:underline">{cat.lastPostAuthor.name}</Link>
                        <br />
                        <span className="text-zinc-500">
                          {(() => {
                            const d = new Date(cat.lastPostDate);
                            const date = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).slice(-2)}`;
                            const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            return `${date} ${time} hs`;
                          })()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-zinc-500 italic text-xs">Sin actividad</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;