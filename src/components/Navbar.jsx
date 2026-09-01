import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowLeft, User, LogOut, MessageSquare } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

function Navbar({ showSearch = false, searchTerm = "", setSearchTerm, backTo, backLabel }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = (e) => {
    // Si no le pasamos una ruta específica (backTo), vuelve a la página anterior del historial
    if (!backTo) {
      e.preventDefault();
      navigate(-1);
    }
  };

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700 p-3 sticky top-0 z-50">
      <div className="w-full grid grid-cols-3 items-center px-4">

        <div className="flex items-center gap-6 justify-self-start">
          <Link to="/" className="flex-shrink-0">
            <img src="/logo1.png" alt="Logo" className="w-14 h-14 object-contain" />
          </Link>

          {(backTo || backLabel) && (
            <Link
              to={backTo || "#"}
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-[#f0ac00] transition whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold hidden lg:inline max-w-[150px] truncate">
                {backLabel || "Volver"}
              </span>
            </Link>
          )}
        </div>

        {/* BUSCADOR */}
        <div className="justify-self-center w-full max-w-md">
          {showSearch ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-full py-2 px-10 focus:outline-none focus:border-[#f0ac00] transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-500 w-5 h-5" />
            </div>
          ) : (
            <div className="h-10"></div>
          )}
        </div>

        {/* DERECHA AUTH */}
        <div className="justify-self-end flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationsDropdown />

              <Link
                to="/messages"
                title="Mensajes directos"
                className="p-2 text-zinc-400 hover:text-[#f0ac00] hover:bg-zinc-700/40 rounded-lg transition"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-4 bg-zinc-900/30 p-1 pl-3 rounded-lg border border-zinc-700/50">
                <Link to="/profile" className="flex items-center gap-2 text-zinc-200 hover:text-[#f0ac00] transition cursor-pointer">
                  <User className="w-5 h-5 text-[#f0ac00]" />
                  <span className="font-medium whitespace-nowrap max-w-[100px] truncate">
                    {user?.username}
                  </span>
                </Link>
                <div className="w-[1px] h-6 bg-zinc-700 mx-1"></div>
                <button
                  onClick={() => logout()}
                  className="text-zinc-500 hover:text-red-500 transition p-1.5 rounded-md hover:bg-zinc-700/50 flex-shrink-0 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-zinc-200 hover:text-[#f0ac00] font-medium whitespace-nowrap">Iniciar Sesión</Link>
              <Link to="/register" className="bg-[#f0ac00] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#d49800] transition whitespace-nowrap">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;