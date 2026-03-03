import { Trash2 } from 'lucide-react'; // icono de papelera

function DeleteModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null; // no renderizar si está cerrado

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-zinc-400 mb-6 text-sm">{message}</p>
        <div className="flex gap-3"> {/* botones en fila */}
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl transition cursor-pointer">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition cursor-pointer">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
export default DeleteModal;