import { X, PlusCircle } from 'lucide-react';
import { Button } from './Button';

function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  icon: Icon = PlusCircle,
  children,
  isSubmitting,
  submitLabel = "Publicar",
  isDisabled = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#f0ac00]" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          {/*se inyectan los inputs especifics (children) */}
          {children}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-zinc-300 hover:bg-zinc-700 transition">
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={isSubmitting || isDisabled}>
              {isSubmitting ? 'Procesando...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormModal;