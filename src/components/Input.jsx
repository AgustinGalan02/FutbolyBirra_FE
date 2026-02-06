import { forwardRef } from 'react';

export const Input = forwardRef(({ label, type = "text", error, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* Si pasás un label, se muestra. Si no, no ocupa espacio */}
      {label && (
        <label className="text-sm font-medium text-gray-700 ml-1 my-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-2 rounded-lg border outline-none transition-all my-2
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
          bg-white text-gray-800 placeholder:text-gray-400
        `}
        {...props} 
      />

      {/* Mensaje de error dinámico */}
      {error && (
        <span className="text-xs text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';