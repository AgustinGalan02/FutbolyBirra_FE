import { forwardRef } from 'react';

export const Input = forwardRef(({ label, type = "text", error, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full gap-1.5"> 
      {/* Muestra label solo si se proporciona */}
      {label && (
        <label className="text-sm font-medium text-gray-700 ml-1 my-2"> 
          {label}
        </label>
      )}

      <input
        ref={ref} // permite acceder al input desde el padre
        type={type} // tipo de input
        className={` {/* estilos condicionales según error */}
          w-full px-4 py-2 rounded-lg border outline-none transition-all my-2
          ${error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'} {/* sin error: borde gris */}
      bg-white text-gray-800 placeholder:text-gray-400
        `}
      {...props}/>
      {error && (
        <span className="text-xs text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
});